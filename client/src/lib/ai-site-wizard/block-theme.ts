import type { Block, BlockBackgroundProps, PricingBlockProps, ShowcaseBlockProps, ShowcaseItem, TabsBlockProps } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { getBlockBackgroundType, isMediaBackground, isSimpleColor } from '@/features/your-space/utils/sectionStyleHelpers'

import { mapBlocks } from './block-media'
import {
  type ThemeHarmonyPalette,
  buildThemedGradient,
  contrastTextColor,
  isChromaticColor,
  isTransparentFill,
  mixHex,
  rewriteCssColors,
  shiftHexToward
} from './color-harmony'

function buildPalette(siteStyles: SiteStyles): ThemeHarmonyPalette {
  const start = siteStyles.misc.pageSplitVisualColorStart?.trim() || siteStyles.colors.accent
  const end = siteStyles.misc.pageSplitVisualColorEnd?.trim() || siteStyles.colors.swatch5

  return {
    start,
    end,
    accent: siteStyles.colors.accent,
    text: siteStyles.colors.text,
    muted: siteStyles.colors.swatch4,
    background: siteStyles.colors.background,
    surface: siteStyles.colors.swatch1,
    inverse: contrastTextColor(start, '#ffffff', siteStyles.colors.text)
  }
}

function asBackground(props: Record<string, unknown>): BlockBackgroundProps {
  return props as BlockBackgroundProps
}

function isMediaFill(props: Record<string, unknown>): boolean {
  const background = typeof props.background === 'string' ? props.background : ''

  return isMediaBackground(asBackground(props)) || /^https?:\/\//i.test(background)
}

function isTransparentChrome(props: Record<string, unknown>): boolean {
  const opacity = typeof props.backgroundOpacity === 'number' ? props.backgroundOpacity : 100

  return opacity <= 8 || isTransparentFill(props.background) || isTransparentFill(props.backgroundColor)
}

function harmonizePaint(value: unknown, palette: ThemeHarmonyPalette): unknown {
  if (typeof value !== 'string' || isTransparentFill(value) || /^https?:\/\//i.test(value)) {
    return value
  }

  if (isSimpleColor(value)) {
    return isChromaticColor(value) ? shiftHexToward(value, palette.accent) : value
  }

  if (value.includes('gradient') || value.includes('repeating') || value.includes('url("data:')) {
    return rewriteCssColors(value, hex => (isChromaticColor(hex) ? shiftHexToward(hex, palette.accent) : hex))
  }

  return value
}

function assignSplitVisual(props: Record<string, unknown>, palette: ThemeHarmonyPalette, force = false) {
  const animation = typeof props.splitVisualAnimation === 'string' ? props.splitVisualAnimation : ''
  const hasColors = Boolean(
    (typeof props.splitVisualColorStart === 'string' && props.splitVisualColorStart.trim()) ||
      (typeof props.splitVisualColorEnd === 'string' && props.splitVisualColorEnd.trim())
  )

  if (!force && animation === 'static' && !hasColors) {
    return
  }

  props.splitVisualColorStart = palette.start
  props.splitVisualColorEnd = palette.end
}

function rematchReadableText(props: Record<string, unknown>, fill: string, palette: ThemeHarmonyPalette) {
  const nextText = contrastTextColor(fill, '#ffffff', palette.text)

  if (typeof props.textColor === 'string' && props.textColor.trim()) {
    props.textColor = nextText
  }

  if (typeof props.color === 'string' && props.color.trim()) {
    props.color = nextText
  }
}

function rematchHero(props: Record<string, unknown>, palette: ThemeHarmonyPalette) {
  assignSplitVisual(props, palette, true)

  if (isMediaFill(props)) {
    if (typeof props.textColor === 'string') {
      props.textColor = '#ffffff'
    }

    return
  }

  const backgroundType = getBlockBackgroundType(asBackground(props))

  if (backgroundType === 'gradient' || (typeof props.background === 'string' && props.background.includes('gradient'))) {
    props.backgroundType = 'gradient'
    props.background = buildThemedGradient(palette.start, palette.end, String(props.background))
  } else if (backgroundType === 'pattern' && typeof props.background === 'string') {
    props.background = rewriteCssColors(props.background, hex => shiftHexToward(hex, palette.accent))
  } else {
    props.background = palette.start
  }

  if (typeof props.backgroundColor === 'string' && !isTransparentFill(props.backgroundColor)) {
    props.backgroundColor = palette.start
  }

  rematchReadableText(props, palette.start, palette)
}

