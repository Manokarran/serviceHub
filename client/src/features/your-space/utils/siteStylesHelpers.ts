import type { SxProps, Theme } from '@mui/material/styles'

import type { BlockPropsMap, BlockType } from '../types'
import { DEFAULT_FORMS, DEFAULT_SITE_STYLES } from '../constants/siteStylePresets'
import { isSplashyTheme } from '../constants/splashyTheme'
import { getSplashyOutlineButtonSx, getSplashyPrimaryButtonSx } from '../constants/splashyThemeStyles'
import type {
  ButtonShape,
  ButtonStyleConfig,
  SiteColors,
  SiteFonts,
  SiteForms,
  SiteMisc,
  SiteStyles
} from '../types/siteStyles'
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
  fieldBackground?: string
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
  const borderRadius = overrideBorderRadius !== undefined ? overrideBorderRadius : getButtonBorderRadius(config.shape)
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
    const border = `${config.borderWidth}px solid ${accent}`

    if (isSplashyTheme(siteStyles.themeId) && role === 'primary') {
      return getSplashyPrimaryButtonSx(base)
    }

    if (isSplashyTheme(siteStyles.themeId) && role === 'secondary') {
      return getSplashyOutlineButtonSx(base)
    }

    return {
      ...base,
      backgroundColor: accent,
      color: '#ffffff',
      border,
      '&&': {
        backgroundColor: accent,
        color: '#ffffff',
        border,
        boxShadow: 'none'
      },
      '&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: accent,
        opacity: 0.92,
        boxShadow: `0 8px 24px ${accent}40`
      },
      '&&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: accent,
        color: '#ffffff',
        border,
        opacity: 0.92,
        boxShadow: `0 8px 24px ${accent}40`
      },
      '&.Mui-disabled': {
        opacity: 0.45,
        color: '#ffffff',
        backgroundColor: accent,
        border
      },
      '&&.Mui-disabled': {
        opacity: 0.45,
        color: '#ffffff',
        backgroundColor: accent,
        border
      },
      '&:active': SITE_BUTTON_ACTIVE_SX
    }
  }

  if (config.style === 'outline') {
    const border = `${Math.max(config.borderWidth, 1)}px solid ${accent}`

    if (isSplashyTheme(siteStyles.themeId)) {
      return getSplashyOutlineButtonSx(base)
    }

    return {
      ...base,
      backgroundColor: 'transparent',
      color: accent,
      border,
      '&&': {
        backgroundColor: 'transparent',
        color: accent,
        border,
        boxShadow: 'none'
      },
      '&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: `${accent}14`,
        boxShadow: `0 6px 18px ${accent}22`
      },
      '&&:hover': {
        ...SITE_BUTTON_HOVER_SX,
        backgroundColor: `${accent}14`,
        color: accent,
        border,
        boxShadow: `0 6px 18px ${accent}22`
      },
      '&.Mui-disabled': {
        opacity: 0.45,
        color: accent,
        backgroundColor: 'transparent',
        border
      },
      '&&.Mui-disabled': {
        opacity: 0.45,
        color: accent,
        backgroundColor: 'transparent',
        border
      },
      '&:active': SITE_BUTTON_ACTIVE_SX
    }
  }

  const ghostBorder = 'none'

  return {
    ...base,
    backgroundColor: 'transparent',
    color: accent,
    border: ghostBorder,
    '&&': {
      backgroundColor: 'transparent',
      color: accent,
      border: ghostBorder,
      boxShadow: 'none'
    },
    '&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      backgroundColor: `${accent}0f`
    },
    '&&:hover': {
      ...SITE_BUTTON_HOVER_SX,
      backgroundColor: `${accent}0f`,
      color: accent,
      border: ghostBorder
    },
    '&.Mui-disabled': {
      opacity: 0.45,
      color: accent,
      backgroundColor: 'transparent',
      border: ghostBorder
    },
    '&&.Mui-disabled': {
      opacity: 0.45,
      color: accent,
      backgroundColor: 'transparent',
      border: ghostBorder
    },
    '&:active': SITE_BUTTON_ACTIVE_SX
  }
}

