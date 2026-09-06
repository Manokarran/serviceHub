'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import {
  applyAiGeneratedSiteAction,
  generateAiSitePreviewAction
} from '@/app/actions/ai-site-wizard.actions'
import { proposeDesignRestyleAction, rewordDesignScopeAction } from '@/app/actions/ai-design-studio.actions'
import { listSuggestedBasePagesAction } from '@/app/actions/site-page.actions'
import { useSiteWorkspaceOptional } from '@/features/site-templates/context/SiteWorkspaceContext'
import { inferDesignProfile } from '@/lib/ai-design-studio/brief-inference'
import type { DesignProposal, DesignScope } from '@/lib/ai-design-studio/types'
import type { AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'
import { buildAiBuilderContext } from '@/lib/ai-builder/context'
import { getRequestedAiBuilderBlocks, createLocalAiBuilderPlan } from '@/lib/ai-builder/planner'
import {
  isOpenCreatePageListIntent,
  parseAddBasePageIntent,
  type SuggestedBasePage
} from '@/lib/ai-builder/suggested-base-pages'
import {
  fixNavigationOnBlocks,
  isFixNavigationIntent,
  summarizeNavigationFixes
} from '@/lib/ai-builder/fix-navigation'
import { planAiBuilderCommandAction } from '@/app/actions/ai-builder.actions'
import { notifyCreditsChanged } from '@/components/layout/shared/CreditsBadge'
import { SITE_THEME_PRESETS } from '../constants/siteStylePresets'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { useBuilder } from '../context/BuilderContext'
import { useBuilderShell } from '../context/BuilderShellContext'
import { flattenBlocks } from '../utils/blockTreeUtils'
import { planAiInsertAtTarget } from '../utils/aiInsertAtTarget'
import { resolveAiInsertTarget } from '../utils/quickAddHelpers'
import { BuilderFloatingFrame, DockToolButton } from './BuilderFloatingFrame'
import { createBlock } from '../utils/blockFactory'
import type { PanelRect, PanelSize } from '../utils/builderPanelFrame'
import type { BuilderDraftSnapshot } from '../context/BuilderContext'
import type { AiBuilderPlan } from '@/lib/ai-builder/types'

type Props = {
  open: boolean
  pinned: boolean
  rect: PanelRect | null
  onCommit: (next: PanelRect, parent: PanelSize) => void
  onEnsureLayout: (parent: PanelSize) => void
  onMaximize: () => void
  onPinnedChange: (pinned: boolean) => void
  onClose: () => void
}

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string

  /** Per-operation outcomes, shown as fine print under the reply. */
  details?: string[]
}

type UndoEntry = {
  snapshot: BuilderDraftSnapshot
  label: string
}

const MAX_UNDO_STEPS = 10

/** A redesign of everything is the one change big enough to be worth confirming first. */
const REDESIGN_INTENT =
  /\b(redesign|restyle|re-?style|revamp|refresh|makeover|new look|different look|another look|reskin|wow)\b/i

const BACKGROUND_INTENT =
  /\b(animated?|moving|motion|gradient)\s+(background|backdrop|fill)|\b(background|backdrop)\s+(animated?|moving|gradient)\b/i

const REWORD_INTENT = /\b(reword|rewrite|re-?write|rephrase|reword|wording|copywriting|punchier|snappier)\b/i

const COPY_TARGET = /\b(copy|text|headline|wording|words)\b/i

/** Phrases that mean "the whole page", even while a control happens to be selected. */
const PAGE_OVERRIDE = /\b(whole|entire|full|complete)\s+(page|site|website|thing)\b|\bthis page\b|\bthe page\b|\beverything\b/i

const CREATION_INTENT = /\b(build|create|generate|launch|start)\b/i

