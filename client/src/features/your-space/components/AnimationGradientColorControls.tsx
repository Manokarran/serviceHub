'use client'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  HERO_VISUAL_GRADIENT_PRESETS,
  buildThemeMatchedGradientPresets,
  type HeroVisualGradientPreset
} from '../constants/heroVisual'
import { builderSoftCardSx } from '../constants/builderChrome'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { PropertyFieldLabel } from './property/PropertyPanelUi'
import { useSiteStyles } from './SiteStylesScope'

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
      <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size='small'
          fullWidth
          value={value}
          onChange={e => onChange(e.target.value)}
          inputProps={{ 'aria-label': label }}
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.8125rem'
            }
          }}
        />
        <Box
          component='input'
          type='color'
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#888888'}
          onChange={e => onChange(e.target.value)}
          aria-label={`${label} picker`}
          sx={{
            width: 36,
            height: 36,
            border: 'none',
            borderRadius: 1,
            cursor: 'pointer',
            flexShrink: 0,
            p: 0,
            boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}`
          }}
        />
      </Box>
    </Box>
  )
}

function PresetSwatchGrid({
  presets,
  presetStart,
  presetEnd,
  onPick
}: {
  presets: HeroVisualGradientPreset[]
  presetStart: string
  presetEnd: string
  onPick: (preset: HeroVisualGradientPreset) => void
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        gap: 0.75
      }}
    >
      {presets.map(preset => {
        const isActive =
          presetStart.toLowerCase() === preset.start.toLowerCase() &&
          presetEnd.toLowerCase() === preset.end.toLowerCase()

        return (
          <Tooltip key={preset.id} title={preset.label} placement='top'>
            <Box
              component='button'
              type='button'
              aria-label={preset.label}
              aria-pressed={isActive}
              onClick={() => onPick(preset)}
              sx={{
                aspectRatio: '1',
                border: 'none',
                borderRadius: 1.25,
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)`,
                outline: isActive ? '2px solid' : '1px solid',
                outlineColor: isActive ? 'primary.main' : alpha(theme.palette.divider, 0.85),
                outlineOffset: 1,
                boxShadow: isActive ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                transition: 'outline-color 0.12s ease, box-shadow 0.12s ease'
              }}
            />
          </Tooltip>
        )
      })}
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
  const siteStyles = useSiteStyles()
  const themePresets = buildThemeMatchedGradientPresets(siteStyles.colors)

  const pickPreset = (preset: HeroVisualGradientPreset) => {
    onColorStartChange(preset.start)
    onColorEndChange(preset.end)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <PropertyFieldLabel>Theme colors</PropertyFieldLabel>
        <PresetSwatchGrid
          presets={themePresets}
          presetStart={presetStart || colorStart}
          presetEnd={presetEnd || colorEnd}
          onPick={pickPreset}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <PropertyFieldLabel>Vibrant presets</PropertyFieldLabel>
        <PresetSwatchGrid
          presets={HERO_VISUAL_GRADIENT_PRESETS}
          presetStart={presetStart || colorStart}
          presetEnd={presetEnd || colorEnd}
          onPick={pickPreset}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5
        }}
      >
        <ColorField label='Color start' value={colorStart} onChange={onColorStartChange} />
        <ColorField label='Color end' value={colorEnd} onChange={onColorEndChange} />
      </Box>
    </Box>
  )
}
