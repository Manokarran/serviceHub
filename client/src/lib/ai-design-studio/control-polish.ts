import type { Block, HeadingBlockVariant, HeroSplitVisualAnimation, TextBlockVariant } from '@/features/your-space/types'
import {
  HERO_SPLIT_VISUAL_ANIMATION_OPTIONS,
  HERO_VISUAL_GRADIENT_PRESETS,
  type HeroVisualGradientPreset
} from '@/features/your-space/constants/heroVisual'
import { mapBlocks } from '@/lib/ai-site-wizard/block-media'
import type { AiDesignBrief } from '@/lib/ai-site-wizard/design-brief'
import { CORNER_TOKENS } from '@/lib/ai-site-wizard/design-catalog'
import { pickFromPool } from '@/lib/ai-site-wizard/variety'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

type Personality = AiSiteWizardProfile['stylePersonality']

const BUTTON_RADIUS: Record<AiDesignBrief['corners'], number> = { sharp: 0, soft: 10, round: 999 }

const LINE_HEIGHT: Record<AiDesignBrief['density'], number> = { compact: 1.5, balanced: 1.65, airy: 1.8 }

const HEADING_VARIANT: Partial<Record<Personality, HeadingBlockVariant>> = {
  bold: 'display',
  flashy: 'display',
  splashy: 'display',
  luxury: 'display',
  editorial: 'display',
  elegant: 'script',
  organic: 'script'
}

const TEXT_VARIANT: Partial<Record<Personality, TextBlockVariant>> = {
  editorial: 'lead',
  luxury: 'lead',
  minimal: 'paragraph',
  elegant: 'lead'
}

/** Tracking opens up as the layout gets airier, which is what makes airy read as airy. */
const HEADING_TRACKING: Record<AiDesignBrief['density'], number> = { compact: -0.6, balanced: 0, airy: 0.6 }

const ANIMATED_BACKGROUND_TYPES = new Set([
  'hero',
  'section',
  'header',
  'footer',
  'carousel',
  'pricing',
  'faq',
  'showcase',
  'serviceDirectory',
  'serviceBooking',
  'customerBookings',
  'location'
])

/** Every non-static option from the Animated background panel (classic + effects). */
const PANEL_MOTION_OPTIONS: HeroSplitVisualAnimation[] = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.filter(
  option => option.value !== 'static'
).map(option => option.value)

function pickDifferent<T>(pool: readonly T[], current: T | undefined, seed: string, salt: string): T {
  const alternatives = pool.filter(value => value !== current)
  const choices = alternatives.length > 0 ? alternatives : pool

  return pickFromPool(choices, seed, salt)
}

/**
 * The layout engine only reshapes container controls, so a leaf like a heading or a button
 * would come back from a redesign untouched. Give those the same art direction in the terms
 * they actually have: type treatment, tracking, and shape.
 */
export function polishLeafControls(
  pageSlug: string,
  blocks: Block[],
  brief: AiDesignBrief,
  profile: AiSiteWizardProfile
): Block[] {
  const corners = CORNER_TOKENS[brief.corners]

  return mapBlocks(blocks, pageSlug, '/blocks', (block, _path, props) => {
    const next = { ...props }
    const typography = { ...((next.typography as Record<string, unknown>) ?? {}) }

    switch (block.type) {
      case 'heading': {
        const variant = HEADING_VARIANT[profile.stylePersonality]

        if (variant) {
          next.variant = variant
        }

        typography.letterSpacing = HEADING_TRACKING[brief.density]

        if (brief.corners === 'sharp' && profile.stylePersonality === 'editorial') {
          typography.textTransform = 'uppercase'
        }

        next.typography = typography
        break
      }

      case 'text': {
        const variant = TEXT_VARIANT[profile.stylePersonality]

        if (variant && !next.variant) {
          next.variant = variant
        }

        typography.lineHeight = LINE_HEIGHT[brief.density]
        next.typography = typography
        break
      }

      case 'button':
        next.borderRadius = BUTTON_RADIUS[brief.corners]
        break

      case 'icon':
        next.iconBorderRadius = corners.cardRadius
        break

      case 'shape':
        next.borderRadius = corners.cardRadius
        break

      default:
        break
    }

    return next
  })
}

export type AnimatedBackgroundChoice = {
  animation: HeroSplitVisualAnimation
  colorStart: string
  colorEnd: string
  presetLabel: string
}

/**
 * Pick a motion + gradient pair from the same options the Animated background panel offers.
 * Prefers a different animation and color preset than the control currently uses.
 */
export function pickAnimatedBackgroundChoice(
  seed: string,
  current?: { animation?: string; colorStart?: string; colorEnd?: string },
  extraPresets: HeroVisualGradientPreset[] = []
): AnimatedBackgroundChoice {
  const animation = pickDifferent(
    PANEL_MOTION_OPTIONS,
    current?.animation as HeroSplitVisualAnimation | undefined,
    seed,
    'motion'
  )
  const presetPool = [...extraPresets, ...HERO_VISUAL_GRADIENT_PRESETS]
  const currentPreset = presetPool.find(
    preset =>
      preset.start.toLowerCase() === (current?.colorStart ?? '').toLowerCase() &&
      preset.end.toLowerCase() === (current?.colorEnd ?? '').toLowerCase()
  )
  const preset = pickDifferent(presetPool, currentPreset, seed, 'gradient')

  return {
    animation,
    colorStart: preset.start,
    colorEnd: preset.end,
    presetLabel: preset.label
  }
}

/**
 * Apply an Animated-panel backdrop: clears photo fills, sets a motion style, and gradient
 * colors from the panel presets. Each call with a new seed tries a different combo.
 */
export function applyAnimatedBackgroundToBlocks(
  pageSlug: string,
  blocks: Block[],
  brief: AiDesignBrief,
  seed = `${brief.motion}:${brief.gradientStart}:${brief.gradientEnd}`
): Block[] {
  const themePresets: HeroVisualGradientPreset[] = [
    {
      id: 'brief-theme',
      label: 'Theme brief',
      start: brief.gradientStart,
      end: brief.gradientEnd,
      themeMatched: true
    },
    {
      id: 'brief-accent',
      label: 'Theme accent',
      start: brief.accent,
      end: brief.gradientEnd,
      themeMatched: true
    },
    {
      id: 'brief-surface',
      label: 'Theme surface',
      start: brief.accent,
      end: brief.gradientStart,
      themeMatched: true
    }
  ]

  return mapBlocks(blocks, pageSlug, '/blocks', (block, path, props) => {
    if (!ANIMATED_BACKGROUND_TYPES.has(block.type)) {
      return props
    }

    const choice = pickAnimatedBackgroundChoice(
      `${seed}:${path}:${block.id}`,
      {
        animation: typeof props.splitVisualAnimation === 'string' ? props.splitVisualAnimation : undefined,
        colorStart: typeof props.splitVisualColorStart === 'string' ? props.splitVisualColorStart : undefined,
        colorEnd: typeof props.splitVisualColorEnd === 'string' ? props.splitVisualColorEnd : undefined
      },
      themePresets
    )

    return {
      ...props,
      backgroundType: 'color',
      background: brief.background,
      backgroundOpacity: 100,
      backgroundPhotoOpacity: undefined,
      backgroundPhotoAnimation: undefined,
      splitVisualAnimation: choice.animation,
      splitVisualColorStart: choice.colorStart,
      splitVisualColorEnd: choice.colorEnd
    }
  })
}
