'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import { resetSiteDraftsAction } from '@/app/actions/site-workspace.actions'
import type { ResetSiteDraftsMode } from '@/services/site-workspace'

type Props = {
  open: boolean
  onClose: () => void
  extraPageCount: number
}

export function SiteResetDialog({ open, onClose, extraPageCount }: Props) {
  const theme = useTheme()
  const router = useRouter()
  const [mode, setMode] = useState<ResetSiteDraftsMode>('starter')
  const [removeExtraPages, setRemoveExtraPages] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    if (loading) {
      return
    }

    setError(null)
    onClose()
  }

  const handleReset = async () => {
    setLoading(true)
    setError(null)

    const result = await resetSiteDraftsAction(mode, removeExtraPages)

    if (!result.success) {
      setError(result.error)
      setLoading(false)

      return
    }

    setLoading(false)
    router.refresh()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
      <Box
        sx={{
          px: 3,
          py: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, transparent 100%)`
        }}
      >
        <Typography variant='h6' className='font-semibold mbe-1'>
          Start fresh
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Reset your draft website to a clean starting point. Your live site stays as-is until you publish.
        </Typography>
      </Box>

      <DialogContent className='flex flex-col gap-4 pt-4'>
        <Alert severity='warning' variant='outlined'>
          This replaces your current <strong>draft</strong> pages. Published content on your live site is unchanged
          until you publish again.
        </Alert>

        <div>
          <Typography variant='subtitle2' className='mbe-2'>
            New starting layout
          </Typography>
          <RadioGroup value={mode} onChange={event => setMode(event.target.value as ResetSiteDraftsMode)}>
            <FormControlLabel
              value='starter'
              control={<Radio />}
              label={
                <div>
                  <Typography className='font-medium'>Default starter layout</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Header, hero, and about section on the home page.
                  </Typography>
                </div>
              }
            />
            <FormControlLabel
              value='blank'
              control={<Radio />}
              label={
                <div>
                  <Typography className='font-medium'>Blank canvas</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Empty home page — add every block yourself.
                  </Typography>
                </div>
              }
            />
          </RadioGroup>
        </div>

        {extraPageCount > 0 ? (
          <FormControlLabel
            control={
              <Switch
                checked={removeExtraPages}
                onChange={event => setRemoveExtraPages(event.target.checked)}
              />
            }
            label={
              <div>
                <Typography className='font-medium'>Remove extra pages ({extraPageCount})</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {removeExtraPages
                    ? 'Keep only the home page in your draft workspace.'
                    : 'Keep extra pages but clear their draft content.'}
                </Typography>
              </div>
            }
          />
        ) : null}

        {error ? <Alert severity='error'>{error}</Alert> : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant='contained'
          color='warning'
          disabled={loading}
          onClick={() => void handleReset()}
          startIcon={<i className='ri-refresh-line' />}
        >
          {loading ? 'Resetting…' : 'Reset draft site'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
