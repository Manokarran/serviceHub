'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { signIn, useSession } from 'next-auth/react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { completeRegistrationAction } from '@/app/actions/auth.actions'
import { listPublishedSiteTemplatesAction } from '@/app/actions/site-template.actions'
import { applySiteFromBrief } from '@/lib/ai-site-wizard/apply-from-brief'
import type { SiteTemplateSummary } from '@/models/site-template'

import { BuildingWebsiteOverlay, type BuildPhase } from './BuildingWebsiteOverlay'
import { RegisterAurora } from './RegisterAurora'
import { RegisterOrgDialog } from './RegisterOrgDialog'
import { RegisterPromptHero } from './RegisterPromptHero'
import { RegisterTemplateStrip } from './RegisterTemplateStrip'
import { RegisterTopBar } from './RegisterTopBar'
import { REGISTER_PROOF_POINTS } from '../constants/prompt-suggestions'
import { registerFontVariablesClassName } from '../constants/register-fonts'
import { REGISTER_PALETTE, enterSx } from '../constants/register-theme'
import { savePendingBuildIntent, type PendingBuildIntent } from '../utils/pending-build-intent'
import {
  clearRegisterDraft,
  consumeRegisterDraft,
  peekRegisterDraft,
  saveRegisterDraft,
  type RegisterDraftIntent
} from '../utils/register-draft'

type DraftIntent = RegisterDraftIntent

/** Floor so instant paths still feel intentional; AI generation often exceeds this. */
const MIN_BUILD_OVERLAY_MS: Record<DraftIntent['type'], number> = {
  ai: 3800,
  template: 3400,
  blank: 2800
}

