'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import type { HeroRotatingWordStyle } from '../../types'
import {
  getHeroRotatingWordHighlightSx,
  HERO_ROTATING_WORD_STYLE_OPTIONS,
  resolveHeroRotatingWordStyle
} from '../../utils/heroRotatingWords'
import { PropertyFieldLabel } from './PropertyPanelUi'

type Props = {
  value: HeroRotatingWordStyle | undefined
  accentColor: string
  textColor: string
  onChange: (style: HeroRotatingWordStyle) => void
}

export function HeroRotatingWordStyleField({ value, accentColor, textColor, onChange }: Props) {
  const theme = useTheme()
  const selected = resolveHeroRotatingWordStyle(value)
  const selectedOption = HERO_ROTATING_WORD_STYLE_OPTIONS.find(option => option.id === selected)
  const surface = previewSurface(textColor)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <PropertyFieldLabel>Word color</PropertyFieldLabel>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {HERO_ROTATING_WORD_STYLE_OPTIONS.map(option => {
          const isSelected = option.id === selected

          const highlightSx = getHeroRotatingWordHighlightSx(option.id, {
            accent: accentColor,
            text: textColor
          })

          return (
            <Box
              key={option.id}
              component='button'
              type='button'
              aria-label={option.label}
              aria-pressed={isSelected}
              onClick={() => onChange(option.id)}
              sx={{
                ...builderSoftCardSx(theme, isSelected),
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 0.6,
                py: 0.5,
                cursor: 'pointer',
                textAlign: 'left',
                color: textColor
              }}
            >
              <Box
                aria-hidden
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: 28,
                  borderRadius: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: surface,
                  color: textColor,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  overflow: 'hidden'
                }}
              >
                <Box component='span' sx={highlightSx}>
                  studio
                </Box>
              </Box>
              <Typography
                component='span'
                sx={{
                  ...BUILDER_TYPOGRAPHY.label,
                  width: 52,
                  flexShrink: 0,
                  color: isSelected ? 'text.primary' : 'text.secondary',
                  m: 0
                }}
              >
                {option.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
      {selectedOption ? (
        <Typography
          component='p'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: alpha(theme.palette.text.primary, 0.45), m: 0 }}
        >
          {selectedOption.description}
        </Typography>
      ) : null}
    </Box>
  )
}

function previewSurface(textColor: string): string {
  const match = textColor.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

  if (!match) {
    return '#f6f3ee'
  }

  let hex = match[1]

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  return luminance > 0.62 ? '#241f1a' : '#f6f3ee'
}
