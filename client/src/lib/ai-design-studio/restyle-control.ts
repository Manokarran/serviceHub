import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import type { AiDesignBrief } from '@/lib/ai-site-wizard/design-brief'
import { CORNER_TOKENS, DENSITY_TOKENS } from '@/lib/ai-site-wizard/design-catalog'
import { pickFromPool } from '@/lib/ai-site-wizard/variety'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

/**
 * Pick a value that preferably differs from the current one so "Redesign this"
 * always produces a visible layout/style change when the pool has alternatives.
 */
function pickDifferent<T>(pool: readonly T[], current: T | undefined, seed: string, salt: string): T {
  const alternatives = pool.filter(value => value !== current)
  const choices = alternatives.length > 0 ? alternatives : pool

  return pickFromPool(choices, seed, salt)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function applyThemeColors(
  props: Record<string, unknown>,
  siteStyles: SiteStyles,
  brief: AiDesignBrief
): Record<string, unknown> {
  const next = { ...props }
  const accent = siteStyles.colors.accent
  const text = siteStyles.colors.text
  const surface = siteStyles.colors.swatch1 || siteStyles.colors.background

  if ('textColor' in next) next.textColor = text
  if ('accentColor' in next) next.accentColor = accent
  if ('color' in next && typeof next.color === 'string') next.color = text
  if ('cardBackground' in next) next.cardBackground = surface
  if ('cardBorderColor' in next) next.cardBorderColor = accent
  if ('iconColor' in next) next.iconColor = accent
  if ('iconBackgroundColor' in next) next.iconBackgroundColor = accent
  if ('fillColor' in next) next.fillColor = accent

  next.splitVisualColorStart = brief.gradientStart
  next.splitVisualColorEnd = brief.gradientEnd

  return next
}

/**
 * Force a visible structural restyle of one control while staying inside the live
 * page theme (palette / gradients). Layout, card treatment, motion, and rhythm
 * rotate with the request nonce so repeat clicks explore new directions.
 */
export function restyleControlProps(
  block: Block,
  siteStyles: SiteStyles,
  brief: AiDesignBrief,
  profile: AiSiteWizardProfile,
  seed: string
): Record<string, unknown> {
  const corners = CORNER_TOKENS[brief.corners]
  const density = DENSITY_TOKENS[brief.density]
  const motionOn = profile.animationLevel !== 'none'
  const energetic = profile.animationLevel === 'energetic'
  let next = applyThemeColors({ ...(block.props as unknown as Record<string, unknown>) }, siteStyles, brief)
  const salt = `${block.type}:${block.id}`

  switch (block.type) {
    case 'hero': {
      next.layout = pickDifferent(
        ['centered', 'split-left', 'split-right'] as const,
        next.layout as string | undefined,
        seed,
        `${salt}:layout`
      )
      next.titleStyle = pickDifferent(['gradient', 'solid'] as const, next.titleStyle as string | undefined, seed, `${salt}:title`)
      next.contentSurface = pickDifferent(['glass', 'none'] as const, next.contentSurface as string | undefined, seed, `${salt}:surface`)
      next.mediaOverlay = pickDifferent(
        ['gradient', 'subtle', 'strong', 'none'] as const,
        next.mediaOverlay as string | undefined,
        seed,
        `${salt}:overlay`
      )
      next.minHeight = clamp(density.heroMinHeight, 360, 820)
      next.contentPaddingY = clamp(Math.round(density.sectionPaddingY * 1.15), 40, 160)
      next.alignment = next.layout === 'centered' ? 'center' : pickDifferent(['left', 'center'] as const, next.alignment as string | undefined, seed, `${salt}:align`)

      if (motionOn) {
        next.splitVisualAnimation = brief.motion
        next.backgroundType = next.backgroundType === 'photo' ? 'photo' : 'color'
        next.backgroundOpacity = next.backgroundType === 'photo' ? (next.backgroundOpacity ?? 100) : 100
      }

      break
    }

    case 'pricing': {
      next.layout = pickDifferent(['cards', 'comparison', 'stack'] as const, next.layout as string | undefined, seed, `${salt}:layout`)
      next.cardStyle = pickDifferent(
        ['glass', 'outlined', 'elevated', 'filled', 'tinted'] as const,
        next.cardStyle as string | undefined,
        seed,
        `${salt}:card`
      )
      next.columns = next.layout === 'stack' ? 2 : pickDifferent([2, 3, 4] as const, Number(next.columns) as 2 | 3 | 4, seed, `${salt}:cols`)
      next.titleStyle = 'gradient'
      next.paddingY = clamp(density.sectionPaddingY, 48, 128)
      next.gap = clamp(density.gap, 12, 48)
      next.cardRadius = clamp(corners.cardRadius, 8, 36)
      next.hoverEffect = motionOn ? pickDifferent(['lift', 'glow', 'none'] as const, next.hoverEffect as string | undefined, seed, `${salt}:hover`) : 'none'
      next.entranceAnimation = motionOn ? 'slide-up' : 'none'
      next.recommendedGlow = energetic
      next.cardShadow = pickDifferent(['soft', 'medium', 'strong', 'none'] as const, next.cardShadow as string | undefined, seed, `${salt}:shadow`)
      break
    }

    case 'faq': {
      next.layout = pickDifferent(['stack', 'split-header'] as const, next.layout as string | undefined, seed, `${salt}:layout`)
      next.cardStyle = pickDifferent(['glass', 'outlined', 'elevated', 'filled'] as const, next.cardStyle as string | undefined, seed, `${salt}:card`)
      next.expandMode = pickDifferent(['single', 'multiple'] as const, next.expandMode as string | undefined, seed, `${salt}:expand`)
      next.iconStyle = pickDifferent(['chevron', 'plus', 'caret'] as const, next.iconStyle as string | undefined, seed, `${salt}:icon`)
      next.titleStyle = 'gradient'
      next.paddingY = clamp(density.sectionPaddingY, 48, 128)
      next.gap = clamp(Math.min(density.gap, 16), 8, 20)
      next.cardRadius = clamp(corners.cardRadius, 8, 28)
      next.entranceAnimation = motionOn ? 'slide-up' : 'none'
      next.alignment = next.layout === 'split-header' ? 'left' : pickDifferent(['center', 'left'] as const, next.alignment as string | undefined, seed, `${salt}:align`)
      next.maxWidth = next.layout === 'split-header' ? 'lg' : pickDifferent(['sm', 'md', 'lg'] as const, next.maxWidth as string | undefined, seed, `${salt}:width`)
      break
    }

    case 'showcase': {
      next.layout = pickDifferent(['split', 'stack', 'cards'] as const, next.layout as string | undefined, seed, `${salt}:layout`)
      next.cardStyle = pickDifferent(['layered', 'stacked'] as const, next.cardStyle as string | undefined, seed, `${salt}:card`)
      next.columns = next.layout === 'cards' ? pickDifferent([2, 3] as const, Number(next.columns) as 2 | 3, seed, `${salt}:cols`) : 1
      next.mediaSide = pickDifferent(['start', 'end'] as const, next.mediaSide as string | undefined, seed, `${salt}:side`)
      next.titleStyle = 'gradient'
      next.paddingY = clamp(density.sectionPaddingY, 48, 128)
      next.gap = clamp(density.gap, 16, 48)
      next.mediaRadius = clamp(corners.imageRadius, 8, 40)
      next.mediaOverlay = pickDifferent(['gradient', 'subtle', 'strong', 'none'] as const, next.mediaOverlay as string | undefined, seed, `${salt}:overlay`)
      break
    }

    case 'section': {
      next.paddingY = clamp(density.sectionPaddingY, 32, 140)
      next.borderRadius = clamp(corners.cardRadius, 0, 40)
      next.splitGap = clamp(density.gap, 12, 48)
      next.borderStyle = pickDifferent(
        ['none', 'subtle', 'outline', 'elevated', 'inset'] as const,
        next.borderStyle as string | undefined,
        seed,
        `${salt}:border`
      )
      next.layout = pickDifferent(
        [
          'default',
          'split-horizontal',
          'split-vertical',
          'sidebar-left',
          'sidebar-right',
          'split-1-2',
          'split-2-1',
          'columns-3',
          'columns-4'
        ] as const,
        next.layout as string | undefined,
        seed,
        `${salt}:layout`
      )

      if (motionOn && energetic) {
        next.backgroundType = 'color'
        next.background = brief.background
        next.backgroundOpacity = 100
        next.splitVisualAnimation = brief.motion
      }

      break
    }

    case 'carousel': {
      next.stylePreset = pickDifferent(
        ['slide', 'fade', 'cards', 'coverflow'] as const,
        next.stylePreset as string | undefined,
        seed,
        `${salt}:style`
      )
      next.borderRadius = clamp(corners.cardRadius, 0, 40)
      next.slideGap = clamp(density.gap, 8, 40)
      next.paddingY = clamp(density.sectionPaddingY, 32, 120)
      break
    }

    case 'tabs': {
      next.variant = pickDifferent(
        ['underline', 'pills', 'segmented', 'bordered', 'elevated'] as const,
        next.variant as string | undefined,
        seed,
        `${salt}:variant`
      )
      next.orientation = pickDifferent(['horizontal', 'vertical'] as const, next.orientation as string | undefined, seed, `${salt}:orient`)
      next.tabBorderRadius = clamp(corners.cardRadius, 0, 28)
      next.paddingY = clamp(density.sectionPaddingY, 32, 120)
      break
    }

    case 'header':
    case 'footer': {
      next.layout = pickDifferent(['horizontal', 'vertical'] as const, next.layout as string | undefined, seed, `${salt}:layout`)
      next.borderRadius = clamp(corners.cardRadius, 0, 24)
      next.logoPosition = pickDifferent(['left', 'center', 'right'] as const, next.logoPosition as string | undefined, seed, `${salt}:logo`)

      if (motionOn && energetic) {
        next.backgroundType = 'color'
        next.background = brief.background
        next.backgroundOpacity = 92
        next.splitVisualAnimation = brief.motion
      }

      break
    }

    case 'contactForm': {
      next.paddingY = clamp(density.sectionPaddingY, 32, 120)
      next.fieldStyle = pickDifferent(['theme', 'rounded', 'pill', 'square'] as const, next.fieldStyle as string | undefined, seed, `${salt}:field`)
      next.alignment = pickDifferent(['left', 'center'] as const, next.alignment as string | undefined, seed, `${salt}:align`)
      break
    }

    case 'button': {
      next.variant = pickDifferent(['contained', 'outlined', 'text'] as const, next.variant as string | undefined, seed, `${salt}:variant`)
      next.borderRadius = corners.buttonShape === 'pill' ? 999 : corners.cardRadius
      next.color = accentFrom(siteStyles)
      break
    }

    case 'heading': {
      next.variant = pickDifferent(['default', 'display', 'script'] as const, next.variant as string | undefined, seed, `${salt}:variant`)
      next.alignment = pickDifferent(['left', 'center', 'right'] as const, next.alignment as string | undefined, seed, `${salt}:align`)
      next.color = siteStyles.colors.text
      break
    }

    case 'text': {
      next.variant = pickDifferent(['paragraph', 'lead', 'caption', 'callout'] as const, next.variant as string | undefined, seed, `${salt}:variant`)
      next.alignment = pickDifferent(['left', 'center', 'right'] as const, next.alignment as string | undefined, seed, `${salt}:align`)
      next.color = siteStyles.colors.text
      break
    }

    case 'image': {
      next.borderRadius = clamp(corners.imageRadius, 0, 48)
      next.alignment = pickDifferent(['left', 'center', 'right'] as const, next.alignment as string | undefined, seed, `${salt}:align`)
      break
    }

    case 'icon': {
      next.iconBorderRadius = clamp(corners.cardRadius, 0, 999)
      next.iconColor = siteStyles.colors.accent
      next.iconBackgroundColor = siteStyles.colors.accent
      next.alignment = pickDifferent(['left', 'center', 'right'] as const, next.alignment as string | undefined, seed, `${salt}:align`)
      break
    }

    case 'serviceDirectory': {
      next.paddingY = clamp(density.sectionPaddingY, 32, 120)
      next.layout = pickDifferent(['cards', 'list', 'featured'] as const, next.layout as string | undefined, seed, `${salt}:layout`)
      next.alignment = pickDifferent(['left', 'center'] as const, next.alignment as string | undefined, seed, `${salt}:align`)

      if (motionOn && energetic) {
        next.backgroundType = 'color'
        next.background = brief.background
        next.backgroundOpacity = 100
        next.splitVisualAnimation = brief.motion
      }

      break
    }

    case 'serviceBooking': {
      next.paddingY = clamp(density.sectionPaddingY, 32, 120)
      next.layout = pickDifferent(['inline', 'compact'] as const, next.layout as string | undefined, seed, `${salt}:layout`)
      next.alignment = pickDifferent(['left', 'center'] as const, next.alignment as string | undefined, seed, `${salt}:align`)

      if (motionOn && energetic) {
        next.backgroundType = 'color'
        next.background = brief.background
        next.backgroundOpacity = 100
        next.splitVisualAnimation = brief.motion
      }

      break
    }

    case 'customerBookings':
    case 'location': {
      next.paddingY = clamp(density.sectionPaddingY, 32, 120)
      next.alignment = pickDifferent(['left', 'center'] as const, next.alignment as string | undefined, seed, `${salt}:align`)

      if (motionOn && energetic) {
        next.backgroundType = 'color'
        next.background = brief.background
        next.backgroundOpacity = 100
        next.splitVisualAnimation = brief.motion
      }

      break
    }

    default:
      break
  }

  return next
}

function accentFrom(siteStyles: SiteStyles): string {
  return siteStyles.colors.accent
}

/** Restyle every block in a control-scope proposal (usually a single block). */
export function restyleControlBlocks(
  blocks: Block[],
  siteStyles: SiteStyles,
  brief: AiDesignBrief,
  profile: AiSiteWizardProfile,
  seed: string
): Block[] {
  return blocks.map(block => ({
    ...block,
    props: restyleControlProps(block, siteStyles, brief, profile, seed) as unknown as Block['props']
  }))
}
