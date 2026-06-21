'use client'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  DEFAULT_HERO_SPLIT_VISUAL_ANIMATION,
  HERO_SPLIT_VISUAL_ANIMATION_OPTIONS,
  HERO_VISUAL_GRADIENT_PRESETS
} from '../constants/heroVisual'
import type { HeroSplitVisualAnimation, SplitVisualConfig } from '../types'
import { resolveHeroVisualColors } from '../utils/heroVisualHelpers'
import { builderSoftCardSx } from '../constants/builderChrome'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { PropertyFieldLabel } from './property/PropertyPanelUi'

type Props = {
  config: SplitVisualConfig
  accentColor: string
  onUpdate: (changes: Partial<SplitVisualConfig>) => void
}

function HeroColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <TextField label={label} size='small' fullWidth value={value} onChange={e => onChange(e.target.value)} />
      <Box
        component='input'
        type='color'
        value={value}
        onChange={e => onChange(e.target.value)}
        sx={{
          width: 32,
          height: 32,
          border: 'none',
          borderRadius: 0.75,
          cursor: 'pointer',
          flexShrink: 0,
          p: 0,
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`
        }}
      />
    </Box>
  )
}

function AnimationOptionButton({
  option,
  active,
  onClick
}: {
  option: (typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS)[number]
  active: boolean
  onClick: () => void
}) {
  const theme = useTheme()

  return (
    <Tooltip title={option.label} placement='top'>
      <Box
        component='button'
        type='button'
        aria-label={option.label}
        aria-pressed={active}
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          py: 0.75,
          px: 0.25,
          border: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          minHeight: 52,
          ...builderSoftCardSx(theme, active),
          color: active ? 'primary.main' : 'text.secondary'
        }}
      >
        <i className={option.icon} style={{ fontSize: '0.95rem' }} />
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            fontSize: '0.625rem',
            lineHeight: 1.2,
            textAlign: 'center',
            color: 'inherit',
            px: 0.25
          }}
        >
          {option.label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export function HeroSplitPanelControls({ config, accentColor, onUpdate }: Props) {
  const theme = useTheme()
  const animation = config.splitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION
  const colors = resolveHeroVisualColors(config, accentColor)
  const classicOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'classic')
  const modernOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'modern')

  const renderAnimationGroup = (title: string, options: typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0.75
        }}
      >
        {options.map(option => (
          <AnimationOptionButton
            key={option.value}
            option={option}
            active={animation === option.value}
            onClick={() => onUpdate({ splitVisualAnimation: option.value as HeroSplitVisualAnimation })}
          />
        ))}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {renderAnimationGroup('Classic', classicOptions)}
      {renderAnimationGroup('Modern', modernOptions)}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <PropertyFieldLabel>Gradient presets</PropertyFieldLabel>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.75 }}>
          {HERO_VISUAL_GRADIENT_PRESETS.map(preset => {
            const isActive =
              (config.splitVisualColorStart ?? '') === preset.start && (config.splitVisualColorEnd ?? '') === preset.end

            return (
              <Tooltip key={preset.id} title={preset.label} placement='top'>
                <Box
                  component='button'
                  type='button'
                  aria-label={preset.label}
                  aria-pressed={isActive}
                  onClick={() => onUpdate({ splitVisualColorStart: preset.start, splitVisualColorEnd: preset.end })}
                  sx={{
                    aspectRatio: '1',
                    border: 'none',
                    borderRadius: 1,
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)`,
                    outline: isActive ? '2px solid' : '1px solid',
                    outlineColor: isActive ? 'primary.main' : alpha(theme.palette.divider, 0.9),
                    outlineOffset: 1
                  }}
                />
              </Tooltip>
            )
          })}
        </Box>
      </Box>
      <HeroColorField
        label='Gradient start'
        value={config.splitVisualColorStart || colors.start}
        onChange={splitVisualColorStart => onUpdate({ splitVisualColorStart })}
      />
      <HeroColorField
        label='Gradient end'
        value={config.splitVisualColorEnd || colors.end}
        onChange={splitVisualColorEnd => onUpdate({ splitVisualColorEnd })}
      />
    </Box>
  )
}
