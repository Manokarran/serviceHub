'use client'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

import BackgroundPicker from '@/components/builder/BackgroundPicker'
import type { BackgroundType } from '@/components/builder/BackgroundPicker'

import { builderSegmentedControlSx } from '../constants/builderLayout'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import type { BlockBackgroundProps, HeroBlockProps, SectionBlockProps, SectionLayout, SplitVisualConfig } from '../types'
import {
  getAnimatedBackgroundModeUpdate,
  getBlockBackground,
  getBlockBackgroundMode,
  getBlockFillOpacity,
  getStaticBackgroundModeUpdate,
  normalizeStoredMediaUrl
} from '../utils/sectionStyleHelpers'
import { AnimatedBackgroundControls } from './AnimatedBackgroundControls'
import { BackgroundOpacityField } from './property/BackgroundOpacityField'
import { PropertyBodyText, PropertyFieldLabel } from './property/PropertyPanelUi'
import { useSiteStyles } from './SiteStylesScope'

const BACKGROUND_MODE_OPTIONS = [
  { value: 'static' as const, label: 'Static fill', icon: 'ri-palette-line' },
  { value: 'animated' as const, label: 'Animated', icon: 'ri-sparkling-line' }
]

type BackgroundUpdate = Partial<
  BlockBackgroundProps & SplitVisualConfig & { splitVisualPlacement?: SectionBlockProps['splitVisualPlacement'] }
>

type Props = {
  props: BlockBackgroundProps & SplitVisualConfig & { splitVisualPlacement?: SectionBlockProps['splitVisualPlacement'] }
  accentColor: string
  sectionType: string
  fallbackColor?: string
  onUpdate: (changes: BackgroundUpdate) => void
  /** Show column placement when layout has multiple columns */
  sectionLayout?: SectionLayout
  animatedHint?: string
}

export function BlockBackgroundModePanel({
  props,
  accentColor,
  sectionType,
  fallbackColor = '#ffffff',
  onUpdate,
  sectionLayout,
  animatedHint
}: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()
  const mode = getBlockBackgroundMode(props)
  const isSplit = Boolean(sectionLayout && sectionLayout !== 'default')
  const fillOpacity = getBlockFillOpacity(props)

  const handleModeChange = (nextMode: 'static' | 'animated') => {
    if (nextMode === 'static') {
      onUpdate(getStaticBackgroundModeUpdate())
    } else {
      onUpdate(getAnimatedBackgroundModeUpdate(props))
    }
  }

  const handleMediaSelect = (url: string, mediaType: 'photo' | 'video') => {
    onUpdate({
      backgroundType: mediaType,
      background: url,
      ...getStaticBackgroundModeUpdate(),
      ...((props.backgroundOpacity ?? 0) === 0 ? { backgroundOpacity: 100 } : {})
    })
  }

  const handleStyleChange = (key: string, nextValue: string) => {
    if (key === 'backgroundType') {
      const nextType = nextValue as BackgroundType
      onUpdate({
        backgroundType: nextType,
        ...getStaticBackgroundModeUpdate(),
        ...((nextType === 'photo' || nextType === 'video') && (props.backgroundOpacity ?? 0) === 0
          ? { backgroundOpacity: 100 }
          : {})
      })
    } else if (key === 'background') {
      const nextType = props.backgroundType ?? 'color'
      const normalized =
        nextType === 'photo' || nextType === 'video'
          ? normalizeStoredMediaUrl(nextValue, nextType)
          : nextValue

      onUpdate({
        background: normalized,
        ...getStaticBackgroundModeUpdate(),
        ...((props.backgroundOpacity ?? 0) === 0 ? { backgroundOpacity: 100 } : {})
      })
    } else if (key === 'backgroundOpacity') {
      onUpdate({ backgroundOpacity: Number(nextValue) })
    } else if (key === 'backgroundPhotoAnimation') {
      onUpdate({ backgroundPhotoAnimation: nextValue as HeroBlockProps['backgroundPhotoAnimation'] })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <PropertyFieldLabel>Background type</PropertyFieldLabel>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            mt: 0.75,
            ...builderSegmentedControlSx(theme)
          }}
        >
          {BACKGROUND_MODE_OPTIONS.map(option => (
            <Box
              key={option.value}
              component='button'
              type='button'
              onClick={() => handleModeChange(option.value)}
              sx={{
                flex: 1,
                border: 'none',
                cursor: 'pointer',
                py: 0.625,
                px: 0.5,
                borderRadius: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                ...BUILDER_TYPOGRAPHY.tab,
                color: mode === option.value ? 'text.primary' : 'text.secondary',
                backgroundColor: mode === option.value ? 'background.paper' : 'transparent',
                boxShadow: mode === option.value ? theme.shadows[1] : 'none',
                transition: 'background-color 0.12s, color 0.12s'
              }}
            >
              <i className={option.icon} style={{ fontSize: '0.85rem' }} />
              {option.label}
            </Box>
          ))}
        </Box>
      </Box>

      {mode === 'static' ? (
        <>
          <PropertyBodyText>Choose a color, pattern, gradient, or photo. One opacity control applies to all fill types.</PropertyBodyText>
          <BackgroundPicker
            value={getBlockBackground(props, fallbackColor)}
            backgroundType={props.backgroundType ?? 'color'}
            sectionType={sectionType}
            photoAnimation={props.backgroundPhotoAnimation}
            defaultPhotoAnimation={siteStyles.misc.imageHoverEffect}
            onStyleChange={handleStyleChange}
            onMediaSelect={handleMediaSelect}
          />
          <BackgroundOpacityField
            value={fillOpacity}
            label='Fill opacity'
            onChange={backgroundOpacity => onUpdate({ backgroundOpacity })}
          />
        </>
      ) : (
        <>
          <AnimatedBackgroundControls
            config={props}
            accentColor={accentColor}
            onUpdate={onUpdate}
            sectionLayout={isSplit ? sectionLayout : undefined}
            splitVisualPlacement={props.splitVisualPlacement ?? 'background'}
            hidePlacementControls={!isSplit}
            placementHint={
              animatedHint ??
              (isSplit
                ? 'Motion and gradient colors behind your columns. Static fill is disabled while animation is active.'
                : 'Motion and gradient colors behind your content. Static fill is disabled while animation is active.')
            }
          />
        </>
      )}
    </Box>
  )
}