function guessCompanyFromPrompt(prompt: string): string {
  const named = prompt.match(/(?:called|named)\s+([A-Za-z0-9][A-Za-z0-9 &.'-]{1,40})/i)?.[1]?.trim()

  if (named) {
    return named.replace(/[.,!?;:]+$/, '')
  }

  return ''
}

export function RegisterExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status, update } = useSession()
  const [prompt, setPrompt] = useState('')
  const [templates, setTemplates] = useState<SiteTemplateSummary[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [draftIntent, setDraftIntent] = useState<DraftIntent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [building, setBuilding] = useState(false)
  const [buildPhase, setBuildPhase] = useState<BuildPhase>('building')
  const [buildingCompanyName, setBuildingCompanyName] = useState('')
  const [draftCompanyName, setDraftCompanyName] = useState<string | undefined>()
  const [draftSlug, setDraftSlug] = useState<string | undefined>()
  const [googleBusy, setGoogleBusy] = useState(false)
  const launchTarget = useRef<string | null>(null)
  const draftRestored = useRef(false)

  const isSignedIn = status === 'authenticated' && Boolean(session?.user)

  useEffect(() => {
    void listPublishedSiteTemplatesAction().then(result => {
      if (result.success) {
        setTemplates(result.templates)
      }

      setTemplatesLoading(false)
    })
  }, [])

  // After Google OAuth, restore the draft intent and reopen the workspace dialog.
  useEffect(() => {
    if (draftRestored.current || status === 'loading') {
      return
    }

    const shouldContinue = searchParams.get('continue') === '1'
    const draft = peekRegisterDraft()

    if (!draft) {
      return
    }

    if (!isSignedIn && !shouldContinue) {
      return
    }

    draftRestored.current = true

    const restored = consumeRegisterDraft()

    if (!restored) {
      return
    }

    setDraftIntent(restored.intent)
    setDraftCompanyName(restored.companyName)
    setDraftSlug(restored.slug)

    if (restored.promptText) {
      setPrompt(restored.promptText)
    } else if (restored.intent.type === 'ai') {
      setPrompt(restored.intent.prompt)
    }

    if (isSignedIn) {
      setDialogOpen(true)
    }

    if (shouldContinue) {
      router.replace('/register', { scroll: false })
    }
  }, [isSignedIn, router, searchParams, status])

  const suggestedName = useMemo(() => {
    if (draftCompanyName) {
      return draftCompanyName
    }

    if (!draftIntent) {
      return ''
    }

    if (draftIntent.type === 'ai') {
      return guessCompanyFromPrompt(draftIntent.prompt)
    }

    if (draftIntent.type === 'template') {
      return templates.find(item => item.id === draftIntent.templateId)?.name ?? ''
    }

    return ''
  }, [draftCompanyName, draftIntent, templates])

  const intentLabel = useMemo(() => {
    if (!draftIntent) {
      return undefined
    }

    if (draftIntent.type === 'ai') {
      return 'AI will draft your site'
    }

    if (draftIntent.type === 'template') {
      const name = templates.find(item => item.id === draftIntent.templateId)?.name

      return name ? `Starting from ${name}` : 'Starting from a template'
    }

    return 'Starting from a blank canvas'
  }, [draftIntent, templates])

  const openRegistration = (intent: DraftIntent) => {
    setError(null)
    setDraftIntent(intent)
    setDraftCompanyName(undefined)
    setDraftSlug(undefined)
    setDialogOpen(true)
  }

  const handlePromptSubmit = () => {
    const trimmed = prompt.trim()

    if (!trimmed) {
      return
    }

    openRegistration({ type: 'ai', prompt: trimmed })
  }

  const beginGoogleSignIn = async (values?: { companyName: string; slug: string }) => {
    setGoogleBusy(true)
    setError(null)

    const intent = draftIntent ?? { type: 'blank' as const }

    saveRegisterDraft({
      intent,
      companyName: values?.companyName,
      slug: values?.slug,
      promptText: prompt.trim() || (intent.type === 'ai' ? intent.prompt : undefined)
    })

    await signIn('google', { callbackUrl: '/register?continue=1' })
  }

  const handleRegister = async (values: { companyName: string; slug: string }) => {
    if (!draftIntent) {
      return
    }

    if (!isSignedIn) {
      await beginGoogleSignIn(values)

      return
    }

    clearRegisterDraft()
    setError(null)
    setIsSubmitting(true)
    setBuildingCompanyName(values.companyName)
    setBuildPhase('building')
    setBuilding(true)
    setDialogOpen(false)

    const startedAt = Date.now()

    try {
      const result = await completeRegistrationAction({
        companyName: values.companyName,
        slug: values.slug,
        templateId: draftIntent.type === 'template' ? draftIntent.templateId : undefined
      })

      if (!result.success) {
        if (result.error === 'Registration is already complete.') {
          await update({ registrationComplete: true })
          launchTarget.current = '/home'
          setBuildPhase('launching')

          return
        }

        setBuilding(false)
        setIsSubmitting(false)
        setDialogOpen(true)
        setError(result.error)

        return
      }

      // Refresh JWT so subsequent server actions see tenantId before AI generate/apply.
      await update({
        registrationComplete: true,
        tenantSlug: result.tenantSlug,
        tenantName: result.tenantName,
        tenantApproved: false,
        tenantApprovalStatus: 'pending',
        tenantWorkspaceOpen: true
      })

      let pending: PendingBuildIntent
      let target = '/your-space?focus=1'

      if (draftIntent.type === 'ai') {
        try {
          const built = await applySiteFromBrief(draftIntent.prompt, values.companyName)

          pending = {
            type: 'ai-ready',
            companyName: values.companyName,
            designConcept: built.designConcept
          }
        } catch (generationError) {
          console.error('[RegisterExperience] AI site build during overlay failed', generationError)
          // Fall back: finish into the builder and let the AI chat retry the brief.
          pending = { type: 'ai', prompt: draftIntent.prompt, companyName: values.companyName }
          target = '/your-space?aiChat=1&focus=1'
        }
      } else if (draftIntent.type === 'template') {
        pending = {
          type: 'template',
          templateId: draftIntent.templateId,
          companyName: values.companyName
        }
      } else {
        pending = { type: 'blank', companyName: values.companyName }
      }

      savePendingBuildIntent(pending)

      const wait = Math.max(0, MIN_BUILD_OVERLAY_MS[draftIntent.type] - (Date.now() - startedAt))

      if (wait > 0) {
        await new Promise(resolve => window.setTimeout(resolve, wait))
      }

      launchTarget.current = target
      setBuildPhase('launching')
    } catch {
      setBuilding(false)
      setIsSubmitting(false)
      setDialogOpen(true)
      setError('Registration failed. Please try again.')
    }
  }

  const buildMode = draftIntent?.type ?? 'blank'
  const busy = isSubmitting || building || googleBusy

  return (
    <Box
      className={registerFontVariablesClassName}
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        fontFamily: 'var(--register-body)',
        color: REGISTER_PALETTE.text,
        backgroundColor: REGISTER_PALETTE.ink,
        '@media (prefers-reduced-motion: reduce)': {
          '& *': { animationDuration: '0.001ms !important', animationIterationCount: '1 !important' }
        }
      }}
    >
      <RegisterAurora />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2.5, sm: 4, md: 5 },
          pb: { xs: 8, md: 12 }
        }}
      >
        <RegisterTopBar
          signedIn={isSignedIn}
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          userImage={session?.user?.image}
          googleBusy={googleBusy}
          onGoogleSignIn={() => {
            void beginGoogleSignIn()
          }}
        />

        <Box sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 11 } }}>
          <RegisterPromptHero value={prompt} onChange={setPrompt} onSubmit={handlePromptSubmit} disabled={busy} />
        </Box>

        <RegisterTemplateStrip
          templates={templates}
          loading={templatesLoading}
          disabled={busy}
          onSelectTemplate={templateId => openRegistration({ type: 'template', templateId })}
          onSelectBlank={() => openRegistration({ type: 'blank' })}
          onFocusPrompt={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(), 320)
          }}
          onScrollToTemplates={() => {
            document.getElementById('register-templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />

        <Box
          sx={{
            mt: { xs: 8, md: 11 },
            pt: { xs: 4, md: 5 },
            borderTop: `1px solid ${REGISTER_PALETTE.hairline}`,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 2, md: 3 },
            ...enterSx(600)
          }}
        >
          {REGISTER_PROOF_POINTS.map(point => (
            <Box key={point.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <Box sx={{ color: REGISTER_PALETTE.violetSoft, mt: '2px', flexShrink: 0 }}>
                <i className={point.icon} style={{ fontSize: '1.05rem' }} />
              </Box>
              <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.5, color: REGISTER_PALETTE.textMuted }}>
                {point.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <RegisterOrgDialog
        open={dialogOpen}
        onClose={() => {
          if (!isSubmitting && !googleBusy) {
            setDialogOpen(false)
            setError(null)
          }
        }}
        onSubmit={handleRegister}
        onGoogleSignIn={beginGoogleSignIn}
        isSubmitting={isSubmitting}
        error={error}
        suggestedName={suggestedName}
        intentLabel={intentLabel}
        initialCompanyName={draftCompanyName}
        initialSlug={draftSlug}
      />

      <BuildingWebsiteOverlay
        open={building}
        companyName={buildingCompanyName || suggestedName || undefined}
        mode={buildMode}
        phase={buildPhase}
        onLaunched={() => {
          if (launchTarget.current) {
            window.location.assign(launchTarget.current)
          }
        }}
      />
    </Box>
  )
}
