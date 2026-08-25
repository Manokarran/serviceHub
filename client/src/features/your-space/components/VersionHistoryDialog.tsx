'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  getSitePageVersionAction,
  listSitePageVersionsAction,
  restoreSitePageVersionAction
} from '@/app/actions/site-page.actions'
import type { BuilderScope } from '@/lib/site-template/resolve-builder-tenant'
import type { PublishedVersionSummary } from '@/models/site-page'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import type { Block } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { PublicSiteRenderer } from './PublicSiteRenderer'

type Props = {
  open: boolean
  onClose: () => void
  pageSlug: string
  pageTitle: string
  builderScope?: BuilderScope
  libraryTemplateId?: string | null
  versions: PublishedVersionSummary[]
  siteStyles: SiteStyles
  isDirty?: boolean
  onRestore: (blocks: Block[], savedAt: string) => void
  onVersionsChange: (versions: PublishedVersionSummary[]) => void
}

function formatVersionDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso))
}

export function VersionHistoryDialog({
  open,
  onClose,
  pageSlug,
  pageTitle,
  builderScope = 'organization',
  libraryTemplateId = null,
  versions,
  siteStyles,
  isDirty = false,
  onRestore,
  onVersionsChange
}: Props) {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('md'))
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [previewBlocks, setPreviewBlocks] = useState<Block[] | null>(null)
  const previewCacheRef = useRef<Record<string, Block[]>>({})
  const onVersionsChangeRef = useRef(onVersionsChange)

  onVersionsChangeRef.current = onVersionsChange

  const selectedVersion = versions.find(version => version.id === selectedVersionId) ?? null
  const selectedIndex = selectedVersion ? versions.findIndex(version => version.id === selectedVersion.id) : -1
  const showList = !isCompact || !selectedVersionId
  const showPreview = !isCompact || Boolean(selectedVersionId)

  const loadVersion = useCallback(
    async (versionId: string) => {
      setSelectedVersionId(versionId)
      setError(null)

      const cached = previewCacheRef.current[versionId]

      if (cached) {
        setPreviewBlocks(cached)
        return
      }

      setPreviewLoading(true)
      setPreviewBlocks(null)

      const result = await getSitePageVersionAction(
        pageSlug,
        versionId,
        builderScope,
        libraryTemplateId ?? undefined
      )

      if (result.success) {
        previewCacheRef.current[versionId] = result.blocks
        setPreviewBlocks(result.blocks)
      } else {
        setError(result.error)
        setPreviewBlocks(null)
      }

      setPreviewLoading(false)
    },
    [builderScope, libraryTemplateId, pageSlug]
  )

  useEffect(() => {
    if (!open) {
      setSelectedVersionId(null)
      setPreviewBlocks(null)
      setError(null)
      setRestoringId(null)
      setPreviewLoading(false)
      previewCacheRef.current = {}
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const result = await listSitePageVersionsAction(pageSlug, builderScope, libraryTemplateId ?? undefined)

      if (cancelled) {
        return
      }

      if (result.success) {
        onVersionsChangeRef.current(result.versions)
      } else {
        setError(result.error)
      }

      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, pageSlug, builderScope, libraryTemplateId])

  useEffect(() => {
    if (!open || loading || isCompact || versions.length === 0) {
      return
    }

    const stillSelected = selectedVersionId && versions.some(version => version.id === selectedVersionId)

    if (!stillSelected) {
      void loadVersion(versions[0].id)
    }
  }, [isCompact, loadVersion, loading, open, selectedVersionId, versions])

  const handleRestore = useCallback(async () => {
    if (!selectedVersionId) {
      return
    }

    setRestoringId(selectedVersionId)
    setError(null)

    const result = await restoreSitePageVersionAction(
      pageSlug,
      selectedVersionId,
      builderScope,
      libraryTemplateId ?? undefined
    )

    if (result.success) {
      onRestore(result.blocks, result.savedAt)
      onClose()
    } else {
      setError(result.error)
    }

    setRestoringId(null)
  }, [builderScope, libraryTemplateId, onClose, onRestore, pageSlug, selectedVersionId])

  const selectedLabel =
    selectedIndex >= 0 ? `Version ${versions.length - selectedIndex}` : 'this version'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      fullScreen={isCompact}
      slotProps={{
        paper: {
          sx: {
            height: isCompact ? '100%' : 'min(860px, 88vh)',
            maxHeight: isCompact ? '100%' : '88vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {isCompact && selectedVersionId ? (
              <IconButton
                size='small'
                aria-label='Back to version list'
                onClick={() => {
                  setSelectedVersionId(null)
                  setPreviewBlocks(null)
                }}
              >
                <i className='ri-arrow-left-line' />
              </IconButton>
            ) : null}
            <Typography variant='h6' component='span'>
              Published versions
            </Typography>
          </Box>
          <Typography variant='caption' color='text.secondary' display='block'>
            {pageTitle} — view a snapshot, then adopt it into your draft
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small' aria-label='Close version history'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 0,
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {showList ? (
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              flexShrink: 0,
              borderRight: { md: `1px solid ${theme.palette.divider}` },
              overflowY: 'auto'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : versions.length === 0 ? (
              <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
                <Typography color='text.secondary'>
                  No published versions yet. Publish your site to create the first snapshot.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {versions.map((version, index) => {
                  const selected = version.id === selectedVersionId

                  return (
                    <ListItemButton
                      key={version.id}
                      selected={selected}
                      disabled={restoringId !== null}
                      onClick={() => void loadVersion(version.id)}
                      sx={{ py: 1.75, px: 2.5, alignItems: 'flex-start' }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant='subtitle2' sx={BUILDER_TYPOGRAPHY.title}>
                            Version {versions.length - index}
                            {index === 0 ? ' · Latest' : ''}
                          </Typography>
                        }
                        secondary={
                          <>
                            {formatVersionDate(version.publishedAt)}
                            {' · '}
                            {version.blockCount} block{version.blockCount === 1 ? '' : 's'}
                          </>
                        }
                      />
                      <Typography
                        variant='caption'
                        color={selected ? 'primary.main' : 'text.secondary'}
                        sx={{ mt: 0.5, flexShrink: 0, fontWeight: 600 }}
                      >
                        View
                      </Typography>
                    </ListItemButton>
                  )
                })}
              </List>
            )}
          </Box>
        ) : null}

        {showPreview ? (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: { xs: 360, md: 0 },
              display: 'flex',
              flexDirection: 'column',
              bgcolor: alpha(theme.palette.text.primary, 0.03)
            }}
          >
            {previewLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 1.5 }}>
                <CircularProgress size={28} />
                <Typography color='text.secondary' variant='body2'>
                  Loading snapshot…
                </Typography>
              </Box>
            ) : previewBlocks ? (
              <>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    flexShrink: 0
                  }}
                >
                  <Typography variant='body2' sx={BUILDER_TYPOGRAPHY.title}>
                    {selectedLabel}
                    {selectedVersion ? ` · ${formatVersionDate(selectedVersion.publishedAt)}` : ''}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Read-only preview. Adopting copies this layout into your draft — it will not publish until you do.
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 1, sm: 2 } }}>
                  <Box
                    sx={{
                      maxWidth: 960,
                      mx: 'auto',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: theme.shadows[4],
                      bgcolor: 'background.paper',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <PublicSiteRenderer blocks={previewBlocks} siteStyles={siteStyles} />
                  </Box>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, px: 4, textAlign: 'center' }}>
                <Typography color='text.secondary'>
                  Select a version to view it, then adopt it into your draft.
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>
      {error ? (
        <Typography color='error.main' variant='body2' sx={{ px: 3, pt: 1.5 }}>
          {error}
        </Typography>
      ) : null}
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant='caption' color='text.secondary' sx={{ mr: 'auto', maxWidth: 420 }}>
          {isDirty
            ? 'Adopting replaces your current unpublished draft on this page.'
            : 'Adopting replaces the current draft on this page.'}
        </Typography>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button
          variant='contained'
          disabled={!selectedVersionId || !previewBlocks || restoringId !== null || previewLoading}
          onClick={() => void handleRestore()}
          startIcon={
            restoringId ? <CircularProgress size={14} color='inherit' /> : <i className='ri-check-line' />
          }
        >
          Adopt {selectedLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
