import type { Block } from '@/features/your-space/types'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

import { mapBlocks } from './block-media'
import type { AiDesignBrief } from './design-brief'
import { CORNER_TOKENS, DENSITY_TOKENS } from './design-catalog'
import { buildProfileVarietySeed, pickFromPool } from './variety'

const PRICING_CARD_STYLE: Record<AiDesignBrief['sectionBorder'], string> = {
  none: 'glass',
  subtle: 'glass',
  outline: 'outlined',
  elevated: 'glass'
}

const FAQ_CARD_STYLE: Record<AiDesignBrief['sectionBorder'], string> = {
  none: 'glass',
  subtle: 'glass',
  outline: 'outlined',
  elevated: 'glass'
}

const PRICING_LAYOUTS = ['cards', 'comparison', 'stack'] as const
const FAQ_LAYOUTS = ['stack', 'split-header'] as const
const SHOWCASE_LAYOUTS = ['split', 'stack', 'cards'] as const
const SHOWCASE_CARD_STYLES = ['layered', 'stacked'] as const
const TAB_VARIANTS = ['underline', 'pills', 'segmented', 'bordered', 'elevated'] as const
const CAROUSEL_STYLES = ['slide', 'fade', 'cards', 'coverflow'] as const

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Apply the art director's structural decisions — hero framing, rhythm, and corner
 * language — on top of the base template so each generated site is laid out differently,
 * not just recoloured.
 */
export function applyDesignBriefToBlocks(
  pageSlug: string,
  blocks: Block[],
  brief: AiDesignBrief,
  profile: AiSiteWizardProfile
): Block[] {
  const corners = CORNER_TOKENS[brief.corners]
  const density = DENSITY_TOKENS[brief.density]
  const motionOn = profile.animationLevel !== 'none'
  const seed = buildProfileVarietySeed(profile)

  return mapBlocks(blocks, pageSlug, '/blocks', (block, _path, props) => {
    const next = { ...props }
    const hasPhotoBackground = next.backgroundType === 'photo'
    const salt = `${block.type}:${block.id}`

    switch (block.type) {
      case 'hero': {
        next.layout = brief.heroLayout
        next.minHeight = clamp(density.heroMinHeight, 360, 820)
        next.contentPaddingY = clamp(Math.round(density.sectionPaddingY * 1.2), 32, 160)
        next.titleStyle = brief.heroTitleStyle
        next.contentSurface = brief.heroSurface

        if (hasPhotoBackground) {
          next.mediaOverlay = brief.heroOverlay === 'none' ? 'subtle' : brief.heroOverlay
        }

        if (brief.heroLayout === 'centered') {
          next.alignment = 'center'
          next.contentMaxWidth = brief.density === 'airy' ? 'lg' : 'md'
        } else {
          next.splitRatio = brief.density === 'compact' ? 45 : 50
        }

        if (motionOn) {
          next.splitVisualAnimation = brief.motion
          next.splitVisualColorStart = brief.gradientStart
          next.splitVisualColorEnd = brief.gradientEnd
        }

        break
      }

      case 'section': {
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)
        next.borderRadius = clamp(corners.cardRadius, 0, 48)
        next.splitGap = clamp(density.gap, 0, 64)

        if (brief.sectionBorder !== 'none') {
          next.borderStyle = brief.sectionBorder
        }

        break
      }

      case 'showcase': {
        next.layout = pickFromPool(SHOWCASE_LAYOUTS, seed, `${salt}:layout`)
        next.cardStyle = pickFromPool(SHOWCASE_CARD_STYLES, seed, `${salt}:card`)
        next.columns = next.layout === 'cards' ? pickFromPool([2, 3] as const, seed, `${salt}:cols`) : 1
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)
        next.gap = clamp(density.gap, 0, 64)
        next.mediaRadius = clamp(corners.imageRadius, 0, 48)
        next.mediaSide = brief.heroLayout === 'split-right' ? 'end' : 'start'
        next.titleStyle = brief.heroTitleStyle

        break
      }

      case 'pricing': {
        next.layout = pickFromPool(PRICING_LAYOUTS, seed, `${salt}:layout`)
        next.columns = next.layout === 'stack' ? 2 : pickFromPool([2, 3, 4] as const, seed, `${salt}:cols`)
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)
        next.gap = clamp(density.gap, 0, 64)
        next.cardRadius = clamp(corners.cardRadius, 0, 48)
        next.cardStyle = PRICING_CARD_STYLE[brief.sectionBorder]
        next.titleStyle = brief.heroTitleStyle
        next.hoverEffect = motionOn ? 'lift' : 'none'
        next.entranceAnimation = motionOn ? 'slide-up' : 'none'
        next.recommendedGlow = profile.animationLevel === 'energetic'

        break
      }

      case 'faq': {
        next.layout = pickFromPool(FAQ_LAYOUTS, seed, `${salt}:layout`)
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)
        next.gap = clamp(Math.min(density.gap, 16), 4, 24)
        next.cardRadius = clamp(corners.cardRadius, 0, 36)
        next.cardStyle = FAQ_CARD_STYLE[brief.sectionBorder]
        next.titleStyle = brief.heroTitleStyle
        next.entranceAnimation = motionOn ? 'slide-up' : 'none'
        next.alignment = next.layout === 'split-header' ? 'left' : 'center'
        next.maxWidth = next.layout === 'split-header' ? 'lg' : 'md'

        break
      }

      case 'carousel': {
        next.stylePreset = pickFromPool(CAROUSEL_STYLES, seed, `${salt}:style`)
        next.borderRadius = clamp(corners.cardRadius, 0, 48)
        next.slideGap = clamp(density.gap, 0, 64)
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)

        break
      }

      case 'tabs': {
        next.variant = pickFromPool(TAB_VARIANTS, seed, `${salt}:variant`)
        next.tabBorderRadius = clamp(corners.cardRadius, 0, 32)
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)

        break
      }

      case 'image': {
        next.borderRadius = clamp(corners.imageRadius, 0, 48)

        break
      }

      case 'contactForm': {
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)

        break
      }

      default:
        break
    }

    return next
  })
}
