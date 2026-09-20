'use client'

import { useState, useTransition } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import { applyChromeBlockToAllPagesAction } from '@/app/actions/site-page.actions'
import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { useBuilder } from '../../../context/BuilderContext'
import type { FooterBlockProps, HeaderBlockProps } from '../../../types'
import { PropertySection } from '../PropertyPanelUi'

type Props = {
  chromeType: 'header' | 'footer'
  props: HeaderBlockProps | FooterBlockProps
}

export function ApplyChromeToAllPagesControl({ chromeType, props }: Props) {
  const { pages, currentPageSlug, builderScope, libraryTemplateId, savePage, refreshPages } = useBuilder()
  const [pending, startTransition] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const otherPages = pages.filter(page => page.slug !== currentPageSlug)
  const label = chromeType === 'header' ? 'header' : 'footer'

  if (otherPages.length === 0) {
    return null
  }

  const handleCloseConfirm = () => {
    if (pending) {
      return
    }

    setConfirmOpen(false)
  }

  const handleConfirmApply = () => {
    setMessage(null)
    startTransition(async () => {
      try {
        await savePage()

        const result = await applyChromeBlockToAllPagesAction(
          chromeType,
          props,
          builderScope,
          libraryTemplateId ?? undefined
        )

        if (!result.success) {
          setMessage({ type: 'error', text: result.error })
          setConfirmOpen(false)

          return
        }

        await refreshPages()
        setConfirmOpen(false)

        if (result.updatedPages === 0) {
          setMessage({
            type: 'error',
            text: `No other pages have a ${label} to update.`
          })

          return
        }

        setMessage({
          type: 'success',
          text: `Updated ${label} on ${result.updatedPages} page${result.updatedPages === 1 ? '' : 's'}.`
        })
      } catch {
        setMessage({ type: 'error', text: `Failed to apply ${label} to all pages.` })
        setConfirmOpen(false)
      }
    })
  }

  return (
    <PropertySection title='Sync across pages' collapsible defaultOpen>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Typography variant='body2' color='text.secondary'>
          Copy this {label}’s links, branding, and style onto every other page that already has a {label}.
        </Typography>
        <Button
          variant='outlined'
          size='small'
          disabled={pending}
          startIcon={<i className='ri-file-copy-2-line' />}
          onClick={() => setConfirmOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Apply {label} to all pages
        </Button>
        {message ? (
          <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ py: 0 }}>
            {message.text}
          </Alert>
        ) : null}
      </Box>

      <Dialog open={confirmOpen} onClose={handleCloseConfirm} fullWidth maxWidth='xs'>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>Apply {label} to all pages?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This copies links, branding, and style from this {label} onto every other page that already has a{' '}
            {label}. Pages without a {label} are left unchanged.
          </DialogContentText>
          <DialogContentText sx={{ mt: 1.5 }}>
            Draft pages only — publish when you’re ready for the live site.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={handleConfirmApply}
            disabled={pending}
            startIcon={
              pending ? <CircularProgress size={14} color='inherit' /> : <i className='ri-file-copy-2-line' />
            }
          >
            {pending ? 'Applying…' : `Apply ${label}`}
          </Button>
        </DialogActions>
      </Dialog>
    </PropertySection>
  )
}
