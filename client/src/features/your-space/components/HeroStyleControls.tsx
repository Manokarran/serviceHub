'use client'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'

import BackgroundPicker from '@/components/builder/BackgroundPicker'

import type { HeroBlockProps } from '../types'
import { getBlockBackground } from '../utils/sectionStyleHelpers'
import { useSiteStyles } from './SiteStylesScope'
import { AnimatedBackgroundControls } from './AnimatedBackgroundControls'
import { BackgroundOpacityField } from './property/BackgroundOpacityField'
import { PropertyBodyText, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: HeroBlockProps
  accentColor: string
  onUpdate: (changes: Partial<HeroBlockProps>) => void
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

export function HeroStyleControls({ props, accentColor, onUpdate }: Props) {
  const siteStyles = useSiteStyles()
  const isSplitLayout = props.layout === 'split-left' || props.layout === 'split-right'

  return (
    <>
      <PropertySection title='Hero fill' collapsible defaultOpen>
        <PropertyBodyText>Solid color, pattern, gradient, or photo behind hero content.</PropertyBodyText>
        <BackgroundPicker
          value={getBlockBackground(props, '#6366f1')}
          backgroundType={props.backgroundType ?? 'color'}
          sectionType='hero'
          photoOpacity={props.backgroundPhotoOpacity ?? 100}
          photoAnimation={props.backgroundPhotoAnimation}
          defaultPhotoAnimation={siteStyles.misc.imageHoverEffect}
          onStyleChange={(key, nextValue) => {
            if (key === 'backgroundType') {
              onUpdate({ backgroundType: nextValue as HeroBlockProps['backgroundType'] })
            } else if (key === 'background') {
              onUpdate({ background: nextValue })
            } else if (key === 'backgroundOpacity') {
              onUpdate({ backgroundOpacity: Number(nextValue) })
            } else if (key === 'backgroundPhotoOpacity') {
              onUpdate({ backgroundPhotoOpacity: Number(nextValue) })
            } else if (key === 'backgroundPhotoAnimation') {
              onUpdate({ backgroundPhotoAnimation: nextValue as HeroBlockProps['backgroundPhotoAnimation'] })
            }
          }}
        />
        <BackgroundOpacityField
          value={props.backgroundOpacity ?? 0}
          onChange={backgroundOpacity => onUpdate({ backgroundOpacity })}
        />
      </PropertySection>

      {isSplitLayout && (
        <PropertySection title='Animated panel' collapsible defaultOpen>
          <AnimatedBackgroundControls
            config={props}
            accentColor={accentColor}
            onUpdate={onUpdate}
            syncBlockBackgroundOpacity
          />
        </PropertySection>
      )}

      <PropertySection title='Text' collapsible defaultOpen>
        <ColorField label='Text color' value={props.textColor} onChange={textColor => onUpdate({ textColor })} />
      </PropertySection>
    </>
  )
}
