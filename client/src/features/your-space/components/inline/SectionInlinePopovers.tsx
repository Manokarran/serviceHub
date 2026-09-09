'use client'

import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block, SectionBlockProps } from '../../types'
import { isTwoColumnFamily, isMultiColumnLayout } from '../../constants/sectionLayout'
import { SECTION_BORDER_OPTIONS } from '../../utils/sectionStyleHelpers'
import { useSiteStyles } from '../SiteStylesScope'
import { BlockBackgroundModePanel } from '../BlockBackgroundModePanel'
import { PropertyFieldLabel } from '../property/PropertyPanelUi'
import { InlineToolbarButton } from './InlineToolbarUi'

type SectionUpdate = (changes: Partial<SectionBlockProps>) => void

export function SectionBackgroundPopover({
  block,
  onUpdate
}: {
  block: Block<'section'>
  onUpdate: SectionUpdate
}) {
  const props = block.props
  const siteStyles = useSiteStyles()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <BlockBackgroundModePanel
        props={props}
        accentColor={siteStyles.colors.accent}
        sectionType='section'
        fallbackColor='#ffffff'
        sectionLayout={props.layout}
        onUpdate={onUpdate}
      />
    </Box>
  )
}

const MAX_WIDTH_OPTIONS: { value: SectionBlockProps['maxWidth']; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'full', label: 'Full' }
]

export function SectionSpacingPopover({
  props,
  onUpdate
}: {
  props: SectionBlockProps
  onUpdate: SectionUpdate
}) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <PropertyFieldLabel>Vertical padding: {props.paddingY}px</PropertyFieldLabel>
        <Slider
          value={props.paddingY}
          min={16}
          max={128}
          step={8}
          onChange={(_, value) => onUpdate({ paddingY: value as number })}
        />
      </Box>
      <Box>
        <PropertyFieldLabel>Horizontal padding: {props.paddingX}px</PropertyFieldLabel>
        <Slider
          value={props.paddingX}
          min={0}
          max={64}
          step={4}
          onChange={(_, value) => onUpdate({ paddingX: value as number })}
        />
      </Box>
      <Box>
        <PropertyFieldLabel>Content width</PropertyFieldLabel>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          {MAX_WIDTH_OPTIONS.map(option => {
            const isActive = props.maxWidth === option.value

            return (
              <Box
                key={option.value}
                component='button'
                type='button'
                onClick={() => onUpdate({ maxWidth: option.value })}
                sx={{
                  flex: 1,
                  py: 0.625,
                  border: 'none',
                  borderRadius: 0.75,
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.text.primary, 0.04)
                }}
              >
                {option.label}
              </Box>
            )
          })}
        </Box>
      </Box>
      {isTwoColumnFamily(props.layout) && !isMultiColumnLayout(props.layout) ? (
        <Box>
          <PropertyFieldLabel>
            Column ratio: {props.splitRatio}% / {100 - props.splitRatio}%
          </PropertyFieldLabel>
          <Slider
            value={props.splitRatio ?? 50}
            min={30}
            max={70}
            step={5}
            onChange={(_, value) => onUpdate({ splitRatio: value as number })}
          />
        </Box>
      ) : null}
    </Box>
  )
}

export function SectionBorderPopover({
  props,
  onUpdate
}: {
  props: SectionBlockProps
  onUpdate: SectionUpdate
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant='caption' color='text.secondary'>Frame style</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {SECTION_BORDER_OPTIONS.map(option => (
          <InlineToolbarButton
            key={option.value}
            icon={option.icon}
            label={option.label}
            active={props.borderStyle === option.value}
            onClick={() => onUpdate({ borderStyle: option.value })}
          />
        ))}
      </Box>
    </Box>
  )
}
