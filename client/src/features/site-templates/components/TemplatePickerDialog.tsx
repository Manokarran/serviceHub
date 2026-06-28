'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import { applySiteTemplateAction } from '@/app/actions/site-template.actions'
import type { SiteTemplateSummary } from '@/models/site-template'

import { DestructiveConfirmDialog } from './DestructiveConfirmDialog'
import { TemplateGallery } from './TemplateGallery'

type Props = {
  open: boolean
  templates: SiteTemplateSummary[]
  loading?: boolean
  isReplaceMode?: boolean
  onClose: () => void
  onScratch: () => void
  onApplied?: () => void
  title?: string
  subtitle?: string
  allowDismiss?: boolean
}

export function TemplatePickerDialog({
  open,
  templates,
  loading = false,
  isReplaceMode = false,
  onClose,
  onScratch,
  onApplied,
  title = 'How would you like to start?',
  subtitle = 'Pick a professionally designed layout and customize it, or begin with a blank canvas.',
  allowDismiss = true
}: Props) {
  const theme = useTheme()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedTemplate = templates.find(template => template.id === selectedId)

  const handleScratch = () => {
    setSelectedId(null)
    setError(null)
    onScratch()
  }

  const runApply = async () => {
    if (!selectedId) {
      return
    }

    setApplying(true)
    setError(null)

    const result = await applySiteTemplateAction(selectedId)

    if (!result.success) {
      setError(result.error)
      setApplying(false)
      setConfirmOpen(false)

      return
    }

    setApplying(false)
    setConfirmOpen(false)
    onApplied?.()
    router.refresh()
    onClose()
  }

  const handleApplyClick = () => {
    if (!selectedId) {
      return
    }

    if (isReplaceMode) {
      setConfirmOpen(true)

      return
    }

    void runApply()
  }

  const handleClose = () => {
    if (applying) {
      return
    }

    if (!allowDismiss) {
      return
    }

    setError(null)
    setConfirmOpen(false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth='lg'
        scroll='paper'
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              maxHeight: 'min(92vh, 920px)'
            }
          }
        }}
      >
        <Box
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 3, sm: 3.5 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: 'relative'
          }}
        >
          {allowDismiss ? (
            <IconButton
              aria-label='Close'
              onClick={handleClose}
              disabled={applying}
              sx={{ position: 'absolute', top: 12, right: 12 }}
            >
              <i className='ri-close-line' />
            </IconButton>
          ) : null}
          <Box className='flex items-start gap-3 max-is-[720px]'>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                color: 'primary.main',
                flexShrink: 0
              }}
            >
              <i className={isReplaceMode ? 'ri-exchange-line' : 'ri-layout-grid-line'} style={{ fontSize: '1.5rem' }} />
            </Box>
            <div>
              <Typography variant='h5' className='font-semibold mbe-1'>
                {title}
              </Typography>
              <Typography color='text.secondary'>{subtitle}</Typography>
            </div>
          </Box>
        </Box>

        <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>
          {isReplaceMode ? (
            <Alert severity='info' variant='outlined' className='mbe-4'>
              Applying a template updates your <strong>draft</strong> workspace. Visitors still see your current live
              site until you publish.
            </Alert>
          ) : null}

          {error ? (
            <Alert severity='error' className='mbe-4'>
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Box className='flex flex-col items-center justify-center gap-3 py-16'>
              <i className='ri-loader-4-line text-3xl text-primary animate-spin' />
              <Typography color='text.secondary'>Loading templates…</Typography>
            </Box>
          ) : templates.length ? (
            <TemplateGallery
              templates={templates}
              selectedId={selectedId}
              onSelect={setSelectedId}
              allowBlank={!isReplaceMode}
              variant='featured'
              showCategoryFilter
            />
          ) : (
            <Box
              className='flex flex-col items-center justify-center gap-3 py-12 text-center'
              sx={{ borderRadius: 2, bgcolor: 'action.hover', px: 4 }}
            >
              <i className='ri-layout-line text-4xl text-textSecondary' />
              <Typography variant='h6'>No templates available yet</Typography>
              <Typography color='text.secondary' className='max-is-[420px]'>
                {isReplaceMode
                  ? 'No published templates are available right now.'
                  : 'Start with a blank layout and build your site from scratch.'}
              </Typography>
              {!isReplaceMode ? (
                <Button variant='contained' onClick={handleScratch} sx={{ mt: 1 }}>
                  Start from scratch
                </Button>
              ) : null}
            </Box>
          )}
        </DialogContent>

        {templates.length ? (
          <DialogActions
            sx={{
              px: { xs: 3, sm: 4 },
              py: 2.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              gap: 1.5,
              flexWrap: 'wrap'
            }}
          >
            {allowDismiss ? (
              <Button onClick={handleClose} disabled={applying}>
                Cancel
              </Button>
            ) : null}
            <Box sx={{ flex: 1 }} />
            {!isReplaceMode ? (
              <Button variant='outlined' onClick={handleScratch} disabled={applying}>
                Start from scratch
              </Button>
            ) : null}
            <Button
              variant='contained'
              disabled={!selectedId || applying || loading}
              onClick={() => void handleApplyClick()}
              startIcon={applying ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-check-line' />}
            >
              {applying
                ? 'Applying template…'
                : isReplaceMode
                  ? 'Replace with template'
                  : 'Use selected template'}
            </Button>
          </DialogActions>
        ) : null}
      </Dialog>

      <DestructiveConfirmDialog
        open={confirmOpen}
        title='Replace draft site with template?'
        description={
          <>
            <strong>{selectedTemplate?.name ?? 'This template'}</strong> will replace your current draft pages and
            styles. Extra pages you added may be kept but their drafts can be overwritten if the template includes the
            same page URLs.
          </>
        }
        confirmLabel='Replace draft site'
        loading={applying}
        error={error}
        onClose={() => {
          if (!applying) {
            setConfirmOpen(false)
            setError(null)
          }
        }}
        onConfirm={() => void runApply()}
      />
    </>
  )
}
