'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import {
  DEFAULT_HERO_SPLIT_VISUAL_ANIMATION,
  HERO_SPLIT_VISUAL_ANIMATION_OPTIONS
} from '../constants/heroVisual'
import {
  getSectionVisualPlacementHint,
  getSectionVisualPlacementOptions
} from '../constants/sectionVisual'
import type { HeroSplitVisualAnimation, SectionLayout, SectionVisualPlacement, SplitVisualConfig } from '../types'
import { resolveHeroVisualColors } from '../utils/heroVisualHelpers'
import { builderSoftCardSx } from '../constants/builderChrome'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { AnimationGradientColorControls } from './AnimationGradientColorControls'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel } from './property/PropertyPanelUi'

type SplitVisualUpdate = Partial<
  SplitVisualConfig & { backgroundOpacity?: number; splitVisualPlacement?: SectionVisualPlacement }
>

type Props = {
  config: SplitVisualConfig
  accentColor: string
  onUpdate: (changes: SplitVisualUpdate) => void
  /** Ensures animated backgrounds render on section/hero blocks (opacity must be 100). */
  syncBlockBackgroundOpacity?: boolean
  sectionLayout?: SectionLayout
  splitVisualPlacement?: SectionVisualPlacement
  hideColorControls?: boolean
  hidePlacementControls?: boolean
  placementHint?: string
}

function AnimationOptionButton({
  option,
  active,
  onClick
}: {
  option: (typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS)[number]
  active: boolean
  onClick: () => void
}) {
  const theme = useTheme()

  return (
    <Tooltip title={option.label} placement='top'>
      <Box
        component='button'
        type='button'
        aria-label={option.label}
        aria-pressed={active}
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          py: 0.75,
          px: 0.25,
          border: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          minHeight: 52,
          ...builderSoftCardSx(theme, active),
          color: active ? 'primary.main' : 'text.secondary'
        }}
      >
        <i className={option.icon} style={{ fontSize: '0.95rem' }} />
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            fontSize: '0.625rem',
            lineHeight: 1.2,
            textAlign: 'center',
            color: 'inherit',
            px: 0.25
          }}
        >
          {option.label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export function AnimatedBackgroundControls({
  config,
  accentColor,
  onUpdate,
  syncBlockBackgroundOpacity = false,
  sectionLayout,
  splitVisualPlacement = 'primary',
  hideColorControls = false,
  hidePlacementControls = false,
  placementHint: placementHintOverride
}: Props) {
  const animation = config.splitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION
  const colors = resolveHeroVisualColors(config, accentColor)
  const classicOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'classic')
  const modernOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'modern')
  const placementOptions =
    !hidePlacementControls && sectionLayout ? getSectionVisualPlacementOptions(sectionLayout) : []
  const placementHint =
    placementHintOverride ??
    (sectionLayout && !hidePlacementControls
      ? getSectionVisualPlacementHint(sectionLayout, splitVisualPlacement)
      : 'Decorative motion layer. Separate from the section fill above.')

  const withBlockBackgroundSync = (changes: SplitVisualUpdate): SplitVisualUpdate => {
    if (!syncBlockBackgroundOpacity) {
      return changes
    }

    const isGradientSelection =
      changes.splitVisualColorStart !== undefined || changes.splitVisualColorEnd !== undefined
    const isAnimationSelection = changes.splitVisualAnimation !== undefined
    const nextAnimation =
      changes.splitVisualAnimation ??
      (isGradientSelection && animation === 'static' ? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION : animation)

    const enablesVisual =
      (isAnimationSelection && changes.splitVisualAnimation !== 'static') || isGradientSelection

    if (!enablesVisual || nextAnimation === 'static') {
      return changes
    }

    return {
      ...changes,
      backgroundOpacity: 100,
      ...(isGradientSelection && animation === 'static' && !changes.splitVisualAnimation
        ? { splitVisualAnimation: DEFAULT_HERO_SPLIT_VISUAL_ANIMATION }
        : {})
    }
  }

  const renderAnimationGroup = (title: string, options: typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
          gap: 0.75
        }}
      >
        {options.map(option => (
          <AnimationOptionButton
            key={option.value}
            option={option}
            active={animation === option.value}
            onClick={() =>
              onUpdate(
                withBlockBackgroundSync({
                  splitVisualAnimation: option.value as HeroSplitVisualAnimation
                })
              )
            }
          />
        ))}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertyBodyText>{placementHint}</PropertyBodyText>

      {placementOptions.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <PropertyFieldLabel>Placement</PropertyFieldLabel>
          <LayoutOptionGroup
            value={splitVisualPlacement}
            options={placementOptions}
            onChange={placement => onUpdate({ splitVisualPlacement: placement })}
          />
        </Box>
      )}

      {renderAnimationGroup('Animation', classicOptions)}
      {renderAnimationGroup('Effects', modernOptions)}

      {!hideColorControls && (
        <AnimationGradientColorControls
          colorStart={config.splitVisualColorStart || colors.start}
          colorEnd={config.splitVisualColorEnd || colors.end}
          presetStart={config.splitVisualColorStart ?? ''}
          presetEnd={config.splitVisualColorEnd ?? ''}
          onColorStartChange={splitVisualColorStart =>
            onUpdate(withBlockBackgroundSync({ splitVisualColorStart }))
          }
          onColorEndChange={splitVisualColorEnd => onUpdate(withBlockBackgroundSync({ splitVisualColorEnd }))}
        />
      )}
    </Box>
  )
}

/** @deprecated Use AnimatedBackgroundControls */
export const HeroSplitPanelControls = AnimatedBackgroundControls
