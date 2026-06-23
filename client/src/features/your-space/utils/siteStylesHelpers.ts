import type { SxProps, Theme } from '@mui/material/styles'

import type { BlockPropsMap, BlockType } from '../types'
import { DEFAULT_FORMS, DEFAULT_SITE_STYLES } from '../constants/siteStylePresets'
import type { ButtonShape, ButtonStyleConfig, SiteColors, SiteFonts, SiteForms, SiteMisc, SiteStyles } from '../types/siteStyles'

export function normalizeSiteFonts(fonts: Partial<SiteFonts>): SiteFonts {
  return { ...DEFAULT_SITE_STYLES.fonts, ...fonts }
}

export function normalizeSiteForms(forms: Partial<SiteForms>): SiteForms {
  return { ...DEFAULT_FORMS, ...forms }
}

export function getHeadingFontSize(level: 1 | 2 | 3, fonts: SiteFonts): number {
  const { headingSize, headingScale } = normalizeSiteFonts(fonts)
  const levelScale = level === 1 ? 1 : level === 2 ? 0.75 : 0.625

  return Math.round(headingSize * levelScale * headingScale)
}

export function getHeroTitleFontSize(fonts: SiteFonts, viewport: 'mobile' | 'desktop'): number {
  const { headingSize, headingScale } = normalizeSiteFonts(fonts)

  return Math.round(headingSize * (viewport === 'desktop' ? 1.5 : 1) * headingScale)
}

export function mergeSiteStyles(partial: Partial<SiteStyles>, base: SiteStyles): SiteStyles {
  return {
    themeId: partial.themeId ?? base.themeId,
    fonts: { ...DEFAULT_SITE_STYLES.fonts, ...base.fonts, ...partial.fonts },
    colors: { ...base.colors, ...partial.colors },
    buttons: {
      primary: { ...base.buttons.primary, ...partial.buttons?.primary },
      secondary: { ...base.buttons.secondary, ...partial.buttons?.secondary },
      tertiary: { ...base.buttons.tertiary, ...partial.buttons?.tertiary }
    },
    forms: { ...DEFAULT_FORMS, ...base.forms, ...partial.forms },
    misc: { ...DEFAULT_SITE_STYLES.misc, ...base.misc, ...partial.misc }
  }
}

export function getCanvasCornerRadius(misc: SiteMisc): number {
  return misc.canvasCornerRadius ?? 0
}

export function getButtonBorderRadius(shape: ButtonShape): number | string {
  if (shape === 'pill') return 999
  if (shape === 'rounded') return 8

  return 0
}

export function getFontFamily(source: 'heading' | 'body', fonts: SiteFonts): string {
  return source === 'heading' ? fonts.headingFamily : fonts.bodyFamily
}

export function getGoogleFontsUrl(fonts: SiteFonts): string | null {
  const families = new Set<string>()

  for (const option of [fonts.headingFamily, fonts.bodyFamily]) {
    const match = option.match(/"([^"]+)"/)

    if (match?.[1] && !match[1].includes('system')) {
      families.add(`${match[1].replace(/ /g, '+')}:wght@400;500;600;700;800`)
    }
  }

  if (families.size === 0) {
    return null
  }

  return `https://fonts.googleapis.com/css2?${Array.from(families)
    .map(f => `family=${f}`)
    .join('&')}&display=swap`
}

export function getSiteButtonSx(
  role: 'primary' | 'secondary' | 'tertiary',
  siteStyles: SiteStyles,
  overrideColor?: string,
  overrideBorderRadius?: number
): SxProps<Theme> {
  const config = siteStyles.buttons[role]
  const { colors, fonts } = siteStyles
  const normalizedFonts = normalizeSiteFonts(fonts)
  const accent = overrideColor ?? colors.accent
  const borderRadius =
    overrideBorderRadius !== undefined ? overrideBorderRadius : getButtonBorderRadius(config.shape)
  const fontFamily = getFontFamily(config.fontSource, normalizedFonts)

  const base: SxProps<Theme> = {
    fontFamily,
    fontSize: normalizedFonts.buttonSize,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius,
    px: `${config.paddingX}px`,
    py: `${config.paddingY}px`,
    boxShadow: 'none',
    textDecoration: 'none'
  }

  if (config.style === 'solid') {
    return {
      ...base,
      backgroundColor: accent,
      color: '#ffffff',
      border: `${config.borderWidth}px solid ${accent}`,
      '&:hover': { backgroundColor: accent, opacity: 0.9, boxShadow: 'none' }
    }
  }

  if (config.style === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: accent,
      border: `${Math.max(config.borderWidth, 1)}px solid ${accent}`,
      '&:hover': { backgroundColor: `${accent}14`, boxShadow: 'none' }
    }
  }

  return {
    ...base,
    backgroundColor: 'transparent',
    color: accent,
    border: 'none',
    '&:hover': { backgroundColor: `${accent}0f`, boxShadow: 'none' }
  }
}