function rematchChrome(props: Record<string, unknown>, palette: ThemeHarmonyPalette, role: 'header' | 'footer') {
  assignSplitVisual(props, palette, true)

  if (isMediaFill(props)) {
    return
  }

  if (isTransparentChrome(props)) {
    props.textColor = contrastTextColor(palette.start, '#ffffff', palette.text)

    if (typeof props.logoIconColor === 'string' && props.logoIconColor.trim()) {
      props.logoIconColor = props.textColor
    }

    return
  }

  const fillSource = String(props.background || props.backgroundColor || '')
  const nextFill =
    role === 'footer'
      ? mixHex(palette.end, '#0f172a', 0.35)
      : isSimpleColor(fillSource) && isChromaticColor(fillSource)
        ? shiftHexToward(fillSource, palette.accent)
        : String(harmonizePaint(fillSource, palette) || palette.surface)

  if (typeof props.background === 'string' && !isTransparentFill(props.background)) {
    props.background = nextFill
  }

  if (typeof props.backgroundColor === 'string' && !isTransparentFill(props.backgroundColor)) {
    props.backgroundColor = nextFill
  }

  rematchReadableText(props, nextFill, palette)

  if (typeof props.logoIconColor === 'string' && props.logoIconColor.trim()) {
    props.logoIconColor = typeof props.textColor === 'string' ? props.textColor : palette.accent
  }

  if (typeof props.logoIconBackgroundColor === 'string' && !isTransparentFill(props.logoIconBackgroundColor)) {
    props.logoIconBackgroundColor = palette.accent
  }
}

function rematchSection(props: Record<string, unknown>, palette: ThemeHarmonyPalette) {
  assignSplitVisual(props, palette)

  if (!isMediaFill(props) && !isTransparentChrome(props)) {
    if (typeof props.background === 'string') {
      props.background = harmonizePaint(props.background, palette)
    }

    if (typeof props.backgroundColor === 'string') {
      props.backgroundColor = harmonizePaint(props.backgroundColor, palette)
    }
  }

  if (props.primarySplitVisualColorStart || props.primarySplitVisualAnimation) {
    props.primarySplitVisualColorStart = palette.start
    props.primarySplitVisualColorEnd = palette.end
  }

  if (props.secondarySplitVisualColorStart || props.secondarySplitVisualAnimation) {
    props.secondarySplitVisualColorStart = palette.start
    props.secondarySplitVisualColorEnd = palette.end
  }

  if (typeof props.borderColor === 'string' && isChromaticColor(props.borderColor)) {
    props.borderColor = palette.accent
  }

  if (typeof props.splitDividerColor === 'string' && isChromaticColor(props.splitDividerColor)) {
    props.splitDividerColor = palette.accent
  }

  props.primaryColumnBackground = harmonizePaint(props.primaryColumnBackground, palette)
  props.secondaryColumnBackground = harmonizePaint(props.secondaryColumnBackground, palette)
}

function rematchShowcaseItems(items: ShowcaseItem[] | undefined, palette: ThemeHarmonyPalette): ShowcaseItem[] | undefined {
  return items?.map(item => ({
    ...item,
    splitVisualColorStart: palette.start,
    splitVisualColorEnd: palette.end
  }))
}

