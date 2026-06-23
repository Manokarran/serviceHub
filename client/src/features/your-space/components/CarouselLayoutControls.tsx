'use client'

import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Slider from '@mui/material/Slider'

import type { CarouselBlockProps } from '../types'
import {
  CAROUSEL_ARROW_STYLE_OPTIONS,
  CAROUSEL_DOT_STYLE_OPTIONS,
  CAROUSEL_TRANSITION_OPTIONS
} from '../utils/carouselStyleHelpers'
import {
  CornerRadiusField,
  LayoutOptionGroup,
  PropertyFieldLabel,
  PropertySection
} from './property/PropertyPanelUi'

type Props = {
  props: CarouselBlockProps
  accentColor: string
  onUpdate: (changes: Partial<CarouselBlockProps>) => void
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
          p: 0
        }}
      />
      <Box sx={{ flex: 1 }}>
        <PropertyFieldLabel>{label}</PropertyFieldLabel>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{value}</Box>
      </Box>
    </Box>
  )
}

export function CarouselLayoutControls({ props, accentColor, onUpdate }: Props) {
  return (
    <>
      <PropertySection title='Transition' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.transition}
          options={CAROUSEL_TRANSITION_OPTIONS}
          onChange={transition => onUpdate({ transition })}
        />
        <Box>
          <PropertyFieldLabel>Animation speed: {props.transitionDuration * 10}ms</PropertyFieldLabel>
          <Slider
            value={props.transitionDuration}
            min={15}
            max={60}
            step={5}
            onChange={(_, v) => onUpdate({ transitionDuration: v as number })}
          />
        </Box>
      </PropertySection>

      <PropertySection title='Playback' collapsible defaultOpen>
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={props.autoplay}
              onChange={e => onUpdate({ autoplay: e.target.checked })}
            />
          }
          label='Autoplay'
        />
        {props.autoplay && (
          <Box>
            <PropertyFieldLabel>Interval: {props.autoplayInterval / 1000}s</PropertyFieldLabel>
            <Slider
              value={props.autoplayInterval}
              min={2000}
              max={12000}
              step={500}
              onChange={(_, v) => onUpdate({ autoplayInterval: v as number })}
            />
          </Box>
        )}
        <FormControlLabel
          control={
            <Switch size='small' checked={props.loop} onChange={e => onUpdate({ loop: e.target.checked })} />
          }
          label='Loop'
        />
      </PropertySection>

      <PropertySection title='Layout' collapsible defaultOpen>
        <Box>
          <PropertyFieldLabel>Slides per view: {props.slidesPerView}</PropertyFieldLabel>
          <Slider
            value={props.slidesPerView}
            min={1}
            max={4}
            step={1}
            onChange={(_, v) => onUpdate({ slidesPerView: v as number })}
          />
        </Box>
        <Box>
          <PropertyFieldLabel>Gap: {props.slideGap}px</PropertyFieldLabel>
          <Slider
            value={props.slideGap}
            min={0}
            max={48}
            step={4}
            onChange={(_, v) => onUpdate({ slideGap: v as number })}
          />
        </Box>
        <Box>
          <PropertyFieldLabel>Peek: {props.slidePeek}%</PropertyFieldLabel>
          <Slider
            value={props.slidePeek}
            min={0}
            max={30}
            step={2}
            onChange={(_, v) => onUpdate({ slidePeek: v as number })}
          />
        </Box>
        <Box>
          <PropertyFieldLabel>Min slide height: {props.slideMinHeight}px</PropertyFieldLabel>
          <Slider
            value={props.slideMinHeight}
            min={160}
            max={560}
            step={20}
            onChange={(_, v) => onUpdate({ slideMinHeight: v as number })}
          />
        </Box>
      </PropertySection>

      <PropertySection title='Navigation' collapsible defaultOpen={false}>
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={props.showArrows}
              onChange={e => onUpdate({ showArrows: e.target.checked })}
            />
          }
          label='Arrows'
        />
        {props.showArrows && (
          <LayoutOptionGroup
            value={props.arrowStyle}
            options={CAROUSEL_ARROW_STYLE_OPTIONS}
            onChange={arrowStyle => onUpdate({ arrowStyle })}
          />
        )}
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={props.showDots}
              onChange={e => onUpdate({ showDots: e.target.checked })}
            />
          }
          label='Indicators'
        />
        {props.showDots && (
          <LayoutOptionGroup
            value={props.dotStyle}
            options={CAROUSEL_DOT_STYLE_OPTIONS}
            onChange={dotStyle => onUpdate({ dotStyle })}
          />
        )}
      </PropertySection>

      <PropertySection title='Colors' collapsible defaultOpen={false}>
        <ColorField label='Arrow color' value={props.arrowColor} onChange={v => onUpdate({ arrowColor: v })} />
        <ColorField
          label='Indicator color'
          value={props.dotColor}
          onChange={v => onUpdate({ dotColor: v || accentColor })}
        />
      </PropertySection>

      <PropertySection title='Spacing' collapsible defaultOpen={false}>
        <Box>
          <PropertyFieldLabel>Padding Y: {props.paddingY}px</PropertyFieldLabel>
          <Slider
            value={props.paddingY}
            min={0}
            max={120}
            step={8}
            onChange={(_, v) => onUpdate({ paddingY: v as number })}
          />
        </Box>
        <Box>
          <PropertyFieldLabel>Padding X: {props.paddingX}px</PropertyFieldLabel>
          <Slider
            value={props.paddingX}
            min={0}
            max={80}
            step={8}
            onChange={(_, v) => onUpdate({ paddingX: v as number })}
          />
        </Box>
        <CornerRadiusField
          value={props.borderRadius}
          onChange={borderRadius => onUpdate({ borderRadius: borderRadius ?? 0 })}
          max={48}
        />
      </PropertySection>
    </>
  )
}
