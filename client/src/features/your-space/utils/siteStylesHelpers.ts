import type { SxProps, Theme } from '@mui/material/styles'

import type { BlockPropsMap, BlockType } from '../types'
import { DEFAULT_FORMS, DEFAULT_SITE_STYLES } from '../constants/siteStylePresets'
import type { ButtonShape, ButtonStyleConfig, SiteColors, SiteFonts, SiteForms, SiteMisc, SiteStyles } from '../types/siteStyles'
import { getSiteButtonInteractiveSx, SITE_BUTTON_ACTIVE_SX, SITE_BUTTON_HOVER_SX } from './siteInteractiveHelpers'

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

function resolveMultilineFieldRadius(shape: ButtonShape, singleLineRadius: number | string): number | string {
  if (shape === 'pill') return 8
  if (typeof singleLineRadius === 'number' && singleLineRadius > 10) return 8

  return singleLineRadius
}

export type FormFieldSxOptions = {
  fieldShape?: ButtonShape
  fieldBorderRadius?: number
  fieldBorderWidth?: number
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
  const radiusCss = typeof borderRadius === 'number' ? `${borderRadius}px` : String(borderRadius)
  const fontFamily = getFontFamily(config.fontSource, normalizedFonts)
  const interactive = getSiteButtonInteractiveSx()

  const base: SxProps<Theme> = {
    fontFamily,
    fontSize: normalizedFonts.buttonSize,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: radiusCss,
    '&.MuiButton-root, &.MuiButton-contained, &.MuiButton-outlined, &.MuiButton-text': {
      borderRadius: radiusCss
    },
    px: `${config.paddingX}px`,
    py: `${config.paddingY}px`,
    boxShadow: 'none',
    textDecoration: 'none',
    ...interactive
  }

  if (config.style === 'solid') {
    return {
      ...base,
      backgroundColor: accent,
      color: '#ffffff',
      border: `${config.borderWidth}px solid ${accent}`,
      '&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: accent,
        opacity: 0.92,
        boxShadow: `0 8px 24px ${accent}40`
      },
      '&:active': SITE_BUTTON_ACTIVE_SX
    }
  }

  if (config.style === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: accent,
      border: `${Math.max(config.borderWidth, 1)}px solid ${accent}`,
      '&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: `${accent}14`,
        boxShadow: `0 6px 18px ${accent}22`
      },
      '&:active': SITE_BUTTON_ACTIVE_SX
    }
  }

  return {
    ...base,
    backgroundColor: 'transparent',
    color: accent,
    border: 'none',
    '&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      backgroundColor: `${accent}0f`
    },
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}

export function getFormFieldSx(forms: SiteForms, fonts: SiteFonts, options?: FormFieldSxOptions): SxProps<Theme> {
  const normalizedForms = normalizeSiteForms(forms)
  const fieldShape = options?.fieldShape ?? normalizedForms.fieldShape
  const singleLineRadius = options?.fieldBorderRadius ?? getButtonBorderRadius(fieldShape)
  const multilineRadius =
    options?.fieldBorderRadius !== undefined
      ? singleLineRadius
      : resolveMultilineFieldRadius(fieldShape, singleLineRadius)
  const fieldBorderWidth = options?.fieldBorderWidth ?? normalizedForms.fieldBorderWidth

  return {
    fontFamily: getFontFamily(normalizedForms.labelFontSource, normalizeSiteFonts(fonts)),
    fontSize: normalizedForms.fieldFontSize,
    '& .MuiOutlinedInput-root': {
      borderRadius: singleLineRadius,
      backgroundColor: normalizedForms.fieldBackground,
      fontSize: normalizedForms.fieldFontSize,
      '& fieldset': {
        borderWidth: fieldBorderWidth,
        borderColor: normalizedForms.fieldBorderColor
      },
      '&:hover fieldset': {
        borderWidth: fieldBorderWidth
      },
      '&.Mui-focused fieldset': {
        borderWidth: fieldBorderWidth > 0 ? Math.max(fieldBorderWidth, 1) : fieldBorderWidth
      },
      '& .MuiOutlinedInput-input': {
        fontSize: normalizedForms.fieldFontSize
      },
      '&.MuiInputBase-multiline': {
        borderRadius: multilineRadius,
        '& fieldset': {
          borderRadius: multilineRadius
        }
      }
    }
  }
}

export function getContactFormFieldSx(
  siteStyles: SiteStyles,
  fieldStyle?: 'theme' | ButtonShape,
  fieldBorderRadius?: number,
  fieldBorderWidth?: number
): SxProps<Theme> {
  const fieldShape = fieldStyle && fieldStyle !== 'theme' ? fieldStyle : siteStyles.forms.fieldShape

  return getFormFieldSx(siteStyles.forms, siteStyles.fonts, {
    fieldShape,
    fieldBorderRadius,
    fieldBorderWidth
  })
}

export function getContactFormSubmitButtonConfig(
  siteStyles: SiteStyles,
  submitVariant?: 'theme' | 'contained' | 'outlined' | 'text',
  submitColor?: string,
  submitBorderRadius?: number
): { variant: 'contained' | 'outlined' | 'text'; sx: SxProps<Theme> } {
  const usesTheme = !submitVariant || submitVariant === 'theme'
  const variant = usesTheme ? mapButtonStyleToVariant(siteStyles.buttons.primary.style) : submitVariant
  const role = usesTheme ? 'primary' : mapBlockVariantToButtonRole(submitVariant)

  return {
    variant,
    sx: getSiteButtonSx(role, siteStyles, submitColor, submitBorderRadius)
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

export function mapButtonStyleToVariant(style: ButtonStyleConfig['style']): 'contained' | 'outlined' | 'text' {
  if (style === 'outline') return 'outlined'
  if (style === 'ghost') return 'text'

  return 'contained'
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
    case 'icon':
      return {
        ...props,
        iconColor: colors.accent,
        iconBackgroundColor: colors.accent
      }
    default:
      return props
  }
}
