'use client'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

type BaseProps = {
  compact?: boolean
  floating?: boolean
  size?: 'sm' | 'md'
}

type Props = BaseProps & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })

export function BuilderAiButton({ compact = false, floating = false, size = 'sm', ...props }: Props) {
  const theme = useTheme()
  const large = size === 'md'
  const href = 'href' in props ? props.href : undefined
  const onClick = 'onClick' in props ? props.onClick : undefined

  return (
    <Tooltip title='Build with AI'>
      <Box
        {...(href
          ? { component: Link, href }
          : { component: 'button', type: 'button' as const, onClick })}
        aria-label='Build with AI'
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: large ? 0.85 : 0.625,
          height: floating ? 44 : large ? 48 : 36,
          width: floating ? (compact ? 46 : 148) : undefined,
          minWidth: floating ? (compact ? 46 : 148) : compact ? 36 : large ? 176 : 132,
          px: floating ? (compact ? 0 : 1.5) : compact ? 0.875 : large ? 2.1 : 1.4,
          overflow: 'hidden',
          border: 0,
          borderRadius: floating ? '24px 0 0 24px' : large ? 2 : 1.75,
          color: '#fff',
          cursor: 'pointer',
          textDecoration: 'none',
          flexShrink: 0,
          background: `linear-gradient(115deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          backgroundSize: '240% 240%',
          boxShadow: `0 8px 22px ${alpha(theme.palette.primary.main, 0.34)}`,
          animation: 'aiCanvasGradient 5s ease infinite, aiCanvasPulse 3s ease-in-out infinite',
          transition: 'width 0.28s ease, transform 0.18s ease, box-shadow 0.18s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            width: '42%',
            background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.54), transparent)',
            transform: 'translateX(-180%) skewX(-18deg)',
            animation: 'aiCanvasShine 3.8s ease-in-out infinite',
            pointerEvents: 'none'
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.46)}`
          },
          '&:focus-visible': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.35)}`,
            outlineOffset: 2
          },
          '@keyframes aiCanvasGradient': {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' }
          },
          '@keyframes aiCanvasPulse': {
            '0%, 100%': { filter: 'saturate(1)' },
            '50%': { filter: 'saturate(1.22)' }
          },
          '@keyframes aiCanvasShine': {
            '0%, 35%': { transform: 'translateX(-180%) skewX(-18deg)' },
            '65%, 100%': { transform: 'translateX(360%) skewX(-18deg)' }
          }
        }}
      >
        <i
          className='ri-sparkling-2-line'
          style={{ position: 'relative', zIndex: 1, fontSize: large ? '1.15rem' : '1rem' }}
        />
        {!compact && (
          <Typography
            component='span'
            className='builder-ai-label'
            sx={{
              position: 'relative',
              zIndex: 1,
              maxWidth: large ? 140 : 120,
              overflow: 'hidden',
              opacity: 1,
              whiteSpace: 'nowrap',
              fontSize: large ? '0.82rem' : '0.72rem',
              fontWeight: 750,
              lineHeight: 1,
              transition: 'max-width 0.28s ease, opacity 0.2s ease'
            }}
          >
            Build with AI
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}
