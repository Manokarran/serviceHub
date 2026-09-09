'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION, HERO_SPLIT_VISUAL_ANIMATION_OPTIONS } from '../constants/heroVisual'
import { getSectionVisualPlacementHint, getSectionVisualPlacementOptions } from '../constants/sectionVisual'
import type { HeroSplitVisualAnimation, SectionLayout, SectionVisualPlacement, SplitVisualConfig } from '../types'
import { resolveHeroVisualColors } from '../utils/heroVisualHelpers'
import { builderSoftCardSx } from '../constants/builderChrome'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { AnimationGradientColorControls } from './AnimationGradientColorControls'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel } from './property/PropertyPanelUi'

type SplitVisualUpdate = Partial<SplitVisualConfig & { splitVisualPlacement?: SectionVisualPlacement }>

type Props = {
  config: SplitVisualConfig
  accentColor: string
  onUpdate: (changes: SplitVisualUpdate) => void
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
          gap: 0.5,
          py: 1,
          px: 0.5,
          border: 'none',
          borderRadius: 1.25,
          cursor: 'pointer',
          minHeight: 64,
          width: '100%',
          ...builderSoftCardSx(theme, active),
          color: active ? 'primary.main' : 'text.secondary'
        }}
      >
        <i className={option.icon} style={{ fontSize: '1.05rem', lineHeight: 1 }} />
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            fontSize: '0.625rem',
            lineHeight: 1.25,
            textAlign: 'center',
            color: 'inherit',
            px: 0.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
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
  sectionLayout,
  splitVisualPlacement = 'background',
  hideColorControls = false,
  hidePlacementControls = false,
  placementHint: placementHintOverride
}: Props) {
  const animation = config.splitVisualAnimation ?? DEFAULT_HERO_SPLIT_VISUAL_ANIMATION
  const colors = resolveHeroVisualColors(config, accentColor)
  const classicOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'classic')
  const modernOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'modern')
  const signatureOptions = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(option => option.group === 'signature')
  const placementOptions =
    !hidePlacementControls && sectionLayout ? getSectionVisualPlacementOptions(sectionLayout) : []
  const placementHint =
    placementHintOverride ??
    (sectionLayout && !hidePlacementControls
      ? getSectionVisualPlacementHint(sectionLayout, splitVisualPlacement)
      : 'Pick an animation and gradient colors for the motion layer.')

  const renderAnimationGroup = (title: string, options: typeof HERO_SPLIT_VISUAL_ANIMATION_OPTIONS) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <PropertyFieldLabel>{title}</PropertyFieldLabel>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 1
        }}
      >
        {options.map(option => (
          <AnimationOptionButton
            key={option.value}
            option={option}
            active={animation === option.value}
            onClick={() =>
              onUpdate({
                splitVisualAnimation: option.value as HeroSplitVisualAnimation
              })
            }
          />
        ))}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PropertyBodyText>{placementHint}</PropertyBodyText>

      {placementOptions.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
      {renderAnimationGroup('Signature', signatureOptions)}

      {!hideColorControls && (
        <AnimationGradientColorControls
          colorStart={config.splitVisualColorStart || colors.start}
          colorEnd={config.splitVisualColorEnd || colors.end}
          presetStart={config.splitVisualColorStart ?? ''}
          presetEnd={config.splitVisualColorEnd ?? ''}
          onColorStartChange={splitVisualColorStart => onUpdate({ splitVisualColorStart })}
          onColorEndChange={splitVisualColorEnd => onUpdate({ splitVisualColorEnd })}
        />
      )}
    </Box>
  )
}

/** @deprecated Use AnimatedBackgroundControls */
export const HeroSplitPanelControls = AnimatedBackgroundControls
