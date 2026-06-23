'use client'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'

import { HERO_LAYOUT_OPTIONS } from '../constants/heroLayout'
import type { HeroBlockProps, TextAlign } from '../types'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: HeroBlockProps
  onUpdate: (changes: Partial<HeroBlockProps>) => void
}

function AlignSelect({ value, onChange }: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  return (
    <FormControl size='small' fullWidth>
      <InputLabel>Text alignment</InputLabel>
      <Select label='Text alignment' value={value} onChange={e => onChange(e.target.value as TextAlign)}>
        <MenuItem value='left'>Left</MenuItem>
        <MenuItem value='center'>Center</MenuItem>
        <MenuItem value='right'>Right</MenuItem>
      </Select>
    </FormControl>
  )
}

export function HeroLayoutControls({ props, onUpdate }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Structure' collapsible defaultOpen>
        <PropertyBodyText>Choose how headline, text, and button are arranged.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.layout ?? 'centered'}
          options={HERO_LAYOUT_OPTIONS}
          onChange={layout => onUpdate({ layout })}
        />
        {props.layout === 'centered' && <AlignSelect value={props.alignment} onChange={alignment => onUpdate({ alignment })} />}
      </PropertySection>

      <PropertySection title='Size' collapsible defaultOpen>
        <PropertyFieldLabel>Minimum height: {props.minHeight}px</PropertyFieldLabel>
        <Slider value={props.minHeight} min={300} max={700} step={20} onChange={(_, value) => onUpdate({ minHeight: value as number })} />
      </PropertySection>
    </Box>
  )
}