const COMPANY_PATTERN = /(?:for|called|named)\s+([a-z0-9][a-z0-9 &.'-]{1,80})/i

/**
 * Each shortcut states which intent it runs, so a phrase like "premium dark look" reaches
 * the art director instead of being guessed at by the free-text router.
 */
type QuickAction = {
  label: string
  kind: 'restyle' | 'reword' | 'fix-nav'
  instruction?: string
}

const PAGE_ACTIONS: QuickAction[] = [
  { label: 'Redesign this page', kind: 'restyle' },
  { label: 'Premium and dark', kind: 'restyle', instruction: 'luxurious and premium in dark mode' },
  { label: 'Warm and editorial', kind: 'restyle', instruction: 'warm editorial feel with generous space and big photography' },
  { label: 'Animated backdrop', kind: 'restyle', instruction: 'use a theme-matched animated gradient background with tasteful motion' },
  { label: 'Rewrite the copy', kind: 'reword' },
  { label: 'Fix Navigation', kind: 'fix-nav' }
]

const CONTROL_ACTIONS: QuickAction[] = [
  { label: 'Redesign this', kind: 'restyle' },
  { label: 'Reword this', kind: 'reword' },
  { label: 'Photo background', kind: 'restyle', instruction: 'use a photographic background that suits this business' },
  { label: 'Animated backdrop', kind: 'restyle', instruction: 'use a theme-matched animated gradient background with tasteful motion' }
]

function newNonce(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Generating a whole site replaces every page, so only take that path when the request is
 * clearly about the site as a whole and nothing is selected.
 */
function isCreationPrompt(prompt: string, hasSelection: boolean, blockCount: number) {
  if (hasSelection || !CREATION_INTENT.test(prompt)) {
    return false
  }

  if (/\b(add|insert|update|change|edit|set|move|remove|restyle|redesign|align|resize)\b/i.test(prompt)) {
    return false
  }

  return /\b(site|website|pages?|brand|business)\b/i.test(prompt) || blockCount === 0
}

function augmentGeneratedPreview(
  preview: AiSiteGenerationPreview,
  prompt: string
): { preview: AiSiteGenerationPreview; addedLabels: string[] } {
  const requests = getRequestedAiBuilderBlocks(prompt)
  const pages = preview.pages.map(page => ({ ...page, blocks: [...page.blocks] }))
  const sharedStyles = pages.find(page => page.slug === 'home')?.siteStyles ?? pages[0]?.siteStyles ?? null
  const addedLabels: string[] = []

  for (const request of requests) {
    const preferredSlug =
      request.type === 'contactForm' || request.type === 'location'
        ? 'contact'
        : request.type === 'pricing'
          ? 'pricing'
          : 'home'

    const pageIndex = pages.findIndex(page => page.slug === preferredSlug)
    const fallbackIndex = pageIndex === -1 ? pages.findIndex(page => page.slug === 'home') : pageIndex
    const targetPage = pages[fallbackIndex === -1 ? 0 : fallbackIndex]

    if (!targetPage || flattenBlocks(targetPage.blocks).some(block => block.type === request.type) || !sharedStyles) {
      continue
    }

    targetPage.blocks = [...targetPage.blocks, createBlock(request.type, sharedStyles, request.paletteId)]
    addedLabels.push(request.label)
  }

  if (addedLabels.length === 0) {
    return { preview, addedLabels }
  }

  return {
    preview: {
      ...preview,
      pages,
      generationNotes: [...preview.generationNotes, `Added requested controls: ${addedLabels.join(', ')}.`]
    },
    addedLabels
  }
}

function ProposalCard({
  proposal,
  busy,
  onApply,
  onRetry,
  onDiscard
}: {
  proposal: DesignProposal
  busy: boolean
  onApply: () => void
  onRetry: () => void
  onDiscard: () => void
}) {
  const theme = useTheme()

  const swatches = [
    proposal.palette.background,
    proposal.palette.surface,
    proposal.palette.accent,
    proposal.palette.gradientStart,
    proposal.palette.gradientEnd
  ]

  const photoPreviews = proposal.photoPreviews ?? []

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        overflow: 'hidden'
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1 }}>
        <Typography variant='caption' sx={{ fontWeight: 800, letterSpacing: 0.4, color: 'primary.main' }}>
          {`PROPOSED FOR ${proposal.targetLabel.toUpperCase()}`}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', mt: 0.25 }}>{proposal.concept}</Typography>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}>
          {proposal.rationale}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', height: 26, mx: 1.5, borderRadius: 1, overflow: 'hidden' }}>
        {swatches.map((color, index) => (
          <Box key={`${color}-${index}`} sx={{ flex: 1, backgroundColor: color }} />
        ))}
      </Box>
      {photoPreviews.length > 0 ? (
        <Box sx={{ px: 1.5, pt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography variant='caption' sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.68rem' }}>
            Photography preview
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: photoPreviews.length === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
              gap: 0.75
            }}
          >
            {photoPreviews.slice(0, 4).map((photo, index) => (
              <Box
                key={`${photo.url}-${index}`}
                sx={{
                  position: 'relative',
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  aspectRatio: photoPreviews.length === 1 ? '16 / 9' : '4 / 3',
                  backgroundColor: alpha(theme.palette.text.primary, 0.06),
                  boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.08)}`
                }}
              >
                <Box
                  component='img'
                  src={photo.url}
                  alt={photo.alt}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 6,
                    bottom: 6,
                    px: 0.75,
                    py: 0.2,
                    borderRadius: 999,
                    backgroundColor: alpha(theme.palette.common.black, 0.55),
                    color: '#fff',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                  }}
                >
                  {photo.label}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
      <Box sx={{ px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
        {proposal.highlights.map((highlight, index) => (
          <Typography key={`highlight-${index}`} variant='caption' color='text.secondary' sx={{ fontSize: '0.69rem' }}>
            {`• ${highlight}`}
          </Typography>
        ))}
      </Box>
      <Divider />
      <Box sx={{ p: 1, display: 'flex', gap: 0.75, alignItems: 'center' }}>
        <Button size='small' variant='contained' onClick={onApply} disabled={busy} sx={{ flex: 1, fontSize: '0.72rem' }}>
          Apply
        </Button>
        <Button size='small' variant='outlined' onClick={onRetry} disabled={busy} sx={{ fontSize: '0.72rem' }}>
          Try another
        </Button>
        <Button size='small' variant='text' color='inherit' onClick={onDiscard} disabled={busy} sx={{ fontSize: '0.72rem' }}>
          Discard
        </Button>
      </Box>
    </Box>
  )
}

function ThemePicker({
  selectedThemeId,
  onSelect,
  onApply,
  onCancel
}: {
  selectedThemeId: string | null
  onSelect: (themeId: string) => void
  onApply: () => void
  onCancel: () => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 1.5, py: 1.25, flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Choose a theme</Typography>
        <Typography variant='caption' color='text.secondary'>
          Applying a theme also repaints controls that still use the current palette.
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {SITE_THEME_PRESETS.map(preset => {
          const isSelected = selectedThemeId === preset.id
          const colors = preset.styles.colors

          return (
            <Box
              key={preset.id}
              component='button'
              type='button'
              onClick={() => onSelect(preset.id)}
              aria-pressed={isSelected}
              sx={{
                textAlign: 'left',
                p: 1.25,
                borderRadius: 2,
                border: `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.1)}`,
                backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': { borderColor: theme.palette.primary.main }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                <Typography sx={{ fontWeight: 750, fontSize: '0.78rem' }}>{preset.name}</Typography>
                {isSelected ? <i className='ri-check-line' style={{ color: theme.palette.primary.main }} /> : null}
              </Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                {preset.description}
              </Typography>
              <Box sx={{ display: 'flex', height: 28, overflow: 'hidden', borderRadius: 1 }}>
                {[colors.swatch1, colors.swatch2, colors.swatch3, colors.swatch4, colors.swatch5].map((color, index) => (
                  <Box key={`${preset.id}-${index}`} sx={{ flex: 1, backgroundColor: color }} />
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 1.5 }}>
        <Button size='small' variant='outlined' onClick={onCancel}>
          Cancel
        </Button>
        <Button size='small' variant='contained' onClick={onApply} disabled={!selectedThemeId}>
          Apply theme
        </Button>
      </Box>
    </Box>
  )
}

function CreatePagePicker({
  pages,
  busy,
  creatingSlug,
  onCreate,
  onCancel
}: {
  pages: SuggestedBasePage[]
  busy: boolean
  creatingSlug: string | null
  onCreate: (slug: string) => void
  onCancel: () => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 1.5, py: 1.25, flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Create a page</Typography>
        <Typography variant='caption' color='text.secondary'>
          Pick a page from the base design. It will match your current theme, background, and motion.
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {pages.length === 0 ? (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.text.primary, 0.18)}`,
              textAlign: 'center'
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              You already have every base page. Create a blank page from the Pages panel if you need another.
            </Typography>
          </Box>
        ) : (
          pages.map(page => {
            const isCreating = creatingSlug === page.slug

            return (
              <Box
                key={page.slug}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.25,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <i
                    className={
                      page.slug === 'contact'
                        ? 'ri-mail-line'
                        : page.slug === 'about'
                          ? 'ri-information-line'
                          : page.slug === 'pricing'
                            ? 'ri-price-tag-3-line'
                            : 'ri-file-text-line'
                    }
                  />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 750, fontSize: '0.8rem' }}>{page.title}</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.4 }}>
                    {page.description}
                  </Typography>
                </Box>
                <Button
                  size='small'
                  variant='contained'
                  onClick={() => onCreate(page.slug)}
                  disabled={busy || Boolean(creatingSlug)}
                  sx={{ flexShrink: 0, fontSize: '0.7rem', minWidth: 72 }}
                >
                  {isCreating ? 'Creating…' : 'Create'}
                </Button>
              </Box>
            )
          })
        )}
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
        <Button size='small' variant='outlined' onClick={onCancel} disabled={Boolean(creatingSlug)}>
          Back
        </Button>
      </Box>
    </Box>
  )
}

