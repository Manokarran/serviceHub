import type { Block, HeadingBlockVariant, TextBlockVariant } from '@/features/your-space/types'
import { mapBlocks } from '@/lib/ai-site-wizard/block-media'
import type { AiDesignBrief } from '@/lib/ai-site-wizard/design-brief'
import { CORNER_TOKENS } from '@/lib/ai-site-wizard/design-catalog'
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
  'serviceDirectory',
  'serviceBooking',
  'customerBookings',
  'location'
])

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

/**
 * Turn on the existing HeroVisualPanel engine for a selected background-capable control.
 * A visual animation replaces a static/photo fill deliberately, while its two colors come
 * from the same art-directed brief so it never becomes an unrelated neon effect.
 */
export function applyAnimatedBackgroundToBlocks(
  pageSlug: string,
  blocks: Block[],
  brief: AiDesignBrief
): Block[] {
  return mapBlocks(blocks, pageSlug, '/blocks', (block, _path, props) => {
    if (!ANIMATED_BACKGROUND_TYPES.has(block.type)) {
      return props
    }

    return {
      ...props,
      backgroundType: 'color',
      background: brief.background,
      backgroundOpacity: 100,
      splitVisualAnimation: brief.motion,
      splitVisualColorStart: brief.gradientStart,
      splitVisualColorEnd: brief.gradientEnd
    }
  })
}
