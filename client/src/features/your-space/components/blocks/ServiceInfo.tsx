'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { SERVICE_PURCHASE_MODE_LABELS, SERVICE_SLOT_MODE_LABELS } from '@/lib/constants/service'
import type { PublicService } from '@/services/booking/public-service.service'
import { formatDuration, formatMoney, formatPrice } from '@/features/services/utils/format'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  service: PublicService
  compact?: boolean
  showDuration?: boolean
  showPrice?: boolean
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${value}T12:00:00Z`))
}

function getLocationLabel(service: PublicService): string {
  if (service.locationLabel) {
    return service.locationLabel
  }

  return service.locationType === 'online' ? 'Online session' : 'In-person session'
}

function getBookingLabel(service: PublicService): string {
  if (service.purchaseMode === 'term') {
    return SERVICE_PURCHASE_MODE_LABELS.term
  }

  return service.bookingMode === 'request' ? 'Request to book' : 'Instant booking'
}

function getScheduleLabel(service: PublicService): string {
  if (service.scheduleStartDate && service.scheduleEndDate) {
    return `${formatDate(service.scheduleStartDate)} – ${formatDate(service.scheduleEndDate)}`
  }

  return service.purchaseMode === 'term' ? 'Full-term schedule' : 'Weekly availability'
}

function Detail({
  icon,
  label,
  value,
  accentColor
}: {
  icon: string
  label: string
  value: string
  accentColor: string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-start',
        p: 1.25,
        borderRadius: 2,
        bgcolor: alpha(accentColor, 0.055)
      }}
    >
      <Box sx={{ color: accentColor, lineHeight: 1, pt: 0.25 }}>
        <i className={icon} style={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant='body2' sx={{ fontWeight: 650, overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

export function ServiceInfo({ service, compact = false, showDuration = true, showPrice = true }: Props) {
  const siteStyles = useSiteStyles()

  const price =
    service.purchaseMode === 'term'
      ? `${formatMoney(service.priceAmountMinor, service.currency)} for the full term`
      : formatPrice(service.priceModel, service.priceAmountMinor, service.currency)

  return (
    <Stack spacing={compact ? 1.5 : 2}>
      {service.description ? (
        <Box>
          <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
            About this service
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={
              compact
                ? {
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 4
                  }
                : undefined
            }
          >
            {service.description}
          </Typography>
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1
        }}
      >
        {showDuration ? (
          <Detail
            icon='ri-time-line'
            label='Session length'
            value={formatDuration(service.durationMinutes)}
            accentColor={siteStyles.colors.accent}
          />
        ) : null}
        {showPrice ? (
          <Detail icon='ri-price-tag-3-line' label='Investment' value={price} accentColor={siteStyles.colors.accent} />
        ) : null}
        <Detail
          icon='ri-calendar-check-line'
          label='Booking'
          value={getBookingLabel(service)}
          accentColor={siteStyles.colors.accent}
        />
        <Detail
          icon='ri-group-line'
          label='Session format'
          value={SERVICE_SLOT_MODE_LABELS[service.slotMode]}
          accentColor={siteStyles.colors.accent}
        />
        <Detail
          icon='ri-map-pin-line'
          label='Location'
          value={getLocationLabel(service)}
          accentColor={siteStyles.colors.accent}
        />
        <Detail
          icon='ri-calendar-2-line'
          label='Schedule'
          value={getScheduleLabel(service)}
          accentColor={siteStyles.colors.accent}
        />
      </Box>

      {service.tags.length > 0 ? (
        <Stack direction='row' spacing={0.75} useFlexGap flexWrap='wrap'>
          {service.tags.map(tag => (
            <Chip key={tag} size='small' variant='outlined' label={tag} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