export function getFormFieldSx(
  forms: SiteForms,
  fonts: SiteFonts,
  options?: FormFieldSxOptions & { themeId?: string }
): SxProps<Theme> {
  const normalizedForms = normalizeSiteForms(forms)
  const fieldShape = options?.fieldShape ?? normalizedForms.fieldShape
  const singleLineRadius = options?.fieldBorderRadius ?? getButtonBorderRadius(fieldShape)

  const multilineRadius =
    options?.fieldBorderRadius !== undefined
      ? singleLineRadius
      : resolveMultilineFieldRadius(fieldShape, singleLineRadius)

  const fieldBorderWidth = options?.fieldBorderWidth ?? normalizedForms.fieldBorderWidth
  const fieldBackground = options?.fieldBackground ?? normalizedForms.fieldBackground
  const isTransparentField = fieldBackground === 'transparent'
  const splashy = isSplashyTheme(options?.themeId)

  return {
    fontFamily: getFontFamily(normalizedForms.labelFontSource, normalizeSiteFonts(fonts)),
    fontSize: normalizedForms.fieldFontSize,
    '& .MuiOutlinedInput-root': {
      borderRadius: singleLineRadius,
      backgroundColor: fieldBackground,
      fontSize: normalizedForms.fieldFontSize,
      ...(splashy
        ? {
            transition: 'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
          }
        : {}),
      ...(isTransparentField
        ? {
            '&:hover': { backgroundColor: 'transparent' },
            '&.Mui-focused': { backgroundColor: 'transparent' },
            '&.Mui-disabled': { backgroundColor: 'transparent' },
            '& .MuiOutlinedInput-input:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 100px transparent inset',
              WebkitTextFillColor: 'inherit',
              caretColor: 'inherit',
              transition: 'background-color 9999s ease-out 0s'
            }
          }
        : {}),
      '& fieldset': {
        borderWidth: fieldBorderWidth,
        borderColor: normalizedForms.fieldBorderColor,
        borderRadius: singleLineRadius,
        ...(splashy ? { transition: 'border-color 0.25s ease' } : {})
      },
      '&:hover fieldset': {
        borderWidth: fieldBorderWidth,
        ...(splashy ? { borderColor: 'rgba(196, 181, 253, 0.55)' } : {})
      },
      '&.Mui-focused': {
        ...(splashy
          ? {
              transform: 'translateY(-1px)',
              boxShadow: '0 16px 40px rgba(139, 92, 246, 0.28), 0 0 0 4px rgba(139, 92, 246, 0.1)',
              ...(isTransparentField ? { backgroundColor: 'transparent' } : {})
            }
          : {}),
        '& fieldset': {
          borderWidth: fieldBorderWidth > 0 ? Math.max(fieldBorderWidth, splashy ? 1.5 : 1) : fieldBorderWidth,
          ...(splashy ? { borderColor: '#22D3EE' } : {})
        }
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
  fieldBorderWidth?: number,
  transparentFieldBackground?: boolean
): SxProps<Theme> {
  const fieldShape = fieldStyle && fieldStyle !== 'theme' ? fieldStyle : siteStyles.forms.fieldShape
  const useTransparentFields = transparentFieldBackground !== false

  return getFormFieldSx(siteStyles.forms, siteStyles.fonts, {
    fieldShape,
    fieldBorderRadius,
    fieldBorderWidth,
    themeId: siteStyles.themeId,
    ...(useTransparentFields ? { fieldBackground: 'transparent' } : {})
  })
}

export function getContactFormSubmitButtonConfig(
  siteStyles: SiteStyles,
  submitVariant?: 'theme' | 'contained' | 'outlined' | 'text',
  submitColor?: string,
  submitBorderRadius?: number
): { variant: 'contained' | 'outlined' | 'text'; sx: SxProps<Theme> } {
  const usesSiteStyles = !submitVariant || submitVariant === 'theme'
  const variant = usesSiteStyles ? mapButtonStyleToVariant(siteStyles.buttons.primary.style) : submitVariant
  const role = usesSiteStyles ? 'primary' : mapBlockVariantToButtonRole(submitVariant)

  return {
    variant,
    sx: getSiteButtonSx(
      role,
      siteStyles,
      usesSiteStyles ? undefined : submitColor,
      usesSiteStyles ? undefined : submitBorderRadius
    )
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

export function mapBlockVariantToButtonRole(
  variant: 'contained' | 'outlined' | 'text'
): 'primary' | 'secondary' | 'tertiary' {
  if (variant === 'outlined') return 'secondary'
  if (variant === 'text') return 'tertiary'

  return 'primary'
}

export function mapButtonStyleToVariant(style: ButtonStyleConfig['style']): 'contained' | 'outlined' | 'text' {
  if (style === 'outline') return 'outlined'
  if (style === 'ghost') return 'text'

  return 'contained'
}

/** Parse the first opaque color out of a solid value or gradient, as `[r, g, b]`. */
function parseColorChannels(value: string): [number, number, number] | null {
  const hex = value.match(/#([0-9a-f]{3,8})\b/i)?.[1]

  if (hex) {
    const normalized =
      hex.length === 3 || hex.length === 4
        ? hex
            .slice(0, 3)
            .split('')
            .map(char => char + char)
            .join('')
        : hex.slice(0, 6)

    const parsed = Number.parseInt(normalized, 16)

    return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255]
  }

  const channels = value.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)

  if (channels) {
    return [Number(channels[1]), Number(channels[2]), Number(channels[3])]
  }

  return null
}

/** Perceived luminance test used to keep inserted text readable on its surface. */
export function isDarkSurface(value: string | undefined): boolean | null {
  if (!value || value === 'transparent') {
    return null
  }

  const channels = parseColorChannels(value)

  if (!channels) {
    return null
  }

  const [r, g, b] = channels

  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.55
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
    case 'showcase':
      return {
        ...props,
        textColor: (props as BlockPropsMap['showcase']).cardStyle === 'layered' ? '#ffffff' : colors.text,
        background: 'transparent',
        backgroundType: 'color',
        backgroundOpacity: 0
      }
    case 'pricing':
      return {
        ...props,
        textColor: colors.text,
        accentColor: colors.accent,
        background: 'transparent',
        backgroundType: 'color',
        backgroundOpacity: 0
      }
    case 'faq':
      return {
        ...props,
        textColor: colors.text,
        accentColor: colors.accent,
        background: 'transparent',
        backgroundType: 'color',
        backgroundOpacity: 0
      }
    default:
      return props
  }
}
