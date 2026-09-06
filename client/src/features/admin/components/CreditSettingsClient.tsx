'use client'

import { useMemo, useState, useTransition } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { updatePlatformCreditSettingsAction } from '@/app/actions/credits.actions'
import {
  CREDIT_FEATURE_LABELS,
  CREDIT_FEATURES,
  type CreditCostMap,
  type CreditFeature
} from '@/lib/constants/credits'

type Props = {
  initialDefaultSignupCredits: number
  initialCosts: CreditCostMap
}

export function CreditSettingsClient({ initialDefaultSignupCredits, initialCosts }: Props) {
  const [defaultSignupCredits, setDefaultSignupCredits] = useState(String(initialDefaultSignupCredits))
  const [costs, setCosts] = useState<Record<CreditFeature, string>>(
    Object.fromEntries(CREDIT_FEATURES.map(feature => [feature, String(initialCosts[feature])])) as Record<
      CreditFeature,
      string
    >
  )
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const parsed = useMemo(() => {
    const signup = Number(defaultSignupCredits)
    const nextCosts = {} as CreditCostMap

    for (const feature of CREDIT_FEATURES) {
      nextCosts[feature] = Number(costs[feature])
    }

    return { signup, nextCosts }
  }, [costs, defaultSignupCredits])

  const save = () => {
    setError(null)
    setSaved(false)

    if (!Number.isFinite(parsed.signup) || parsed.signup < 0) {
      setError('Enter a valid default signup credit amount.')

      return
    }

    for (const feature of CREDIT_FEATURES) {
      if (!Number.isFinite(parsed.nextCosts[feature]) || parsed.nextCosts[feature] < 0) {
        setError(`Enter a valid cost for ${CREDIT_FEATURE_LABELS[feature].title}.`)

        return
      }
    }

    startTransition(async () => {
      const result = await updatePlatformCreditSettingsAction({
        defaultSignupCredits: Math.floor(parsed.signup),
        costs: Object.fromEntries(
          CREDIT_FEATURES.map(feature => [feature, Math.floor(parsed.nextCosts[feature])])
        ) as CreditCostMap
      })

      if (!result.success) {
        setError(result.error)

        return
      }

      setSaved(true)
      setDefaultSignupCredits(String(result.defaultSignupCredits))
      setCosts(
        Object.fromEntries(CREDIT_FEATURES.map(feature => [feature, String(result.costs[feature])])) as Record<
          CreditFeature,
          string
        >
      )
    })
  }

  return (
    <Box className='flex flex-col gap-4'>
      <Box>
        <Typography variant='h4' className='mbe-1'>
          AI credit settings
        </Typography>
        <Typography color='text.secondary'>
          Configure the welcome pack for new organizations and how many credits each AI or setup action uses.
        </Typography>
      </Box>

      {error ? <Alert severity='error'>{error}</Alert> : null}
      {saved ? <Alert severity='success'>Credit settings saved.</Alert> : null}

      <Card variant='outlined'>
        <CardContent className='flex flex-col gap-4'>
          <TextField
            label='Default signup credits'
            type='number'
            value={defaultSignupCredits}
            onChange={event => setDefaultSignupCredits(event.target.value)}
            helperText='Granted automatically when a new organization registers'
            inputProps={{ min: 0, max: 100000 }}
            sx={{ maxWidth: 280 }}
          />

          <Divider />

          <Typography variant='subtitle1' fontWeight={700}>
            Usage costs
          </Typography>

          <Stack spacing={2}>
            {CREDIT_FEATURES.map(feature => (
              <Box
                key={feature}
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: { xs: '1fr', sm: '1.4fr 140px' },
                  alignItems: 'center'
                }}
              >
                <Box>
                  <Typography variant='body2' fontWeight={600}>
                    {CREDIT_FEATURE_LABELS[feature].title}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {CREDIT_FEATURE_LABELS[feature].description}
                    {CREDIT_FEATURE_LABELS[feature].note ? ` — ${CREDIT_FEATURE_LABELS[feature].note}` : ''}
                  </Typography>
                </Box>
                <TextField
                  size='small'
                  type='number'
                  label='Credits'
                  value={costs[feature]}
                  onChange={event => setCosts(prev => ({ ...prev, [feature]: event.target.value }))}
                  inputProps={{ min: 0, max: 1000 }}
                />
              </Box>
            ))}
          </Stack>

          <Box>
            <Button variant='contained' disabled={pending} onClick={save}>
              {pending ? 'Saving…' : 'Save settings'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
