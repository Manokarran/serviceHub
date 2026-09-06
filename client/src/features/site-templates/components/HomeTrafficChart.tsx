'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { SiteAnalyticsDayPoint } from '@/models/site-analytics'

import { HOME_PALETTE } from '../constants/home-theme'

type Props = {
  series: SiteAnalyticsDayPoint[]
  hasPublishedSite: boolean
}

type HoverPoint = {
  index: number
  x: number
  y: number
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }

  const segments = points.map((point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`
    }

    const previous = points[index - 1]
    const midX = (previous.x + point.x) / 2

    return `C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`
  })

  return segments.join(' ')
}

export function HomeTrafficChart({ series, hasPublishedSite }: Props) {
  const theme = useTheme()
  const [hover, setHover] = useState<HoverPoint | null>(null)

  const width = 640
  const height = 220
  const padX = 16
  const padTop = 18
  const padBottom = 32
  const chartWidth = width - padX * 2
  const chartHeight = height - padTop - padBottom
  const accent = HOME_PALETTE.accent
  const clickColor = HOME_PALETTE.pink
  const ink = theme.palette.text.primary
  const grid = alpha(ink, theme.palette.mode === 'dark' ? 0.2 : 0.12)
  const axis = alpha(ink, theme.palette.mode === 'dark' ? 0.78 : 0.62)

  const { viewPoints, clickPoints } = useMemo(() => {
    const peak = Math.max(4, ...series.map(point => Math.max(point.views, point.clicks)))
    const step = series.length > 1 ? chartWidth / (series.length - 1) : 0
    const toY = (value: number) => padTop + chartHeight - (value / peak) * chartHeight

    return {
      viewPoints: series.map((point, index) => ({
        x: padX + index * step,
        y: toY(point.views)
      })),
      clickPoints: series.map((point, index) => ({
        x: padX + index * step,
        y: toY(point.clicks)
      }))
    }
  }, [chartHeight, chartWidth, series])

  const viewPath = buildSmoothPath(viewPoints)
  const clickPath = buildSmoothPath(clickPoints)

  const areaPath = viewPoints.length
    ? `${viewPath} L ${viewPoints[viewPoints.length - 1].x} ${padTop + chartHeight} L ${viewPoints[0].x} ${padTop + chartHeight} Z`
    : ''

  const hasTraffic = series.some(point => point.views > 0 || point.clicks > 0)
  const active = hover ? series[hover.index] : null

  const labelIndexes = series
    .map((_, index) => index)
    .filter(index => index === 0 || index === series.length - 1 || index % 3 === 0)

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        component='svg'
        viewBox={`0 0 ${width} ${height}`}
        sx={{ width: '100%', height: { xs: 188, md: 220 }, display: 'block' }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={event => {
          if (!hasTraffic) {
            return
          }

          const bounds = event.currentTarget.getBoundingClientRect()
          const ratio = (event.clientX - bounds.left) / bounds.width
          const index = Math.min(series.length - 1, Math.max(0, Math.round(ratio * (series.length - 1))))
          const point = viewPoints[index]

          if (!point) {
            return
          }

          setHover({ index, x: point.x, y: point.y })
        }}
      >
        <defs>
          <linearGradient id='homeViewsFill' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={accent} stopOpacity={0.38} />
            <stop offset='70%' stopColor={accent} stopOpacity={0.1} />
            <stop offset='100%' stopColor={accent} stopOpacity={0.02} />
          </linearGradient>
          <filter id='homeTrafficGlow' x='-20%' y='-20%' width='140%' height='140%'>
            <feGaussianBlur stdDeviation='2.5' result='blur' />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        {[0.25, 0.5, 0.75, 1].map(line => (
          <line
            key={line}
            x1={padX}
            x2={width - padX}
            y1={padTop + chartHeight * line}
            y2={padTop + chartHeight * line}
            stroke={grid}
            strokeWidth={1}
          />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map(line => (
          <text
            key={`axis-${line}`}
            x={2}
            y={padTop + chartHeight * (1 - line) + 4}
            fill={axis}
            fontSize='10'
            fontFamily='inherit'
          >
            {Math.round((Math.max(4, ...series.map(point => Math.max(point.views, point.clicks))) * line) / 1)}
          </text>
        ))}

        {areaPath ? <path d={areaPath} fill='url(#homeViewsFill)' /> : null}
        {viewPath ? (
          <path d={viewPath} fill='none' stroke={accent} strokeWidth={2.8} strokeLinecap='round' filter='url(#homeTrafficGlow)' />
        ) : null}
        {clickPath ? (
          <path
            d={clickPath}
            fill='none'
            stroke={clickColor}
            strokeWidth={2}
            strokeDasharray='5 5'
            strokeLinecap='round'
            opacity={0.9}
          />
        ) : null}

        {viewPoints[viewPoints.length - 1] ? (
          <circle
            cx={viewPoints[viewPoints.length - 1].x}
            cy={viewPoints[viewPoints.length - 1].y}
            r={4.5}
            fill={accent}
          />
        ) : null}

        {hover && viewPoints[hover.index] ? (
          <>
            <line
              x1={viewPoints[hover.index].x}
              x2={viewPoints[hover.index].x}
              y1={padTop}
              y2={padTop + chartHeight}
              stroke={alpha(accent, 0.35)}
              strokeWidth={1.5}
            />
            <circle cx={viewPoints[hover.index].x} cy={viewPoints[hover.index].y} r={5} fill={accent} />
            <circle cx={clickPoints[hover.index].x} cy={clickPoints[hover.index].y} r={4} fill={clickColor} />
          </>
        ) : null}

        {labelIndexes.map(index => (
          <text
            key={series[index].date}
            x={viewPoints[index]?.x ?? padX}
            y={height - 8}
            textAnchor={index === 0 ? 'start' : index === series.length - 1 ? 'end' : 'middle'}
            fill={axis}
            fontSize='11'
            fontFamily='inherit'
          >
            {series[index].label}
          </text>
        ))}
      </Box>

      {hover && active ? (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: `clamp(0px, calc(${(hover.x / width) * 100}% - 78px), calc(100% - 168px))`,
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `0 10px 24px ${alpha(ink, 0.12)}`,
            pointerEvents: 'none',
            minWidth: 148
          }}
        >
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
            {active.label}
          </Typography>
          <Typography variant='caption' sx={{ display: 'block', color: accent, fontWeight: 700 }}>
            {active.views} views
          </Typography>
          <Typography variant='caption' sx={{ display: 'block', color: clickColor, fontWeight: 700 }}>
            {active.clicks} CTA clicks
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
            {active.uniqueVisitors} visitors · {active.leads} leads
          </Typography>
        </Box>
      ) : null}

      {!hasTraffic ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            pb: 3
          }}
        >
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
            {hasPublishedSite
              ? 'Waiting for visitors — numbers appear as people open your live site.'
              : 'Publish your site to start tracking visits and clicks.'}
          </Typography>
        </Box>
      ) : null}
    </Box>
  )
}
