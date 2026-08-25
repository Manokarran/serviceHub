import type { Block } from '@/features/your-space/types'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

import { mapBlocks } from './block-media'
import type { AiDesignBrief } from './design-brief'
import { CORNER_TOKENS, DENSITY_TOKENS } from './design-catalog'

const PRICING_CARD_STYLE: Record<AiDesignBrief['sectionBorder'], string> = {
  none: 'elevated',
  subtle: 'tinted',
  outline: 'outlined',
  elevated: 'elevated'
}

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

  return mapBlocks(blocks, pageSlug, '/blocks', (block, _path, props) => {
    const next = { ...props }
    const hasPhotoBackground = next.backgroundType === 'photo'

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
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)
        next.gap = clamp(density.gap, 0, 64)
        next.mediaRadius = clamp(corners.imageRadius, 0, 48)
        next.mediaSide = brief.heroLayout === 'split-right' ? 'end' : 'start'
        next.titleStyle = brief.heroTitleStyle

        break
      }

      case 'pricing': {
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)
        next.gap = clamp(density.gap, 0, 64)
        next.cardRadius = clamp(corners.cardRadius, 0, 48)
        next.cardStyle = PRICING_CARD_STYLE[brief.sectionBorder]
        next.hoverEffect = motionOn ? 'lift' : 'none'
        next.entranceAnimation = motionOn ? 'slide-up' : 'none'
        next.recommendedGlow = profile.animationLevel === 'energetic'

        break
      }

      case 'carousel': {
        next.borderRadius = clamp(corners.cardRadius, 0, 48)
        next.slideGap = clamp(density.gap, 0, 64)
        next.paddingY = clamp(density.sectionPaddingY, 16, 128)

        break
      }

      case 'tabs': {
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
