'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { SiteAnalyticsOverview } from '@/models/site-analytics'

import { HomeTrafficChart } from './HomeTrafficChart'

type Props = {
  analytics: SiteAnalyticsOverview
  hasPublishedSite: boolean
}

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
  }

  return String(value)
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current > 0 ? 100 : null
  }

  return Math.round(((current - previous) / previous) * 100)
}

function conversionRate(leads: number, visitors: number): string {
  if (visitors <= 0) {
    return '—'
  }

  return `${((leads / visitors) * 100).toFixed(leads / visitors < 0.1 ? 1 : 0)}%`
}

export function HomeAnalyticsSection({ analytics, hasPublishedSite }: Props) {
  const theme = useTheme()

  const cards = [
    {
      key: 'views',
      label: 'Page views',
      hint: `${analytics.kpiDays} days`,
      value: analytics.current.views,
      previous: analytics.previous.views,
      icon: 'ri-eye-line',
      color: theme.palette.primary.main
    },
    {
      key: 'visitors',
      label: 'Unique visitors',
      hint: `${analytics.kpiDays} days`,
      value: analytics.current.uniqueVisitors,
      previous: analytics.previous.uniqueVisitors,
      icon: 'ri-user-smile-line',
      color: theme.palette.info.main
    },
    {
      key: 'clicks',
      label: 'CTA clicks',
      hint: 'Buttons & links',
      value: analytics.current.clicks,
      previous: analytics.previous.clicks,
      icon: 'ri-cursor-line',
      color: theme.palette.warning.main
    },
    {
      key: 'leads',
      label: 'Contact leads',
      hint: `${conversionRate(analytics.current.leads, analytics.current.uniqueVisitors)} visit → lead`,
      value: analytics.current.leads,
      previous: analytics.previous.leads,
      icon: 'ri-mail-send-line',
      color: theme.palette.success.main
    }
  ]

  return (
    <Box className='flex flex-col gap-4'>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }
        }}
      >
        {cards.map(card => {
          const trend = trendPercent(card.value, card.previous)
          const up = (trend ?? 0) >= 0

          return (
            <Box
              key={card.key}
              sx={{
                borderRadius: 3,
                p: 2.25,
                minHeight: 118,
                border: `1px solid ${alpha(card.color, 0.18)}`,
                background: `linear-gradient(180deg, ${alpha(card.color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.92)} 58%)`,
                boxShadow: `0 10px 24px ${alpha(theme.palette.text.primary, 0.04)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25
              }}
            >
              <Box className='flex items-start justify-between gap-2'>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(card.color, 0.16),
                    color: card.color
                  }}
                >
                  <i className={card.icon} style={{ fontSize: '1.15rem' }} />
                </Box>
                {trend !== null ? (
                  <Chip
                    size='small'
                    label={`${up ? '+' : ''}${trend}%`}
                    color={up ? 'success' : 'error'}
                    variant='tonal'
                    sx={{ height: 22, fontWeight: 700, '& .MuiChip-label': { px: 1 } }}
                  />
                ) : (
                  <Typography variant='caption' color='text.disabled'>
                    New
                  </Typography>
                )}
              </Box>
              <div>
                <Typography variant='h4' sx={{ fontWeight: 750, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                  {formatCount(card.value)}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 600, mt: 0.4 }}>
                  {card.label}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {card.hint}
                </Typography>
              </div>
            </Box>
          )
        })}
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.25, md: 3 },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          background: `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.info.main, 0.13)} 0%, transparent 34%), linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 48%)`,
          boxShadow: `0 18px 38px ${alpha(theme.palette.primary.main, 0.08)}`
        }}
      >
        <Box className='flex items-start justify-between gap-3 flex-wrap' sx={{ mb: 1.5 }}>
          <Box>
            <Box className='flex items-center gap-2 flex-wrap'>
              <Typography variant='h6' sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}>
                Live site traffic
              </Typography>
              <Chip
                icon={<i className='ri-pulse-line' />}
                label={hasPublishedSite ? 'Live signal' : 'Not published'}
                size='small'
                color={hasPublishedSite ? 'success' : 'default'}
                variant='tonal'
                sx={{ height: 24, fontWeight: 700 }}
              />
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
              Last {analytics.rangeDays} days · visitors, views, and actions from your published site.
            </Typography>
          </Box>
          <Box className='flex items-center gap-3 flex-wrap'>
            <TrafficStat label='Views' value={formatCount(analytics.current.views)} color={theme.palette.primary.main} />
            <TrafficStat
              label='Visitors'
              value={formatCount(analytics.current.uniqueVisitors)}
              color={theme.palette.info.main}
            />
            <TrafficStat
              label='Lead rate'
              value={conversionRate(analytics.current.leads, analytics.current.uniqueVisitors)}
              color={theme.palette.success.main}
            />
          </Box>
        </Box>
        <Box
          sx={{
            p: { xs: 0.75, sm: 1.25 },
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.background.paper, 0.62),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box className='flex items-center justify-between gap-3 flex-wrap' sx={{ px: { xs: 0.75, sm: 1 }, pt: 0.5 }}>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              Daily activity
            </Typography>
            <Box className='flex items-center gap-3'>
              <LegendDot color={theme.palette.primary.main} label='Views' />
              <LegendDot color={theme.palette.warning.main} label='CTA clicks' dashed />
            </Box>
          </Box>
          <HomeTrafficChart series={analytics.series} hasPublishedSite={hasPublishedSite} />
        </Box>
      </Box>
    </Box>
  )
}

function TrafficStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Box
      sx={{
        minWidth: 72,
        px: 1.25,
        py: 0.8,
        borderRadius: 2,
        bgcolor: alpha(color, 0.09),
        border: `1px solid ${alpha(color, 0.16)}`
      }}
    >
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', fontWeight: 650 }}>
        {label}
      </Typography>
      <Typography variant='body2' sx={{ color, fontWeight: 800, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  )
}

function LegendDot({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <Box className='flex items-center gap-1.5'>
      <Box
        sx={{
          width: dashed ? 16 : 10,
          height: dashed ? 0 : 10,
          borderRadius: dashed ? 0 : '50%',
          bgcolor: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : 'none'
        }}
      />
      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  )
}
