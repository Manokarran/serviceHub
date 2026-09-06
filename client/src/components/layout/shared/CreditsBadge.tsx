'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getMyCreditsSnapshotAction } from '@/app/actions/credits.actions'
import type { CreditCostMap } from '@/lib/constants/credits'
import { CREDIT_PRICING_DISPLAY } from '@/lib/constants/credits'

type CreditsState = {
  balance: number
  costs: CreditCostMap
  tenantApproved: boolean
  unlimited: boolean
}

export function CreditsBadge() {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<CreditsState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await getMyCreditsSnapshotAction()

      if (!result.success) {
        setError(result.error)
        setState(null)

        return
      }

      setError(null)
      setState({
        balance: result.balance,
        costs: result.costs,
        tenantApproved: result.tenantApproved,
        unlimited: result.unlimited
      })
    })
  }, [])

  useEffect(() => {
    refresh()

    const onFocus = () => refresh()

    window.addEventListener('focus', onFocus)

    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  useEffect(() => {
    const onCreditsChanged = () => refresh()

    window.addEventListener('credits:changed', onCreditsChanged)

    return () => window.removeEventListener('credits:changed', onCreditsChanged)
  }, [refresh])

  if (!state && !error) {
    return null
  }

  if (error && !state) {
    return (
      <Tooltip title={error}>
        <Chip
          clickable
          onClick={() => refresh()}
          icon={<i className='ri-coin-line' />}
          label='Credits'
          variant='outlined'
          color='warning'
          sx={{ fontWeight: 600, height: 32, '& .MuiChip-icon': { fontSize: '1rem' } }}
        />
      </Tooltip>
    )
  }

  const unlimited = state?.unlimited === true
  const balance = state?.balance ?? 0
  const low = !unlimited && balance <= 3
  const balanceLabel = unlimited ? 'Unlimited' : `${balance} credit${balance === 1 ? '' : 's'}`

  return (
    <>
      <Tooltip title={unlimited ? 'Super admin — unlimited AI credits' : 'AI & setup credits'}>
        <Chip
          clickable
          onClick={() => {
            setOpen(true)
            refresh()
          }}
          icon={<i className={unlimited ? 'ri-infinity-line' : 'ri-coin-line'} />}
          label={balanceLabel}
          color={unlimited ? 'success' : low ? 'warning' : 'default'}
          variant={unlimited || low ? 'filled' : 'outlined'}
          sx={{
            fontWeight: 600,
            height: 32,
            '& .MuiChip-icon': { fontSize: '1rem' }
          }}
        />
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography variant='h6'>Your AI credits</Typography>
            <Typography variant='body2' color='text.secondary'>
              {unlimited
                ? 'As a super admin, AI and service setup never use credits.'
                : 'Manual editing is unlimited. Credits apply only to AI and new services.'}
            </Typography>
          </Box>
          <IconButton aria-label='Close' onClick={() => setOpen(false)} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              p: 2.5,
              mb: 2.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`
            }}
          >
            <Typography variant='overline' color='text.secondary'>
              Available now
            </Typography>
            <Typography variant='h3' sx={{ fontWeight: 700, lineHeight: 1.1 }}>
              {pending && !state ? '…' : unlimited ? 'Unlimited' : balance}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75 }}>
              {unlimited
                ? 'No credit limits apply to your account.'
                : state?.tenantApproved
                  ? 'Your organization is approved — you can publish live.'
                  : 'Publish unlocks when a super admin approves you. Preview works now.'}
            </Typography>
          </Box>

          {error ? (
            <Typography color='error' variant='body2' sx={{ mb: 2 }}>
              {error}
            </Typography>
          ) : null}

          {!unlimited ? (
            <>
              <Typography variant='subtitle2' sx={{ mb: 1.25 }}>
                Credit usage
              </Typography>
              <Stack spacing={1.25} divider={<Divider flexItem />}>
                {CREDIT_PRICING_DISPLAY.map(row => {
                  const liveCost =
                    row.feature === 'ai_chat'
                      ? null
                      : state?.costs?.[row.feature as keyof CreditCostMap]

                  return (
                    <Box
                      key={row.title}
                      sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}
                    >
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {row.title}
                        </Typography>
                        {row.note ? (
                          <Typography variant='caption' color='text.secondary'>
                            {row.note}
                          </Typography>
                        ) : null}
                      </Box>
                      <Chip
                        size='small'
                        label={
                          liveCost != null ? `${liveCost} credit${liveCost === 1 ? '' : 's'}` : row.creditsLabel
                        }
                        variant='outlined'
                      />
                    </Box>
                  )
                })}
              </Stack>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => refresh()} disabled={pending}>
            Refresh
          </Button>
          <Button variant='contained' onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

/** Call after any successful credit spend so the navbar badge refreshes. */
export function notifyCreditsChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('credits:changed'))
  }
}