/** Restyle leftover template colors so blocks match the generated site palette. */
export function applyThemeHarmonyToBlocks(pageSlug: string, blocks: Block[], siteStyles: SiteStyles): Block[] {
  const palette = buildPalette(siteStyles)

  return mapBlocks(blocks, pageSlug, '/blocks', (block, _path, props) => {
    const next = { ...props }

    switch (block.type) {
      case 'hero':
        rematchHero(next, palette)
        break
      case 'header':
        rematchChrome(next, palette, 'header')
        break
      case 'footer':
        rematchChrome(next, palette, 'footer')
        break
      case 'section':
        rematchSection(next, palette)
        break
      case 'carousel':
        assignSplitVisual(next, palette)
        next.arrowColor = palette.text
        next.dotColor = palette.accent
        if (!isMediaFill(next)) {
          next.background = harmonizePaint(next.background, palette)
        }
        break
      case 'tabs': {
        const tabs = next as unknown as TabsBlockProps
        next.indicatorColor = palette.accent
        next.activeTabColor = palette.text
        next.inactiveTabColor = palette.muted
        next.tabBarBorderColor = harmonizePaint(tabs.tabBarBorderColor, palette)
        next.contentBorderColor = harmonizePaint(tabs.contentBorderColor, palette)
        next.tabs = (tabs.tabs ?? []).map(panel => ({
          ...panel,
          iconColor: panel.iconColor ? palette.accent : panel.iconColor
        }))
        break
      }
      case 'showcase': {
        const showcase = next as unknown as ShowcaseBlockProps
        assignSplitVisual(next, palette)
        if (!isMediaFill(next) && !isTransparentChrome(next)) {
          next.background = harmonizePaint(next.background, palette)
        }
        next.items = rematchShowcaseItems(showcase.items, palette)
        if (typeof next.textColor === 'string' && isChromaticColor(next.textColor)) {
          next.textColor = palette.text
        }
        break
      }
      case 'pricing': {
        const pricing = next as unknown as PricingBlockProps
        assignSplitVisual(next, palette)
        if (!isMediaFill(next) && !isTransparentChrome(next)) {
          next.background = harmonizePaint(next.background, palette)
        }
        if (typeof next.textColor === 'string' && isChromaticColor(next.textColor)) {
          next.textColor = palette.text
        }
        next.accentColor = palette.accent
        next.plans = (pricing.plans ?? []).map(plan => ({
          ...plan,
          accentColor: plan.recommended ? palette.accent : plan.accentColor
        }))
        break
      }
      case 'faq': {
        assignSplitVisual(next, palette)
        if (!isMediaFill(next) && !isTransparentChrome(next)) {
          next.background = harmonizePaint(next.background, palette)
        }
        if (typeof next.textColor === 'string' && isChromaticColor(next.textColor)) {
          next.textColor = palette.text
        }
        next.accentColor = palette.accent
        break
      }
      case 'heading':
        if (typeof next.color === 'string' && !isTransparentFill(next.color)) {
          next.color = isChromaticColor(next.color) ? palette.accent : palette.text
        }
        break
      case 'text':
        if (typeof next.color === 'string' && !isTransparentFill(next.color)) {
          next.color = isChromaticColor(next.color) ? palette.accent : palette.muted
        }
        if (typeof next.accentColor === 'string' && !isTransparentFill(next.accentColor)) {
          next.accentColor = palette.accent
        }
        break
      case 'button':
        next.color = palette.accent
        break
      case 'shape':
        next.fillColor = palette.accent
        next.gradientStart = palette.start
        next.gradientEnd = palette.end
        if (typeof next.strokeColor === 'string' && isChromaticColor(next.strokeColor)) {
          next.strokeColor = palette.end
        }
        break
      case 'icon':
        next.iconColor = palette.accent
        if (typeof next.iconBackgroundColor === 'string' && !isTransparentFill(next.iconBackgroundColor)) {
          next.iconBackgroundColor = mixHex(palette.accent, palette.surface, 0.82)
        }
        break
      case 'contactForm':
        if (typeof next.submitColor === 'string' && next.submitColor.trim()) {
          next.submitColor = palette.accent
        }
        if (typeof next.backgroundColor === 'string' && !isTransparentFill(next.backgroundColor)) {
          next.backgroundColor = palette.surface
        }
        break
      default:
        assignSplitVisual(next, palette)
        break
    }

    return next
  })
}

export function describeThemeHarmony(siteStyles: SiteStyles): string {
  const palette = buildPalette(siteStyles)

  return `Matched block colors and motion to ${palette.start} / ${palette.end}.`
}
