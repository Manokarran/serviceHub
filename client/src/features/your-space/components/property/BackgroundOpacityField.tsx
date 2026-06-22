'use client'

import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'

import { PropertyFieldLabel } from './PropertyPanelUi'

type Props = {
  value: number
  onChange: (value: number) => void
  label?: string
}

export function BackgroundOpacityField({ value, onChange, label = 'Background opacity' }: Props) {
  return (
    <Box>
      <PropertyFieldLabel>
        {label}: {value}%
      </PropertyFieldLabel>
      <Slider value={value} min={0} max={100} step={5} onChange={(_, nextValue) => onChange(nextValue as number)} />
    </Box>
  )
}
