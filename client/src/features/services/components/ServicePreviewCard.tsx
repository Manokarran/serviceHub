'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { ServiceLocationType, ServicePriceModel, ServiceSlotMode } from '@/lib/constants/service'
import type { ServiceSlotSummary } from '@/models/service-slot'
import { getBrowserTimeZone } from '@/lib/utils/timezone'

import { formatClock, formatDayHeading, formatDuration, formatPrice } from '../utils/format'

type Props = {
  name: string
  tagline: string
  durationMinutes: number
  slotMode: ServiceSlotMode
  locationType: ServiceLocationType
  locationLabel: string
  priceModel: ServicePriceModel
  priceAmountMinor: number
  currency: string
  timezone: string
  coverImageUrl: string
  slots: ServiceSlotSummary[]
}

/** Scarcity is only worth shouting about once a session is nearly full. */
function seatTone(slot: ServiceSlotSummary): 'ok' | 'low' | 'full' {
  if (slot.seatsAvailable <= 0) {
    return 'full'
  }

  return slot.seatsAvailable / slot.capacity <= 0.25 ? 'low' : 'ok'
}

export function ServicePreviewCard({
  name,
  tagline,
  durationMinutes,
  slotMode,
  locationType,
  locationLabel,
  priceModel,
  priceAmountMinor,
  currency,
  timezone,
  coverImageUrl,
  slots
}: Props) {
  const theme = useTheme()
  const isOneToOne = slotMode === 'rolling'
  const [visitorTimezone, setVisitorTimezone] = useState(timezone)

  useEffect(() => {
    setVisitorTimezone(getBrowserTimeZone())
  }, [])

  const displayTimezone = visitorTimezone || timezone

  const firstDay = slots[0] ? slots[0].startAt : null

  const getDayKey = (iso: string) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: displayTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(iso))

  const sameDaySlots = firstDay
    ? slots.filter(slot => getDayKey(slot.startAt) === getDayKey(firstDay)).slice(0, 6)
    : []

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
        position: 'sticky',
        top: 24
      }}
    >
      <Box
        sx={{
          height: 132,
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          p: 4
        }}
      >
        <Chip
          size='small'
          label={isOneToOne ? 'One-to-one' : 'Group session'}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Box>

      <Stack spacing={3} sx={{ p: 5 }}>
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Preview of your public booking card
          </Typography>
          <Typography variant='h5' sx={{ mt: 1 }}>
            {name || 'Untitled service'}
          </Typography>
          {tagline ? (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              {tagline}
            </Typography>
          ) : null}
        </Box>

        <Stack direction='row' spacing={2} alignItems='baseline'>
          <Typography variant='h4'>{formatPrice(priceModel, priceAmountMinor, currency).split(' ')[0]}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {formatPrice(priceModel, priceAmountMinor, currency).split(' ').slice(1).join(' ')}
          </Typography>
        </Stack>

        <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
          <Chip size='small' variant='outlined' label={formatDuration(durationMinutes)} />
          <Chip size='small' variant='outlined' label={locationType === 'online' ? 'Online' : locationLabel || 'In person'} />
          <Chip size='small' variant='outlined' label={`Your time · ${displayTimezone}`} />
        </Stack>

        <Divider />

        {sameDaySlots.length > 0 && firstDay ? (
          <Stack spacing={2}>
            <Typography variant='body2' color='text.secondary'>
              {formatDayHeading(firstDay, displayTimezone)}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {sameDaySlots.map(slot => {
                const tone = seatTone(slot)

                return (
                  <Box
                    key={slot.id}
                    sx={{
                      minWidth: 88,
                      px: 3,
                      py: 2,
                      borderRadius: 1,
                      opacity: tone === 'full' ? 0.45 : 1,
                      border: `1px solid ${
                        tone === 'low' ? theme.palette.warning.main : theme.palette.divider
                      }`
                    }}
                  >
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {formatClock(slot.startAt, displayTimezone)}
                    </Typography>
                    {!isOneToOne ? (
                      <Typography
                        variant='caption'
                        color={tone === 'low' ? 'warning.main' : 'text.secondary'}
                      >
                        {tone === 'full' ? 'Full' : `${slot.seatsAvailable} left`}
                      </Typography>
                    ) : (
                      <Typography variant='caption' color='text.secondary'>
                        {tone === 'full' ? 'Booked' : 'Available'}
                      </Typography>
                    )}
                  </Box>
                )
              })}
            </Box>
          </Stack>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            Paint some availability on the Schedule tab and upcoming times will appear here.
          </Typography>
        )}

        <Button variant='contained' fullWidth disabled>
          Book with Google
        </Button>
        <Typography variant='caption' color='text.disabled' sx={{ textAlign: 'center' }}>
          Visitors browse freely and only sign in at this final step
        </Typography>
      </Stack>
    </Box>
  )
}
