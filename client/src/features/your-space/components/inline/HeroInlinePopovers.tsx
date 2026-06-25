'use client'

import Box from '@mui/material/Box'

import type { HeroBlockProps } from '../../types'
import { BlockBackgroundModePanel } from '../BlockBackgroundModePanel'
import { useSiteStyles } from '../SiteStylesScope'
import { HeroLayoutControls } from '../HeroLayoutControls'
import { PropertySliderField } from '../property/PropertySliderField'

type HeroUpdate = (changes: Partial<HeroBlockProps>) => void

export function HeroLayoutPopover({ props, onUpdate }: { props: HeroBlockProps; onUpdate: HeroUpdate }) {
  return <HeroLayoutControls props={props} onUpdate={onUpdate} />
}

export function HeroBackgroundPopover({ props, onUpdate }: { props: HeroBlockProps; onUpdate: HeroUpdate }) {
  const siteStyles = useSiteStyles()
  const isSplitLayout = props.layout === 'split-left' || props.layout === 'split-right'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <BlockBackgroundModePanel
        props={props}
        accentColor={siteStyles.colors.accent}
        sectionType='hero'
        fallbackColor='#6366f1'
        onUpdate={onUpdate}
        animatedHint={
          isSplitLayout
            ? 'Motion layer on the split visual panel. Static fill is disabled while animation is active.'
            : 'Full-bleed motion behind centered hero content. Static fill is disabled while animation is active.'
        }
      />
    </Box>
  )
}

export function HeroSpacingPopover({ props, onUpdate }: { props: HeroBlockProps; onUpdate: HeroUpdate }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySliderField
        label='Minimum height'
        value={props.minHeight}
        min={360}
        max={820}
        step={20}
        unit='px'
        onChange={minHeight => onUpdate({ minHeight })}
      />
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
      {(props.layout === 'split-left' || props.layout === 'split-right') && (
        <PropertySliderField
          label='Split balance'
          value={props.splitRatio ?? 50}
          min={35}
          max={65}
          step={5}
          unit='%'
          onChange={splitRatio => onUpdate({ splitRatio })}
        />
      )}
    </Box>
  )
}

/** @deprecated Hero background popover now includes animated mode — kept for toolbar compatibility */
export function HeroAnimationPopover({
  props,
  onUpdate,
  accentColor
}: {
  props: HeroBlockProps
  onUpdate: HeroUpdate
  accentColor: string
}) {
  const isSplitLayout = props.layout === 'split-left' || props.layout === 'split-right'

  return (
    <BlockBackgroundModePanel
      props={props}
      accentColor={accentColor}
      sectionType='hero'
      fallbackColor='#6366f1'
      onUpdate={onUpdate}
      animatedHint={
        isSplitLayout
          ? 'Motion layer on the split visual panel. Static fill is disabled while animation is active.'
          : 'Full-bleed motion behind centered hero content. Static fill is disabled while animation is active.'
      }
    />
  )
}
