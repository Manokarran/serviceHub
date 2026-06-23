'use client'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { HERO_VISUAL_GRADIENT_PRESETS } from '../constants/heroVisual'
import { builderSoftCardSx } from '../constants/builderChrome'
import { PropertyFieldLabel } from './property/PropertyPanelUi'

type Props = {
  colorStart: string
  colorEnd: string
  onColorStartChange: (value: string) => void
  onColorEndChange: (value: string) => void
  presetStart?: string
  presetEnd?: string
}

function ColorField({
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

export function AnimationGradientColorControls({
  colorStart,
  colorEnd,
  onColorStartChange,
  onColorEndChange,
  presetStart = '',
  presetEnd = ''
}: Props) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: 0.5 }}>
      <PropertyFieldLabel>Animation colors</PropertyFieldLabel>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))', gap: 0.75 }}>
        {HERO_VISUAL_GRADIENT_PRESETS.map(preset => {
          const isActive = presetStart === preset.start && presetEnd === preset.end

          return (
            <Tooltip key={preset.id} title={preset.label} placement='top'>
              <Box
                component='button'
                type='button'
                aria-label={preset.label}
                aria-pressed={isActive}
                onClick={() => {
                  onColorStartChange(preset.start)
                  onColorEndChange(preset.end)
                }}
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
      <ColorField label='Color start' value={colorStart} onChange={onColorStartChange} />
      <ColorField label='Color end' value={colorEnd} onChange={onColorEndChange} />
    </Box>
  )
}
