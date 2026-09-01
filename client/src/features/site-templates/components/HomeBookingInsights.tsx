'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { alpha, darken, useTheme } from '@mui/material/styles'

import type { BookingInsights, BookingInsightPoint } from '@/models/booking'
import type { ServiceListItem } from '@/services/booking/service-catalog.service'

type Props = {
  insights: BookingInsights | null
  services: ServiceListItem[]
}

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatCurrency(minor: number, currency: string): string {
  const normalizedCurrency = typeof currency === 'string' ? currency.trim().toUpperCase() : ''
  const safeCurrency = /^[A-Z]{3}$/.test(normalizedCurrency) ? normalizedCurrency : 'AUD'
  const amount = Number.isFinite(minor) ? minor / 100 : 0

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: 0
    }).format(amount)
  } catch {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0
    }).format(amount)
  }
}

export function HomeBookingInsights({ insights, services }: Props) {
  const theme = useTheme()
  const accent = theme.palette.primary.main
  const activeServices = services.filter(service => service.status === 'published')

  if (activeServices.length === 0) {
    return null
  }

  const data = insights ?? {
    rangeDays: 30,
    totalBookings: 0,
    seatsBooked: 0,
    seatsOffered: 0,
    utilization: 0,
    pendingRequests: 0,
    revenueMinor: 0,
    series: [],
    services: []
  }

  const series = data.series.length > 0 ? data.series : buildEmptySeries(data.rangeDays)
  const currency = activeServices[0]?.currency ?? 'AUD'

  return (
    <Box
      sx={{
        borderRadius: 4,
        p: { xs: 2, sm: 2.75, md: 3.25 },
        color: 'common.white',
        background: `radial-gradient(circle at 92% 0%, ${alpha('#67E8F9', 0.28)} 0%, transparent 32%), linear-gradient(135deg, #111827 0%, ${darken(accent, 0.62)} 46%, ${darken(accent, 0.18)} 100%)`,
        boxShadow: `0 22px 50px ${alpha(darken(accent, 0.5), 0.28)}`,
        overflow: 'hidden'
      }}
    >
      <Box className='flex items-start justify-between gap-3 flex-wrap' sx={{ mb: 2.5 }}>
        <Box>
          <Box className='flex items-center gap-1.5 flex-wrap' sx={{ mb: 0.75 }}>
            <Typography variant='h5' sx={{ color: 'common.white', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Booking command center
            </Typography>
            <Chip
              label={`Next ${data.rangeDays} days`}
              size='small'
              sx={{ color: 'common.white', bgcolor: alpha('#fff', 0.14), border: `1px solid ${alpha('#fff', 0.22)}` }}
            />
          </Box>
          <Typography sx={{ color: alpha('#fff', 0.76) }}>
            A live view of capacity, demand, and the services creating momentum.
          </Typography>
        </Box>
        {data.pendingRequests > 0 ? (
          <Chip
            icon={<i className='ri-notification-3-line' />}
            label={`${data.pendingRequests} needs attention`}
            sx={{ color: '#FEF3C7', bgcolor: alpha('#F59E0B', 0.2), border: `1px solid ${alpha('#FDE68A', 0.35)}` }}
          />
        ) : (
          <Chip
            icon={<i className='ri-checkbox-circle-line' />}
            label='All caught up'
            sx={{ color: '#BBF7D0', bgcolor: alpha('#22C55E', 0.16), border: `1px solid ${alpha('#86EFAC', 0.3)}` }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
          mb: 2.5
        }}
      >
        <Metric label='Active services' value={String(activeServices.length)} icon='ri-apps-2-line' />
        <Metric label='Seats offered' value={formatCount(data.seatsOffered)} icon='ri-stack-line' />
        <Metric label='Seats booked' value={formatCount(data.seatsBooked)} icon='ri-group-line' />
        <Metric label='Utilization' value={`${data.utilization}%`} icon='ri-pie-chart-2-line' />
        <Metric label='Booked value' value={formatCurrency(data.revenueMinor, currency)} icon='ri-line-chart-line' />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.65fr' }
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            bgcolor: alpha('#fff', 0.09),
            border: `1px solid ${alpha('#fff', 0.13)}`
          }}
        >
          <Box className='flex items-start justify-between gap-2 flex-wrap' sx={{ mb: 1 }}>
            <Box>
              <Typography sx={{ color: 'common.white', fontWeight: 700 }}>Capacity outlook</Typography>
              <Typography variant='caption' sx={{ color: alpha('#fff', 0.62) }}>
                Offered seats versus booked seats by day
              </Typography>
            </Box>
            <Box className='flex items-center gap-2.5'>
              <Legend color='#A5B4FC' label='Offered' />
              <Legend color='#67E8F9' label='Booked' />
            </Box>
          </Box>
          <CapacityChart series={series} />
        </Box>

        <Box
          sx={{
            minWidth: 0,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 3,
            bgcolor: alpha('#fff', 0.09),
            border: `1px solid ${alpha('#fff', 0.13)}`
          }}
        >
          <Typography sx={{ color: 'common.white', fontWeight: 700 }}>Top services</Typography>
          <Typography variant='caption' sx={{ color: alpha('#fff', 0.62) }}>
            Ranked by booked seats
          </Typography>
          <Box className='flex flex-col gap-1.5' sx={{ mt: 1.75 }}>
            {data.services.filter(service => activeServices.some(item => item.id === service.serviceId)).slice(0, 4).map(service => (
              <Box key={service.serviceId}>
                <Box className='flex items-center justify-between gap-2'>
                  <Typography variant='body2' noWrap sx={{ color: 'common.white', fontWeight: 650 }}>
                    {service.serviceName}
                  </Typography>
                  <Typography variant='caption' sx={{ color: alpha('#fff', 0.72), whiteSpace: 'nowrap' }}>
                    {service.seatsBooked} / {service.seatsOffered || '—'}
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={Math.min(100, service.utilization)}
                  sx={{
                    mt: 0.5,
                    height: 5,
                    borderRadius: 99,
                    bgcolor: alpha('#fff', 0.12),
                    '& .MuiLinearProgress-bar': { bgcolor: '#67E8F9' }
                  }}
                />
              </Box>
            ))}
            {data.services.filter(service => activeServices.some(item => item.id === service.serviceId)).length === 0 ? (
              <Typography variant='body2' sx={{ color: alpha('#fff', 0.68), mt: 1 }}>
                Your first booking will unlock service-level demand insights.
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <Box sx={{ p: 1.4, borderRadius: 2.5, bgcolor: alpha('#fff', 0.1), border: `1px solid ${alpha('#fff', 0.1)}` }}>
      <Box className='flex items-center gap-1.25' sx={{ color: alpha('#fff', 0.68), mb: 0.7 }}>
        <i className={icon} />
        <Typography variant='caption' noWrap sx={{ color: alpha('#fff', 0.78), fontWeight: 650 }}>
          {label}
        </Typography>
      </Box>
      <Typography variant='h6' noWrap sx={{ color: 'common.white', fontWeight: 800, letterSpacing: '-0.03em' }}>
        {value}
      </Typography>
    </Box>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Box className='flex items-center gap-1'>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography variant='caption' sx={{ color: alpha('#fff', 0.7) }}>
        {label}
      </Typography>
    </Box>
  )
}

function buildEmptySeries(days: number): BookingInsightPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()

    date.setUTCHours(0, 0, 0, 0)
    date.setUTCDate(date.getUTCDate() + index)

    return {
      date: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date),
      seatsOffered: 0,
      seatsBooked: 0
    }
  })
}

