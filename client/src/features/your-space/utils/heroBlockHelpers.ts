import type { SxProps, Theme } from '@mui/material/styles'

import type {
  HeroBlockProps,
  HeroButtonStyle,
  HeroContentMaxWidth,
  HeroContentSurface,
  HeroMediaOverlay,
  HeroTitleStyle
} from '../types'
import type { SiteStyles } from '../types/siteStyles'
import {
  isEffectiveAnimatedBackgroundMode,
  isPhotoBackground,
  isVideoBackground
} from './sectionStyleHelpers'
import { getSiteButtonSx, mapButtonStyleToVariant } from './siteStylesHelpers'
import {
  SITE_BUTTON_ACTIVE_SX,
  SITE_BUTTON_HOVER_SX,
  SITE_INTERACTIVE_TRANSITION
} from './siteInteractiveHelpers'

export const HERO_MAX_WIDTH_MAP: Record<HeroContentMaxWidth, number | string> = {
  sm: 560,
  md: 720,
  lg: 900,
  full: '100%'
}

export function shouldRenderHeroBackgroundVisual(props: HeroBlockProps): boolean {
  if (props.layout !== 'centered') {
    return false
  }

  return isEffectiveAnimatedBackgroundMode(props)
}

export function shouldShowHeroSplitVisualPanel(props: HeroBlockProps): boolean {
  if (props.layout !== 'split-left' && props.layout !== 'split-right') {
    return false
  }

  return isEffectiveAnimatedBackgroundMode(props)
}

export function heroHasMediaBackground(props: HeroBlockProps): boolean {
  return isPhotoBackground(props) || isVideoBackground(props)
}

export function getHeroMediaOverlaySx(
  overlay: HeroMediaOverlay | undefined,
  hasMedia: boolean
): SxProps<Theme> | null {
  if (!hasMedia) {
    return null
  }

  const mode = overlay ?? 'gradient'

  if (mode === 'none') {
    return null
  }

  const base: SxProps<Theme> = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none'
  }

  switch (mode) {
    case 'subtle':
      return { ...base, backgroundColor: 'rgba(0,0,0,0.28)' }
    case 'strong':
      return { ...base, backgroundColor: 'rgba(0,0,0,0.58)' }
    case 'gradient':
    default:
      return {
        ...base,
        background:
          'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.62) 100%)'
      }
  }
}

export function getHeroContentSurfaceSx(surface: HeroContentSurface | undefined): SxProps<Theme> {
  if (surface !== 'glass') {
    return {}
  }

  return {
    backdropFilter: 'blur(18px) saturate(1.25)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 3,
    boxShadow: '0 12px 40px rgba(0,0,0,0.14)'
  }
}

export function getHeroTitleGradientSx(
  titleStyle: HeroTitleStyle | undefined,
  textColor: string,
  accentColor: string
): SxProps<Theme> {
  if (titleStyle !== 'gradient') {
    return {}
  }

  return {
    background: `linear-gradient(135deg, ${textColor} 0%, ${accentColor} 72%)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent'
  }
}

function parseColorToRgb(color: string): [number, number, number] | null {
  const trimmed = color.trim()
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

  if (hexMatch) {
    let hex = hexMatch[1]

    if (hex.length === 3) {
      hex = hex
        .split('')
        .map(char => char + char)
        .join('')
    }

    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16)
    ]
  }

  const rgbMatch = trimmed.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)

  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])]
  }

  return null
}

export function isLightColor(color: string): boolean {
  const rgb = parseColorToRgb(color)

  if (!rgb) {
    return false
  }

  const [r, g, b] = rgb.map(channel => {
    const normalized = channel / 255

    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  return luminance > 0.55
}

export function getHeroPrimaryButtonVariant(
  buttonStyle: HeroButtonStyle | undefined,
  siteStyles: SiteStyles
): 'contained' | 'outlined' | 'text' {
  if ((buttonStyle ?? 'theme') === 'theme') {
    return mapButtonStyleToVariant(siteStyles.buttons.primary.style)
  }

  return 'contained'
}

export function getHeroSecondaryButtonVariant(
  buttonStyle: HeroButtonStyle | undefined,
  siteStyles: SiteStyles
): 'contained' | 'outlined' | 'text' {
  if ((buttonStyle ?? 'theme') === 'theme') {
    return mapButtonStyleToVariant(siteStyles.buttons.secondary.style)
  }

  return 'outlined'
}

export function getHeroPrimaryButtonSx(
  buttonStyle: HeroButtonStyle | undefined,
  siteStyles: SiteStyles,
  buttonAccent: string,
  textColor: string
): SxProps<Theme> {
  const style = buttonStyle ?? 'theme'
  const interactive = { cursor: 'pointer', transition: SITE_INTERACTIVE_TRANSITION }

  if (style === 'theme') {
    return { ...getSiteButtonSx('primary', siteStyles), px: 3 }
  }

  const lightText = isLightColor(textColor)
  const shared = { ...interactive, px: 3 }

  if (lightText) {
    return {
      ...getSiteButtonSx('primary', siteStyles, '#ffffff'),
      ...shared,
      color: buttonAccent,
      boxShadow: '0 2px 14px rgba(0,0,0,0.16)',
      border: '1px solid rgba(255,255,255,0.9)',
      '&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: 'rgba(255,255,255,0.96)',
        boxShadow: '0 6px 22px rgba(0,0,0,0.24)',
        opacity: 1
      },
      '&:active': SITE_BUTTON_ACTIVE_SX
    }
  }

  return {
    ...getSiteButtonSx('primary', siteStyles, buttonAccent),
    ...shared,
    color: '#ffffff',
    boxShadow: '0 2px 14px rgba(0,0,0,0.14)',
    '&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      opacity: 0.92,
      boxShadow: '0 6px 22px rgba(0,0,0,0.2)'
    },
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}

export function getHeroSecondaryButtonSx(
  buttonStyle: HeroButtonStyle | undefined,
  siteStyles: SiteStyles,
  buttonAccent: string,
  textColor: string
): SxProps<Theme> {
  const style = buttonStyle ?? 'theme'
  const interactive = { cursor: 'pointer', transition: SITE_INTERACTIVE_TRANSITION }

  if (style === 'theme') {
    return { ...getSiteButtonSx('secondary', siteStyles), px: 3 }
  }

  const lightText = isLightColor(textColor)
  const shared = { ...interactive, px: 3 }

  if (lightText) {
    return {
      ...getSiteButtonSx('secondary', siteStyles, 'transparent'),
      ...shared,
      color: 'inherit',
      borderColor: 'rgba(255,255,255,0.58)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      '&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        borderColor: 'rgba(255,255,255,0.82)',
        backgroundColor: 'rgba(255,255,255,0.12)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.16)'
      },
      '&:active': SITE_BUTTON_ACTIVE_SX
    }
  }

  return {
    ...getSiteButtonSx('secondary', siteStyles, 'transparent'),
    ...shared,
    color: buttonAccent,
    borderColor: `${buttonAccent}66`,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    '&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      borderColor: buttonAccent,
      backgroundColor: `${buttonAccent}12`,
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
    },
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}
