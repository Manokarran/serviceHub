'use client'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { alpha, useTheme } from '@mui/material/styles'

import {
  HERO_CONTENT_MAX_WIDTH_OPTIONS,
  HERO_LAYOUT_OPTIONS,
  HERO_VERTICAL_ALIGN_OPTIONS
} from '../constants/heroLayout'
import type { HeroBlockProps, HeroContentMaxWidth, TextAlign } from '../types'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'
import { PropertySliderField } from './property/PropertySliderField'

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

function MaxWidthSelect({
  value,
  onChange
}: {
  value: HeroContentMaxWidth
  onChange: (v: HeroContentMaxWidth) => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {HERO_CONTENT_MAX_WIDTH_OPTIONS.map(option => {
        const isActive = value === option.value

        return (
          <Box
            key={option.value}
            component='button'
            type='button'
            onClick={() => onChange(option.value)}
            sx={{
              flex: 1,
              py: 0.75,
              border: 'none',
              borderRadius: 0.875,
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: isActive ? 'primary.main' : 'text.secondary',
              backgroundColor: isActive
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.text.primary, 0.04),
              '&:hover': {
                color: isActive ? 'primary.main' : 'text.primary',
                backgroundColor: isActive
                  ? alpha(theme.palette.primary.main, 0.14)
                  : alpha(theme.palette.text.primary, 0.07)
              }
            }}
          >
            {option.label}
          </Box>
        )
      })}
    </Box>
  )
}

export function HeroLayoutControls({ props, onUpdate }: Props) {
  const isSplit = props.layout === 'split-left' || props.layout === 'split-right'
  const isCentered = props.layout === 'centered'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Structure' collapsible defaultOpen>
        <PropertyBodyText>Pick a hero layout — centered spotlight or split with a visual panel.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.layout ?? 'centered'}
          options={HERO_LAYOUT_OPTIONS}
          onChange={layout => onUpdate({ layout })}
        />
        {isCentered && <AlignSelect value={props.alignment} onChange={alignment => onUpdate({ alignment })} />}
      </PropertySection>

      <PropertySection title='Position' collapsible defaultOpen>
        <PropertyBodyText>Anchor content in the middle or toward the bottom — popular for cinematic heroes.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.verticalAlign ?? 'center'}
          options={HERO_VERTICAL_ALIGN_OPTIONS}
          onChange={verticalAlign => onUpdate({ verticalAlign })}
        />
      </PropertySection>

      {isSplit && (
        <PropertySection title='Split balance' collapsible defaultOpen>
          <PropertySliderField
            label='Split balance'
            value={props.splitRatio ?? 50}
            min={35}
            max={65}
            step={5}
            unit='%'
            onChange={splitRatio => onUpdate({ splitRatio })}
          />
        </PropertySection>
      )}

      <PropertySection title='Size' collapsible defaultOpen>
        <PropertySliderField
          label='Minimum height'
          value={props.minHeight}
          min={360}
          max={820}
          step={20}
          unit='px'
          onChange={minHeight => onUpdate({ minHeight })}
        />
      </PropertySection>

      <PropertySection title='Spacing' collapsible defaultOpen={false}>
        <PropertyBodyText>Control breathing room around the hero content.</PropertyBodyText>
        <Box>
          <PropertyFieldLabel>Content width</PropertyFieldLabel>
          <MaxWidthSelect
            value={props.contentMaxWidth ?? 'lg'}
            onChange={contentMaxWidth => onUpdate({ contentMaxWidth })}
          />
        </Box>
        <PropertySliderField
          label='Horizontal padding'
          value={props.contentPaddingX ?? 32}
          min={16}
          max={96}
          step={4}
          unit='px'
          onChange={contentPaddingX => onUpdate({ contentPaddingX })}
        />
        <PropertySliderField
          label='Vertical padding'
          value={props.contentPaddingY ?? 64}
          min={32}
          max={160}
          step={8}
          unit='px'
          onChange={contentPaddingY => onUpdate({ contentPaddingY })}
        />
      </PropertySection>
    </Box>
  )
}