function CapacityChart({ series }: { series: BookingInsightPoint[] }) {
  const theme = useTheme()
  const width = 720
  const height = 205
  const padX = 12
  const padTop = 14
  const padBottom = 28
  const chartHeight = height - padTop - padBottom
  const chartWidth = width - padX * 2
  const max = Math.max(4, ...series.map(point => Math.max(point.seatsOffered, point.seatsBooked)))
  const step = series.length > 1 ? chartWidth / (series.length - 1) : 0

  const toPoint = (value: number, index: number) => ({
    x: padX + index * step,
    y: padTop + chartHeight - (value / max) * chartHeight
  })

  const offered = series.map((point, index) => toPoint(point.seatsOffered, index))
  const booked = series.map((point, index) => toPoint(point.seatsBooked, index))

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  const labels = series.filter((_, index) => index === 0 || index === series.length - 1 || index % 5 === 0)

  return (
    <Box component='svg' viewBox={`0 0 ${width} ${height}`} role='img' aria-label='Capacity offered and booked over the next 30 days' sx={{ display: 'block', width: '100%', height: { xs: 170, sm: 205 } }}>
      {[0.25, 0.5, 0.75, 1].map(line => (
        <line
          key={line}
          x1={padX}
          x2={width - padX}
          y1={padTop + chartHeight * (1 - line)}
          y2={padTop + chartHeight * (1 - line)}
          stroke={alpha('#fff', 0.13)}
          strokeDasharray='3 5'
        />
      ))}
      <path d={`${toPath(offered)} L ${offered[offered.length - 1]?.x ?? padX} ${padTop + chartHeight} L ${padX} ${padTop + chartHeight} Z`} fill={alpha('#A5B4FC', 0.12)} />
      <path d={toPath(offered)} fill='none' stroke='#A5B4FC' strokeWidth='2.5' strokeLinecap='round' />
      <path d={toPath(booked)} fill='none' stroke='#67E8F9' strokeWidth='2.5' strokeLinecap='round' />
      {labels.map(point => {
        const index = series.indexOf(point)

        return (
          <text
            key={point.date}
            x={toPoint(point.seatsOffered, index).x}
            y={height - 7}
            fill={alpha(theme.palette.common.white, 0.58)}
            fontSize='11'
            textAnchor={index === 0 ? 'start' : index === series.length - 1 ? 'end' : 'middle'}
          >
            {point.label}
          </text>
        )
      })}
    </Box>
  )
}