export function getFormFieldSx(forms: SiteForms, fonts: SiteFonts): SxProps<Theme> {
  const normalizedForms = normalizeSiteForms(forms)

  return {
    fontFamily: getFontFamily(normalizedForms.labelFontSource, normalizeSiteFonts(fonts)),
    fontSize: normalizedForms.fieldFontSize,
    '& .MuiOutlinedInput-root': {
      borderRadius: getButtonBorderRadius(normalizedForms.fieldShape),
      backgroundColor: normalizedForms.fieldBackground,
      fontSize: normalizedForms.fieldFontSize,
      '& fieldset': {
        borderWidth: normalizedForms.fieldBorderWidth,
        borderColor: normalizedForms.fieldBorderColor
      },
      '& .MuiOutlinedInput-input': {
        fontSize: normalizedForms.fieldFontSize
      }
    }
  }
}

export function getSpacingMultiplier(misc: SiteMisc): number {
  if (misc.spacingScale === 'compact') return 0.75
  if (misc.spacingScale === 'spacious') return 1.35

  return 1
}

export function siteStylesToCssVars(colors: SiteColors, fonts: SiteFonts): Record<string, string> {
  const normalizedFonts = normalizeSiteFonts(fonts)

  return {
    '--site-accent': colors.accent,
    '--site-bg': colors.background,
    '--site-text': colors.text,
    '--site-heading-font': normalizedFonts.headingFamily,
    '--site-body-font': normalizedFonts.bodyFamily,
    '--site-heading-size': `${normalizedFonts.headingSize}px`,
    '--site-body-size': `${normalizedFonts.bodySize}px`,
    '--site-button-size': `${normalizedFonts.buttonSize}px`,
    '--site-nav-size': `${normalizedFonts.navSize}px`,
    '--site-label-size': `${normalizedFonts.labelSize}px`,
    '--site-logo-size': `${normalizedFonts.logoSize}px`,
    '--site-swatch-1': colors.swatch1,
    '--site-swatch-2': colors.swatch2,
    '--site-swatch-3': colors.swatch3,
    '--site-swatch-4': colors.swatch4,
    '--site-swatch-5': colors.swatch5
  }
}

export function mapBlockVariantToButtonRole(variant: 'contained' | 'outlined' | 'text'): 'primary' | 'secondary' | 'tertiary' {
  if (variant === 'outlined') return 'secondary'
  if (variant === 'text') return 'tertiary'

  return 'primary'
}

/** Apply the active site theme palette to freshly dropped block defaults */
export function applySiteThemeToBlockProps<T extends BlockType>(
  type: T,
  props: BlockPropsMap[T],
  siteStyles: SiteStyles
): BlockPropsMap[T] {
  const { colors } = siteStyles

  switch (type) {
    case 'header':
      return {
        ...props,
        backgroundColor: colors.swatch1,
        textColor: colors.text,
        backgroundOpacity: 0
      }
    case 'footer':
      return {
        ...props,
        backgroundColor: colors.text,
        textColor: '#ffffff'
      }
    case 'hero':
      return {
        ...props,
        background: colors.accent,
        backgroundType: 'color',
        textColor: '#ffffff',
        backgroundOpacity: 0
      }
    case 'section':
      return {
        ...props,
        background: 'transparent',
        backgroundType: 'color',
        backgroundOpacity: 0
      }
    case 'carousel':
      return {
        ...props,
        dotColor: colors.accent,
        arrowColor: colors.text
      }
    case 'tabs':
      return {
        ...props,
        indicatorColor: colors.accent,
        activeTabColor: colors.text,
        inactiveTabColor: colors.swatch4
      }
    case 'heading':
      return {
        ...props,
        color: colors.text
      }
    case 'text':
      return {
        ...props,
        color: colors.swatch4
      }
    case 'button':
      return {
        ...props,
        color: colors.accent
      }
    case 'shape':
      return {
        ...props,
        fillColor: colors.accent,
        gradientStart: colors.accent,
        gradientEnd: colors.swatch2
      }
    default:
      return props
  }
}
