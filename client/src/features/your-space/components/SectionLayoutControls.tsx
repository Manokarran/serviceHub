'use client'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'

import { applySectionLayoutChange, isMultiColumnLayout, isSplitSectionLayout, isTwoColumnFamily, SECTION_LAYOUT_OPTIONS } from '../constants/sectionLayout'
import { SECTION_SPLIT_STYLE_OPTIONS } from '../utils/sectionStyleHelpers'
import type { SectionBlockProps } from '../types'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: SectionBlockProps
  onUpdate: (changes: Partial<SectionBlockProps>) => void
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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

export function SectionLayoutControls({ props, onUpdate }: Props) {
  const isSplit = isSplitSectionLayout(props.layout)
  const showRatio = isTwoColumnFamily(props.layout) && !isMultiColumnLayout(props.layout)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Structure' collapsible defaultOpen>
        <PropertyBodyText>Choose how content is arranged inside this section.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.layout ?? 'default'}
          options={SECTION_LAYOUT_OPTIONS}
          onChange={layout => onUpdate(applySectionLayoutChange(props, layout))}
        />
      </PropertySection>

      {isSplit && (
        <PropertySection title='Columns' collapsible defaultOpen>
          <PropertyBodyText>
            {isMultiColumnLayout(props.layout)
              ? 'Control spacing and dividers between columns. Multi-column layouts use equal widths.'
              : 'Control spacing, dividers, and balance between the columns.'}
          </PropertyBodyText>
          <LayoutOptionGroup
            value={props.splitStyle ?? 'gap'}
            options={SECTION_SPLIT_STYLE_OPTIONS}
            onChange={splitStyle => onUpdate({ splitStyle })}
          />
          {props.splitStyle === 'gap' && (
            <Box>
              <PropertyFieldLabel>Column gap: {props.splitGap ?? 24}px</PropertyFieldLabel>
              <Slider value={props.splitGap ?? 24} min={0} max={64} step={4} onChange={(_, value) => onUpdate({ splitGap: value as number })} />
            </Box>
          )}
          {props.splitStyle === 'divider' && (
            <ColorField label='Divider color' value={props.splitDividerColor ?? '#e2e8f0'} onChange={splitDividerColor => onUpdate({ splitDividerColor })} />
          )}
          {props.splitStyle === 'contrast' && (
            <>
              <ColorField
                label='Primary column tint'
                value={props.primaryColumnBackground || '#f1f5f9'}
                onChange={primaryColumnBackground => onUpdate({ primaryColumnBackground })}
              />
              <ColorField
                label='Secondary column tint'
                value={props.secondaryColumnBackground || '#e2e8f0'}
                onChange={secondaryColumnBackground => onUpdate({ secondaryColumnBackground })}
              />
            </>
          )}
          {showRatio && (
            <Box>
              <PropertyFieldLabel>
                Column ratio: {props.splitRatio}% / {100 - props.splitRatio}%
              </PropertyFieldLabel>
              <Slider value={props.splitRatio ?? 50} min={30} max={70} step={5} onChange={(_, value) => onUpdate({ splitRatio: value as number })} />
            </Box>
          )}
        </PropertySection>
      )}

      <PropertySection title='Spacing' collapsible defaultOpen>
        <FormControl size='small' fullWidth>
          <InputLabel>Content width</InputLabel>
          <Select label='Content width' value={props.maxWidth} onChange={e => onUpdate({ maxWidth: e.target.value as SectionBlockProps['maxWidth'] })}>
            <MenuItem value='sm'>Small (640px)</MenuItem>
            <MenuItem value='md'>Medium (768px)</MenuItem>
            <MenuItem value='lg'>Large (1024px)</MenuItem>
            <MenuItem value='full'>Full width</MenuItem>
          </Select>
        </FormControl>
        <Box>
          <PropertyFieldLabel>Vertical padding: {props.paddingY}px</PropertyFieldLabel>
          <Slider value={props.paddingY} min={16} max={128} step={8} onChange={(_, value) => onUpdate({ paddingY: value as number })} />
        </Box>
        <Box>
          <PropertyFieldLabel>Horizontal padding: {props.paddingX}px</PropertyFieldLabel>
          <Slider value={props.paddingX} min={0} max={64} step={4} onChange={(_, value) => onUpdate({ paddingX: value as number })} />
        </Box>
      </PropertySection>
    </Box>
  )
}
