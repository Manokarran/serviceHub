'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { buildAiBuilderContext } from '@/lib/ai-builder/context'

import { PALETTE_CATEGORIES } from '../../constants'
import { BUILDER_TYPOGRAPHY, BUILDER_Z_INDEX } from '../../constants/builderLayout'
import { useBuilder } from '../../context/BuilderContext'
import { useBuilderShell } from '../../context/BuilderShellContext'
import { useFrequentPaletteItems } from '../../hooks/useFrequentPaletteItems'
import type { PaletteItem } from '../../types'
import {
  getQuickAddPaletteItems,
  resolveAiInsertTarget,
  toBlockLocation,
  type QuickAddLocation
} from '../../utils/quickAddHelpers'

type Props = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  location: QuickAddLocation
  index: number
  title?: string
  focusAi?: boolean
}

export function BlockQuickAddPicker({
  anchorEl,
  open,
  onClose,
  location,
  index,
  title = 'Add block',
  focusAi = false
}: Props) {
  const theme = useTheme()
  const { addBlock, blocks, siteStyles, currentPageSlug, selectedBlock } = useBuilder()
  const shell = useBuilderShell()
  const [query, setQuery] = useState('')
  const [aiDraft, setAiDraft] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const frequentItems = useFrequentPaletteItems(4)
  const searchRef = useRef<HTMLInputElement>(null)
  const aiRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setAiDraft('')
      setAiError(null)
      setAiBusy(false)

      return
    }

    const frame = window.requestAnimationFrame(() => {
      if (focusAi) {
        aiRef.current?.focus()
      } else {
        searchRef.current?.focus()
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, focusAi])

  const items = useMemo(() => {
    const all = getQuickAddPaletteItems(location)
    const q = query.trim().toLowerCase()

    if (!q) {
      return all
    }

    return all.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    )
  }, [location, query])

  const grouped = useMemo(() => {
    return PALETTE_CATEGORIES.map(category => ({
      category,
      items: items.filter(item => item.category === category.id)
    })).filter(group => group.items.length > 0)
  }, [items])

  const frequentForLocation = useMemo(() => {
    if (query.trim()) {
      return []
    }

    const allowedIds = new Set(items.map(item => item.id))

    return frequentItems.filter(item => allowedIds.has(item.id))
  }, [frequentItems, items, query])

  const handlePick = (item: PaletteItem) => {
    addBlock(item.type, toBlockLocation(location, index), item.id)
    setQuery('')
    onClose()
  }

  const handleAskAi = (promptValue = aiDraft) => {
    const prompt = promptValue.trim()

    if (!prompt || aiBusy || !shell) {
      return
    }

    const { idToRef } = buildAiBuilderContext({
      pageSlug: currentPageSlug,
      blocks,
      siteStyles,
      selectedBlock
    })
    const resolved = resolveAiInsertTarget(blocks, location, index, idToRef)

    if (!resolved) {
      setAiError('Could not resolve where to insert. Try again after selecting a nearby block.')

      return
    }

    setAiBusy(true)
    setAiError(null)
    shell.requestAiInsert({
      prompt,
      intent: {
        location,
        index,
        label: resolved.label
      }
    })
    setAiDraft('')
    setAiBusy(false)
    onClose()
  }

  const noMatches = grouped.length === 0 && query.trim().length > 0

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        setQuery('')
        setAiDraft('')
        setAiError(null)
        onClose()
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            width: 340,
            maxHeight: 440,
            mt: 0.75,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.16)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            zIndex: BUILDER_Z_INDEX.blockToolbar + 20
          }
        }
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`, flexShrink: 0 }}>
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.title, mb: 0.75 }}>{title}</Typography>
        <Box
          component='input'
          ref={searchRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Search blocks…'
          sx={{
            width: '100%',
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            borderRadius: 1,
            px: 1,
            py: 0.75,
            fontSize: '0.8rem',
            outline: 'none',
            backgroundColor: alpha(theme.palette.text.primary, 0.03),
            color: 'text.primary',
            '&:focus': {
              borderColor: alpha(theme.palette.primary.main, 0.55),
              backgroundColor: 'background.paper'
            }
          }}
        />
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, py: 0.75 }}>
        {noMatches ? (
          <Box sx={{ px: 1.5, py: 2 }}>
            <Typography sx={{ color: 'text.disabled', fontSize: '0.8rem', mb: 1 }}>No blocks match</Typography>
            <Box
              component='button'
              type='button'
              onClick={() => handleAskAi(query)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                borderRadius: 1.25,
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                textAlign: 'left',
                px: 1.25,
                py: 1,
                cursor: 'pointer',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <i className='ri-sparkling-2-line' style={{ fontSize: '1rem' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3 }}>
                Ask AI to create “{query.trim()}”
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {frequentForLocation.length > 0 && (
              <Box sx={{ mb: 0.75 }}>
                <Typography
                  sx={{
                    ...BUILDER_TYPOGRAPHY.sectionLabel,
                    px: 1.5,
                    py: 0.5,
                    color: 'text.disabled',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <i className='ri-sparkling-line' style={{ fontSize: '0.75rem' }} />
                  Frequently used
                </Typography>
                {frequentForLocation.map(item => (
                  <Box
                    key={`frequent-${item.id}`}
                    component='button'
                    type='button'
                    onClick={() => handlePick(item)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main'
                      }}
                    >
                      <i className={item.icon} style={{ fontSize: '0.9rem' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {grouped.map(({ category, items: groupItems }) => (
              <Box key={category.id} sx={{ mb: 0.75 }}>
                <Typography
                  sx={{
                    ...BUILDER_TYPOGRAPHY.sectionLabel,
                    px: 1.5,
                    py: 0.5,
                    color: 'text.disabled'
                  }}
                >
                  {category.label}
                </Typography>
                {groupItems.map(item => (
                  <Box
                    key={item.id}
                    component='button'
                    type='button'
                    onClick={() => handlePick(item)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main'
                      }}
                    >
                      <i className={item.icon} style={{ fontSize: '0.9rem' }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.68rem',
                          color: 'text.disabled',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </>
        )}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          px: 1.25,
          py: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.03)
        }}
      >
        {aiError ? (
          <Typography sx={{ fontSize: '0.7rem', color: 'error.main', mb: 0.75 }}>{aiError}</Typography>
        ) : null}
        <Box
          component='form'
          onSubmit={event => {
            event.preventDefault()
            handleAskAi()
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              flex: 1,
              minWidth: 0,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
              borderRadius: 1.25,
              px: 1,
              py: 0.5,
              backgroundColor: 'background.paper'
            }}
          >
            <i className='ri-sparkling-2-line' style={{ fontSize: '0.95rem', color: theme.palette.primary.main, flexShrink: 0 }} />
            <Box
              component='input'
              ref={aiRef}
              value={aiDraft}
              onChange={e => setAiDraft(e.target.value)}
              placeholder='Describe what to add…'
              disabled={aiBusy || !shell}
              sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                fontSize: '0.78rem',
                background: 'transparent',
                color: 'text.primary',
                py: 0.5
              }}
            />
          </Box>
          <IconButton
            type='submit'
            size='small'
            disabled={!aiDraft.trim() || aiBusy || !shell}
            aria-label='Generate with AI'
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.25,
              color: 'primary.contrastText',
              backgroundColor: 'primary.main',
              '&:hover': { backgroundColor: 'primary.dark' },
              '&.Mui-disabled': {
                backgroundColor: alpha(theme.palette.primary.main, 0.35),
                color: alpha(theme.palette.primary.contrastText, 0.7)
              }
            }}
          >
            {aiBusy ? <CircularProgress size={16} color='inherit' /> : <i className='ri-arrow-up-line' style={{ fontSize: '1rem' }} />}
          </IconButton>
        </Box>
      </Box>
    </Popover>
  )
}
