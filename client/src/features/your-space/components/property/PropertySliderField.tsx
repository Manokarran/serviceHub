'use client'

import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'

type Props = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  marks?: boolean
  onChange: (value: number) => void
  siteDefault?: number
  onUseSiteDefault?: () => void
}

function buildStepMarks(min: number, max: number, step: number) {
  const marks: { value: number; label?: string }[] = []

  for (let value = min; value <= max; value += step) {
    marks.push({ value })
  }

  return marks
}

export function PropertySliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  marks = false,
  onChange,
  siteDefault,
  onUseSiteDefault
}: Props) {
  const theme = useTheme()
  const isOverriding = siteDefault !== undefined && value !== siteDefault
  const sliderMarks = marks ? buildStepMarks(min, max, step) : undefined

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* Label row with live value pill */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography
          component='p'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            px: 0.875,
            py: 0.125,
            borderRadius: 0.75,
            backgroundColor: alpha(theme.palette.primary.main, 0.07),
            minWidth: 36,
            justifyContent: 'center'
          }}
        >
          <Typography
            component='span'
            sx={{
              ...BUILDER_TYPOGRAPHY.label,
              color: 'primary.main',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: 0
            }}
          >
            {value}{unit}
          </Typography>
        </Box>
      </Box>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        marks={sliderMarks}
        valueLabelDisplay='auto'
        onChange={(_, v) => onChange(v as number)}
        sx={{
          mt: 0.25,
          color: 'primary.main',
          height: 4,
          py: 1.5,
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 1)}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 1)}, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.35)}`
            }
          },
          '& .MuiSlider-rail': { opacity: 0.2 },
          '& .MuiSlider-mark': {
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            opacity: 0.35
          },
          '& .MuiSlider-markActive': { opacity: 0.65 }
        }}
      />

      {onUseSiteDefault && isOverriding && (
        <Typography
          component='button'
          type='button'
          onClick={onUseSiteDefault}
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            color: 'primary.main',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            p: 0,
            m: 0,
            alignSelf: 'flex-start',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          Use site default ({siteDefault}{unit})
        </Typography>
      )}
    </Box>
  )
}