export function AiWebsiteChat({
  open,
  pinned,
  rect,
  onCommit,
  onEnsureLayout,
  onMaximize,
  onPinnedChange,
  onClose
}: Props) {
  const theme = useTheme()
  const isDesktopLayout = useMediaQuery(theme.breakpoints.up('lg'))
  const router = useRouter()

  const {
    blocks,
    selectedBlock,
    siteStyles,
    currentPageSlug,
    pages,
    tenantSlug,
    builderScope,
    applyAiPlan,
    applyAiDesign,
    applyThemePreset,
    restoreDraft,
    addBasePageFromTemplate
  } = useBuilder()

  const shell = useBuilderShell()
  const aiInsertIntent = shell?.aiInsertIntent ?? null
  const workspace = useSiteWorkspaceOptional()

  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const [createPagePickerOpen, setCreatePagePickerOpen] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(siteStyles.themeId)
  const [scope, setScope] = useState<DesignScope>('page')
  const [rewriteCopy, setRewriteCopy] = useState(false)
  const [proposal, setProposal] = useState<DesignProposal | null>(null)
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])
  const [suggestedPages, setSuggestedPages] = useState<SuggestedBasePage[]>([])
  const [addingPageSlug, setAddingPageSlug] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Pick what to work on, then choose Redesign or Reword. A page redesign gives you a full art direction — palette, type, spacing, motion, and photography — to review before anything changes.'
    }
  ])

  const existingPageSlugs = useMemo(
    () => new Set(pages.map(page => page.slug.toLowerCase())),
    [pages]
  )

  const visibleSuggestions = useMemo(
    () => suggestedPages.filter(page => !existingPageSlugs.has(page.slug.toLowerCase())),
    [suggestedPages, existingPageSlugs]
  )

  const { context, refToId } = useMemo(
    () =>
      buildAiBuilderContext({
        pageSlug: currentPageSlug,
        blocks,
        siteStyles,
        selectedBlock: scope === 'control' ? selectedBlock : null
      }),
    [blocks, currentPageSlug, scope, selectedBlock, siteStyles]
  )

  // Selecting a control is a statement of intent; clearing it puts us back on the page.
  const selectedBlockId = selectedBlock?.id ?? null

  useEffect(() => {
    setScope(selectedBlockId ? 'control' : 'page')
    setProposal(null)
  }, [selectedBlockId])

  useEffect(() => {
    setProposal(null)
  }, [currentPageSlug])

  useEffect(() => {
    if (!open || builderScope !== 'organization') {
      return
    }

    let cancelled = false

    void listSuggestedBasePagesAction(builderScope).then(result => {
      if (cancelled || !result.success) {
        return
      }

      setSuggestedPages(result.pages)
    })

    return () => {
      cancelled = true
    }
  }, [open, builderScope, pages.length])

  useEffect(() => {
    if (visibleSuggestions.length === 0 && createPagePickerOpen) {
      setCreatePagePickerOpen(false)
    }
  }, [visibleSuggestions.length, createPagePickerOpen])

  const appendMessage = (role: ChatMessage['role'], text: string, details?: string[]) => {
    setMessages(current => [
      ...current,
      { id: Date.now() + Math.random(), role, text, ...(details && details.length > 0 ? { details } : {}) }
    ])
  }

  const addMissingPage = async (slug: string) => {
    const suggestion = visibleSuggestions.find(page => page.slug === slug)
    const title = suggestion?.title ?? slug

    setAddingPageSlug(slug)
    setError(null)

    try {
      const result = await addBasePageFromTemplate(slug)

      if (!result.success) {
        throw new Error(result.error)
      }

      setSuggestedPages(current => current.filter(page => page.slug !== result.page.slug))
      setCreatePagePickerOpen(false)
      appendMessage(
        'assistant',
        `Created the ${result.page.title} page from the ${
          result.source === 'base_template' ? 'master base design' : 'starter layout'
        }, matched to your current theme and background.`,
        ['Navigation on your other pages was updated to include it.']
      )
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : `Could not create the ${title} page.`)
    } finally {
      setAddingPageSlug(null)
    }
  }

  const pushUndo = (label: string) => {
    setUndoStack(current =>
      [
        ...current,
        { label, snapshot: { blocks, siteStyles, selectedBlockId: selectedBlock?.id ?? null } }
      ].slice(-MAX_UNDO_STEPS)
    )
  }

  const undoLastChange = () => {
    const entry = undoStack.at(-1)

    if (!entry) {
      return
    }

    restoreDraft(entry.snapshot)
    setUndoStack(current => current.slice(0, -1))
    setError(null)
    appendMessage('assistant', `Undid: ${entry.label}`)
  }

  const scopeLabel = (value: DesignScope) =>
    value === 'control' && selectedBlock ? `the ${selectedBlock.type} control` : `the ${currentPageSlug} page`

  const requestPayload = (value: DesignScope, instruction: string) => ({
    scope: value,
    pageSlug: currentPageSlug,
    targetBlockId: value === 'control' ? selectedBlock?.id ?? null : null,
    instruction,
    blocks
  })

  const requestProposal = async (value: DesignScope, instruction: string) => {
    const result = await proposeDesignRestyleAction({
      ...requestPayload(value, instruction),
      siteStyles,
      rewriteCopy: value === 'page' ? rewriteCopy : false
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    if (typeof result.creditsRemaining === 'number') {
      notifyCreditsChanged()
    }

    setProposal(result.proposal)
    appendMessage(
      'assistant',
      `Here's a "${result.proposal.concept}" direction for ${result.proposal.targetLabel}. Review it below and apply when you're happy.`
    )
  }

  const runReword = async (value: DesignScope, instruction: string) => {
    const result = await rewordDesignScopeAction(requestPayload(value, instruction))

    if (!result.success) {
      throw new Error(result.error)
    }

    if (typeof result.creditsRemaining === 'number') {
      notifyCreditsChanged()
    }

    pushUndo(`reworded ${scopeLabel(value)}`)

    if (!applyAiDesign({ blocks: result.result.blocks, siteStyles: null, targetBlockId: result.result.targetBlockId })) {
      setUndoStack(current => current.slice(0, -1))
      setError('That control moved while I was writing. Select it again and retry.')

      return
    }

    appendMessage('assistant', result.result.note)
  }

  const applyProposal = () => {
    if (!proposal) {
      return
    }

    if (proposal.pageSlug !== currentPageSlug) {
      setProposal(null)
      setError(`That proposal was for the ${proposal.pageSlug} page. Ask again for this one.`)

      return
    }

    pushUndo(`${proposal.concept} on ${proposal.targetLabel}`)

    if (!applyAiDesign({ blocks: proposal.blocks, siteStyles: proposal.siteStyles, targetBlockId: proposal.targetBlockId })) {
      setUndoStack(current => current.slice(0, -1))
      setError('The draft changed while you were reviewing. Ask me again to get a fresh proposal.')

      return
    }

    appendMessage('assistant', `Applied "${proposal.concept}" to ${proposal.targetLabel}.`, proposal.highlights)
    setProposal(null)
  }

  const runStudio = async (kind: 'restyle' | 'reword', value: DesignScope, instruction: string) => {
    if (value === 'control' && !selectedBlock) {
      setError('Select a control in the preview first, or switch to Whole page.')

      return
    }

    setError(null)
    setBusy(true)

    try {
      if (kind === 'restyle') {
        await requestProposal(value, instruction)
      } else {
        await runReword(value, instruction)
      }
    } catch (studioError) {
      setError(studioError instanceof Error ? studioError.message : 'I could not do that.')
    } finally {
      setBusy(false)
    }
  }

  /** Button-driven entry point: echo what was asked for, then run the intent. */
  const startStudio = async (kind: 'restyle' | 'reword', instruction: string) => {
    const trimmed = instruction.trim()

    if (trimmed) {
      appendMessage('user', trimmed)
      setDraft('')
    }

    await runStudio(kind, scope, trimmed)
  }

  const generateSite = async (prompt: string) => {
    const profile = inferDesignProfile({
      businessName: prompt.match(COMPANY_PATTERN)?.[1]?.trim() || 'Your new brand',
      pageCopy: [],
      instruction: prompt,
      nonce: newNonce()
    })

    const previewResult = await generateAiSitePreviewAction(profile)

    if (!previewResult.success) {
      throw new Error(previewResult.error)
    }

    const augmented = augmentGeneratedPreview(previewResult.preview, prompt)
    const applyResult = await applyAiGeneratedSiteAction(augmented.preview.templateId, augmented.preview)

    if (!applyResult.success) {
      throw new Error(applyResult.error)
    }

    const controlsNote = augmented.addedLabels.length > 0 ? ` I also added ${augmented.addedLabels.join(', ')} controls.` : ''

    appendMessage(
      'assistant',
      `I built a first draft from your brief using the ${previewResult.preview.designConcept} direction.${controlsNote} The draft is ready to review on the right.`
    )
    router.refresh()
  }

  const runPlan = (plan: AiBuilderPlan, label: string) => {
    pushUndo(label)

    const result = applyAiPlan(plan, refToId)

    if (result.changes.length === 0) {
      setUndoStack(current => current.slice(0, -1))
      setError(result.skipped[0] ?? plan.reply)

      return false
    }

    appendMessage('assistant', plan.reply, [...result.changes, ...result.skipped])

    return true
  }

  const runInsertAtIntent = async (promptValue: string, intent = aiInsertIntent) => {
    const prompt = promptValue.trim()

    if (!prompt || !intent || busy) {
      return
    }

    setDraft('')
    setError(null)
    appendMessage('user', prompt)
    setBusy(true)

    try {
      const bundle = buildAiBuilderContext({
        pageSlug: currentPageSlug,
        blocks,
        siteStyles,
        selectedBlock: null
      })
      const resolved = resolveAiInsertTarget(blocks, intent.location, intent.index, bundle.idToRef)

      if (!resolved) {
        throw new Error('Could not resolve where to insert. Try again from the canvas menu.')
      }

      const planned = await planAiInsertAtTarget({
        userPrompt: prompt,
        context: bundle.context,
        at: resolved.at,
        insertLabel: intent.label
      })

      if (!planned.success) {
        throw new Error(planned.error)
      }

      pushUndo(`insert ${intent.label}: ${prompt}`)

      const result = applyAiPlan(planned.plan, bundle.refToId)

      if (result.changes.length === 0) {
        setUndoStack(current => current.slice(0, -1))
        setError(result.skipped[0] ?? planned.plan.reply)

        return
      }

      appendMessage('assistant', planned.plan.reply, [...result.changes, ...result.skipped])
      shell?.clearAiInsertIntent()
    } catch (insertError) {
      setError(insertError instanceof Error ? insertError.message : 'I could not insert that control.')
    } finally {
      setBusy(false)
    }
  }

  const runFixNavigation = () => {
    setError(null)

    const result = fixNavigationOnBlocks(blocks, pages, tenantSlug, currentPageSlug)

    if (result.changes.length === 0) {
      appendMessage('assistant', summarizeNavigationFixes(result.changes))

      return
    }

    pushUndo('fixed navigation')

    if (!applyAiDesign({ blocks: result.blocks, siteStyles: null, targetBlockId: null })) {
      setUndoStack(current => current.slice(0, -1))
      setError('Could not apply navigation fixes. Try again.')

      return
    }

    appendMessage(
      'assistant',
      summarizeNavigationFixes(result.changes),
      result.changes.map(
        change => `${change.control}: “${change.label}” → ${change.pageTitle} (${change.from} → ${change.to})`
      )
    )
  }

  const sendPrompt = async (promptValue = draft) => {
    const prompt = promptValue.trim()

    if (!prompt || busy) {
      return
    }

    if (aiInsertIntent) {
      await runInsertAtIntent(prompt, aiInsertIntent)

      return
    }

    setDraft('')
    setError(null)
    appendMessage('user', prompt)

    // Naming the page beats the toggle: asking to redesign the page must never edit one control.
    const requestScope: DesignScope = PAGE_OVERRIDE.test(prompt) ? 'page' : scope

    if (isFixNavigationIntent(prompt)) {
      runFixNavigation()

      return
    }

    if (REWORD_INTENT.test(prompt) || (REDESIGN_INTENT.test(prompt) && COPY_TARGET.test(prompt))) {
      await runStudio('reword', requestScope, prompt)

      return
    }

    if (REDESIGN_INTENT.test(prompt)) {
      await runStudio('restyle', requestScope, prompt)

      return
    }

    if (BACKGROUND_INTENT.test(prompt)) {
      await runStudio('restyle', requestScope, prompt)

      return
    }

    setBusy(true)

    try {
      if (/\b(template|templates|library|layout options)\b/i.test(prompt) && workspace) {
        workspace.openTemplatePicker(workspace.isSiteStarted ? 'replace' : 'onboarding')
        appendMessage('assistant', 'I opened the template library. Pick a layout and I’ll leave it ready for further chat edits.')

        return
      }

      const requestedPages = parseAddBasePageIntent(prompt)

      if (requestedPages.length > 0) {
        const alreadyHave = requestedPages.filter(slug => existingPageSlugs.has(slug))
        const toAdd = requestedPages.filter(slug => !existingPageSlugs.has(slug))

        if (alreadyHave.length > 0 && toAdd.length === 0) {
          appendMessage(
            'assistant',
            alreadyHave.length === 1
              ? `You already have a ${alreadyHave[0]} page — open it from the Pages panel.`
              : `You already have those pages (${alreadyHave.join(', ')}).`
          )

          return
        }

        for (const slug of toAdd) {
          await addMissingPage(slug)
        }

        if (alreadyHave.length > 0) {
          appendMessage(
            'assistant',
            `Skipped ${alreadyHave.join(' and ')} — already on your site.`
          )
        }

        return
      }

      if (isOpenCreatePageListIntent(prompt) && builderScope === 'organization') {
        setThemePickerOpen(false)
        setCreatePagePickerOpen(true)
        appendMessage(
          'assistant',
          visibleSuggestions.length > 0
            ? 'Here’s the create-page list — pick a base page and I’ll match it to your theme.'
            : 'You already have the base pages. Use the Pages panel if you want a blank custom page.'
        )

        return
      }

      if (isCreationPrompt(prompt, Boolean(selectedBlock), blocks.length)) {
        await generateSite(prompt)

        return
      }

      const local = createLocalAiBuilderPlan(prompt, context)

      const planResult =
        local.confidence === 'high'
          ? { success: true as const, plan: local.plan }
          : await planAiBuilderCommandAction({ prompt, context })

      if (!planResult.success) {
        throw new Error(planResult.error)
      }

      if ('creditsRemaining' in planResult && typeof planResult.creditsRemaining === 'number') {
        notifyCreditsChanged()
      }

      if (planResult.plan.operations.length === 0) {
        setError(`I could not work that out as a precise edit. Try "Redesign" or "Reword" for ${scopeLabel(requestScope)}.`)

        return
      }

      runPlan(planResult.plan, prompt)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'I could not apply that request.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!open || !shell?.aiInsertPending) {
      return
    }

    const pending = shell.consumeAiInsertPending()

    if (!pending) {
      return
    }

    void runInsertAtIntent(pending.prompt, pending.intent)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pending handoff from quick-add
  }, [open, shell?.aiInsertPending])

  const quickActions = scope === 'control' ? CONTROL_ACTIONS : PAGE_ACTIONS

  const runQuickAction = (action: QuickAction) => {
    if (action.kind === 'fix-nav') {
      appendMessage('user', 'Fix Navigation')
      runFixNavigation()

      return
    }

    void startStudio(action.kind, action.instruction ?? '')
  }

  if (!open) {
    return null
  }

  const content = (
    <Paper
      component='section'
      aria-label='AI website builder'
      elevation={0}
      sx={{
        ...(isDesktopLayout
          ? {
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: 0
            }
          : {
              position: 'absolute',
              zIndex: 30,
              top: 8,
              left: 8,
              bottom: 8,
              width: { xs: 'calc(100% - 16px)', sm: 360 }
            }),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
        borderRadius: 3,
        boxShadow: `0 24px 72px ${alpha(theme.palette.common.black, 0.2)}`
      }}
    >
      <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {!pinned && isDesktopLayout ? (
          <Tooltip title='Drag to move'>
            <Box
              component='span'
              data-panel-drag
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.primary',
                flexShrink: 0,
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                cursor: 'grab',
                touchAction: 'none',
                backgroundColor: alpha(theme.palette.text.primary, 0.06)
              }}
            >
              <i className='ri-draggable' style={{ fontSize: '1.15rem' }} />
              {Boolean(rect && rect.width >= 320) && (
                <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 700, pr: 0.25 }}>
                  Move
                </Typography>
              )}
            </Box>
          </Tooltip>
        ) : null}
        <Box
          data-panel-drag={!pinned && isDesktopLayout ? true : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            flex: 1,
            cursor: !pinned && isDesktopLayout ? 'grab' : 'default',
            touchAction: !pinned && isDesktopLayout ? 'none' : undefined
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'primary.main',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.14)})`
            }}
          >
            <i className='ri-sparkling-2-line' />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Build with AI</Typography>
            <Typography variant='caption' color='text.secondary'>
              Chat with your live draft
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {builderScope === 'organization' && visibleSuggestions.length > 0 ? (
            <DockToolButton
              title='Create a page'
              icon='ri-file-add-line'
              onClick={() => {
                setThemePickerOpen(false)
                setCreatePagePickerOpen(true)
              }}
              active={createPagePickerOpen}
              ariaLabel='Create a page'
            />
          ) : null}
          {isDesktopLayout ? (
            <>
              <DockToolButton
                title='Choose a theme'
                icon='ri-palette-line'
                onClick={() => {
                  setCreatePagePickerOpen(false)
                  setSelectedThemeId(siteStyles.themeId)
                  setThemePickerOpen(true)
                }}
                active={themePickerOpen}
                ariaLabel='Choose a theme'
              />
              <DockToolButton
                title='Maximize or restore AI builder'
                icon='ri-fullscreen-line'
                onClick={onMaximize}
                ariaLabel='Maximize or restore AI builder'
              />
              <DockToolButton
                title={pinned ? 'Float outside layout' : 'Pin to side'}
                icon={pinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}
                onClick={() => onPinnedChange(!pinned)}
                active={pinned}
                ariaLabel={pinned ? 'Unpin AI builder' : 'Pin AI builder'}
              />
            </>
          ) : null}
          <IconButton size='small' onClick={onClose} aria-label='Close AI website builder'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      {themePickerOpen ? (
        <ThemePicker
          selectedThemeId={selectedThemeId}
          onSelect={setSelectedThemeId}
          onCancel={() => setThemePickerOpen(false)}
          onApply={() => {
            if (!selectedThemeId) {
              return
            }

            const selectedTheme = SITE_THEME_PRESETS.find(preset => preset.id === selectedThemeId)

            if (selectedTheme) {
              pushUndo(`${selectedTheme.name} theme`)
              applyThemePreset(selectedTheme.id)
              appendMessage('assistant', `Applied the ${selectedTheme.name} theme to your draft.`)
            }

            setThemePickerOpen(false)
          }}
        />
      ) : createPagePickerOpen ? (
        <CreatePagePicker
          pages={visibleSuggestions}
          busy={busy}
          creatingSlug={addingPageSlug}
          onCreate={slug => void addMissingPage(slug)}
          onCancel={() => setCreatePagePickerOpen(false)}
        />
      ) : (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              p: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
              backgroundColor: alpha(theme.palette.primary.main, 0.025)
            }}
          >
            {messages.map(message => (
              <Box
                key={message.id}
                sx={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  px: 1.5,
                  py: 1,
                  borderRadius: message.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  backgroundColor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  boxShadow: message.role === 'user' ? 'none' : `inset 0 0 0 1px ${alpha(theme.palette.text.primary, 0.08)}`
                }}
              >
                <Typography sx={{ fontSize: '0.78rem', lineHeight: 1.55 }}>{message.text}</Typography>
                {message.details?.map((detail, index) => (
                  <Typography
                    key={`${message.id}-detail-${index}`}
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'block', mt: 0.5, fontSize: '0.68rem' }}
                  >
                    {detail}
                  </Typography>
                ))}
              </Box>
            ))}
            {busy && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', px: 1 }}>
                <CircularProgress size={14} />
                <Typography variant='caption'>Designing…</Typography>
              </Box>
            )}
          </Box>
          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.25, flexShrink: 0 }}>
            {aiInsertIntent ? (
              <Chip
                icon={<i className='ri-add-box-line' style={{ fontSize: '0.95rem' }} />}
                label={`Inserting ${aiInsertIntent.label}`}
                onDelete={() => shell?.clearAiInsertIntent()}
                deleteIcon={<i className='ri-close-line' />}
                color='primary'
                variant='outlined'
                sx={{
                  alignSelf: 'flex-start',
                  maxWidth: '100%',
                  height: 30,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  '& .MuiChip-label': { px: 0.75 }
                }}
              />
            ) : (
              <>
                <ToggleButtonGroup
                  size='small'
                  exclusive
                  fullWidth
                  value={scope}
                  onChange={(_event, next: DesignScope | null) => {
                    if (next) {
                      setScope(next)
                      setProposal(null)
                      setError(null)
                    }
                  }}
                  aria-label='What the AI should work on'
                >
                  <ToggleButton value='control' disabled={!selectedBlock} sx={{ fontSize: '0.7rem', py: 0.5, textTransform: 'none' }}>
                    {selectedBlock ? `This ${selectedBlock.type}` : 'This control'}
                  </ToggleButton>
                  <ToggleButton value='page' sx={{ fontSize: '0.7rem', py: 0.5, textTransform: 'none' }}>
                    Whole page
                  </ToggleButton>
                </ToggleButtonGroup>
                {scope === 'page' ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size='small'
                        checked={rewriteCopy}
                        onChange={event => setRewriteCopy(event.target.checked)}
                        disabled={busy}
                      />
                    }
                    label={
                      <Typography variant='caption' color='text.secondary'>
                        Rewrite the copy as part of the redesign
                      </Typography>
                    }
                    sx={{ ml: -0.5, my: -0.5 }}
                  />
                ) : null}
              </>
            )}
            {proposal ? (
              <ProposalCard
                proposal={proposal}
                busy={busy}
                onApply={applyProposal}
                onRetry={() => void runStudio('restyle', proposal.scope, draft.trim())}
                onDiscard={() => setProposal(null)}
              />
            ) : null}
            {undoStack.length > 0 ? (
              <Button
                size='small'
                variant='text'
                startIcon={<i className='ri-arrow-go-back-line' />}
                onClick={undoLastChange}
                disabled={busy}
                sx={{ alignSelf: 'flex-start', minHeight: 28, px: 0.5, fontSize: '0.7rem' }}
              >
                {`Undo (${undoStack.length})`}
              </Button>
            ) : null}
            {!aiInsertIntent ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 0.75,
                  pb: 0.25
                }}
              >
                <Chip
                  label='Choose theme'
                  size='small'
                  variant='outlined'
                  onClick={() => {
                    setCreatePagePickerOpen(false)
                    setSelectedThemeId(siteStyles.themeId)
                    setThemePickerOpen(true)
                  }}
                  disabled={busy}
                  sx={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.7rem' }}
                />
                {quickActions.map(action => (
                  <Chip
                    key={action.label}
                    label={action.label}
                    size='small'
                    variant='outlined'
                    onClick={() => runQuickAction(action)}
                    disabled={busy}
                    sx={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.7rem' }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary', fontSize: '0.72rem' }}>
                Describe the control to add here. Theme and colors follow the page.
              </Typography>
            )}
            {error ? (
              <Alert severity='warning' variant='outlined' onClose={() => setError(null)} sx={{ py: 0, fontSize: '0.75rem' }}>
                {error}
              </Alert>
            ) : null}
            <Box component='form' onSubmit={event => { event.preventDefault(); void sendPrompt() }} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                value={draft}
                onChange={event => setDraft(event.target.value)}
                placeholder={
                  aiInsertIntent
                    ? 'What should we add here?'
                    : scope === 'control'
                      ? 'Describe the look, or leave blank and hit Redesign…'
                      : 'e.g. warm and editorial with big photography…'
                }
                multiline
                minRows={1}
                maxRows={4}
                fullWidth
                size='small'
                disabled={busy}
                inputProps={{ 'aria-label': aiInsertIntent ? 'Describe a control to insert' : 'Describe a website change' }}
              />
              <Button
                type='submit'
                variant='contained'
                disabled={busy || !draft.trim()}
                sx={{ minWidth: 42, width: 42, height: 40, p: 0, borderRadius: 1.5 }}
                aria-label='Send AI website request'
              >
                {busy ? <CircularProgress size={18} color='inherit' /> : <i className='ri-arrow-up-line' />}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  )

  if (!isDesktopLayout) {
    return content
  }

  return (
    <BuilderFloatingFrame
      overlay={!pinned}
      overlayId='ai'
      rect={rect}
      onCommit={onCommit}
      onEnsureLayout={onEnsureLayout}
    >
      {content}
    </BuilderFloatingFrame>
  )
}
