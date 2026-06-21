'use client'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'

import { HERO_LAYOUT_OPTIONS } from '../constants/heroLayout'
import type { HeroBlockProps, TextAlign } from '../types'
import { HeroSplitPanelControls } from './HeroSplitPanelControls'
import { LayoutOptionGroup, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: HeroBlockProps
  accentColor: string
  onUpdate: (changes: Partial<HeroBlockProps>) => void
}

function AlignSelect({ value, onChange }: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  return (
    <FormControl size='small' fullWidth>
      <InputLabel>Alignment</InputLabel>
      <Select label='Alignment' value={value} onChange={e => onChange(e.target.value as TextAlign)}>
        <MenuItem value='left'>Left</MenuItem>
        <MenuItem value='center'>Center</MenuItem>
        <MenuItem value='right'>Right</MenuItem>
      </Select>
    </FormControl>
  )
}

export function HeroLayoutControls({ props, accentColor, onUpdate }: Props) {
  const isSplitLayout = props.layout === 'split-left' || props.layout === 'split-right'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <LayoutOptionGroup
        value={props.layout ?? 'centered'}
        options={HERO_LAYOUT_OPTIONS}
        onChange={layout => onUpdate({ layout })}
      />
      {props.layout === 'centered' && <AlignSelect value={props.alignment} onChange={alignment => onUpdate({ alignment })} />}
      {isSplitLayout && (
        <PropertySection title='Split panel' collapsible defaultOpen>
          <HeroSplitPanelControls config={props} accentColor={accentColor} onUpdate={onUpdate} />
        </PropertySection>
      )}
      <Box>
        <PropertyFieldLabel>Min height: {props.minHeight}px</PropertyFieldLabel>
        <Slider value={props.minHeight} min={300} max={700} step={20} onChange={(_, value) => onUpdate({ minHeight: value as number })} />
      </Box>
    </Box>
  )
}
