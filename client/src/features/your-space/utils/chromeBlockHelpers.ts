import { alpha } from '@mui/material/styles'

import type { BlockBackgroundProps, SplitVisualConfig } from '../types'
import type { SiteColors } from '../types/siteStyles'
import {
  applyBackgroundAlpha,
  getBlockBackground,
  getBlockBackgroundOpacity,
  isEffectiveAnimatedBackgroundMode,
  isPhotoBackground,
  isSimpleColor,
  isVideoBackground
} from './sectionStyleHelpers'

export function chromeHasMediaBackground(props: BlockBackgroundProps): boolean {
  return isPhotoBackground(props) || isVideoBackground(props)
}

export function shouldRenderChromeBackgroundVisual(
  props: BlockBackgroundProps & SplitVisualConfig
): boolean {
  return isEffectiveAnimatedBackgroundMode(props)
}

function isNearWhiteColor(color?: string): boolean {
  if (!color?.trim()) {
    return true
  }

  const normalized = color.trim().toLowerCase().replace(/\s+/g, '')

  if (
    normalized === '#fff' ||
    normalized === '#ffffff' ||
    normalized === 'white' ||
    normalized === 'rgb(255,255,255)' ||
    normalized === 'rgba(255,255,255,1)'
  ) {
    return true
  }

  const hex = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/)

  if (!hex) {
    return false
  }

  let value = hex[1]

  if (value.length === 3) {
    value = value
      .split('')
      .map(char => `${char}${char}`)
      .join('')
  }

  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  // Perceived lightness — treat pale fills as "white" so we fall through to theme colors.
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  return luminance >= 0.92
}

/**
 * Submenu / dropdown surface for header chrome.
 * Transparent or white headers show the page theme through — match that, not the raw white fill.
 */
export function resolveChromeSubmenuSurface(
  props: BlockBackgroundProps &
    SplitVisualConfig & {
      backgroundColor?: string
      textColor?: string
    },
  siteColors: SiteColors
): { background: string; border: string; hover: string } {
  const textColor = props.textColor?.trim() || '#111827'
  const lightText = textColor.toLowerCase() === '#ffffff' || textColor.toLowerCase() === 'white'
  const headerFill = getBlockBackground(props, props.backgroundColor || '#ffffff')
  const opacity = getBlockBackgroundOpacity(props)
  const headerFillIsVisible =
    isSimpleColor(headerFill) && opacity >= 40 && !isNearWhiteColor(headerFill)

  let background: string

  if (headerFillIsVisible) {
    background = applyBackgroundAlpha(headerFill, Math.max(92, opacity))
  } else {
    const themeBg = siteColors.background
    const splitStart = props.splitVisualColorStart?.trim()
    const splitEnd = props.splitVisualColorEnd?.trim()
    const swatch = siteColors.swatch1 || siteColors.swatch2

    if (splitStart && isSimpleColor(splitStart) && !isNearWhiteColor(splitStart)) {
      // Brand colors on transparent chrome (common AI/header setup).
      background = applyBackgroundAlpha(splitStart, 94)
    } else if (isSimpleColor(themeBg) && !isNearWhiteColor(themeBg)) {
      background = applyBackgroundAlpha(themeBg, 96)
    } else if (swatch && isSimpleColor(swatch) && !isNearWhiteColor(swatch)) {
      background = applyBackgroundAlpha(swatch, 96)
    } else if (splitEnd && isSimpleColor(splitEnd) && !isNearWhiteColor(splitEnd)) {
      background = applyBackgroundAlpha(splitEnd, 92)
    } else if (siteColors.accent && isSimpleColor(siteColors.accent)) {
      background = alpha(siteColors.accent, lightText ? 0.28 : 0.12)
    } else if (lightText) {
      background = 'rgba(15, 23, 42, 0.92)'
    } else {
      background = applyBackgroundAlpha(themeBg || '#ffffff', 96)
    }
  }

  return {
    background,
    border: lightText ? alpha('#ffffff', 0.18) : alpha(textColor, 0.14),
    hover: lightText ? alpha('#ffffff', 0.12) : alpha(textColor, 0.08)
  }
}
