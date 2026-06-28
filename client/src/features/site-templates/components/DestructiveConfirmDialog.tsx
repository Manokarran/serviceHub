'use client'

import type { ReactNode } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

type Props = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  loading?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
  severity?: 'warning' | 'error'
}

export function DestructiveConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  loading = false,
  error = null,
  onClose,
  onConfirm,
  severity = 'warning'
}: Props) {
  const theme = useTheme()

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className='flex flex-col gap-3'>
        <Alert
          severity={severity}
          variant='outlined'
          icon={<i className={severity === 'error' ? 'ri-error-warning-line' : 'ri-alert-line'} />}
        >
          {description}
        </Alert>
        <Typography variant='body2' color='text.secondary'>
          Your <strong>live published site</strong> will not change until you publish again. Only your{' '}
          <strong>draft</strong> workspace is affected.
        </Typography>
        {error ? <Alert severity='error'>{error}</Alert> : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color={severity === 'error' ? 'error' : 'warning'}
          disabled={loading}
          onClick={onConfirm}
          sx={{
            ...(severity === 'warning'
              ? {
                  bgcolor: theme.palette.warning.main,
                  color: theme.palette.warning.contrastText,
                  '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.9) }
                }
              : {})
          }}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
