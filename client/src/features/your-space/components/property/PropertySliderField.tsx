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
  onChange: (value: number) => void
  siteDefault?: number
  onUseSiteDefault?: () => void
}

export function PropertySliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'px',
  onChange,
  siteDefault,
  onUseSiteDefault
}: Props) {
  const theme = useTheme()
  const isOverriding = siteDefault !== undefined && value !== siteDefault

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
        onChange={(_, v) => onChange(v as number)}
        sx={{
          mt: 0.25,
          color: 'primary.main',
          height: 4,
          py: 1.125,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 1)}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.5)}`,
            '&:hover, &.Mui-focusVisible': {
              boxShadow: `0 0 0 2px ${alpha(theme.palette.background.paper, 1)}, 0 0 0 4px ${alpha(theme.palette.primary.main, 0.35)}`
            }
          },
          '& .MuiSlider-rail': { opacity: 0.2 }
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
