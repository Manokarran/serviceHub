import type { SxProps, Theme } from '@mui/material/styles'

import type { TextTypographyOverrides } from '../types'
import type { SiteFonts, SiteForms } from '../types/siteStyles'
import { getFontFamily, getHeadingFontSize, normalizeSiteFonts } from './siteStylesHelpers'

export type TextTypographyRole =
  | 'heading'
  | 'body'
  | 'nav'
  | 'logo'
  | 'label'
  | 'tab'
  | 'control'
  | 'formTitle'
  | 'formBody'
  | 'formField'

export type TextTypographyOptions = {
  headingLevel?: 1 | 2 | 3
  forms?: SiteForms
}

export function hasTextTypographyOverrides(overrides?: TextTypographyOverrides): boolean {
  if (!overrides) {
    return false
  }

  return (
    overrides.fontSource !== undefined ||
    overrides.fontFamily !== undefined ||
    overrides.fontSize !== undefined ||
    overrides.fontWeight !== undefined ||
    overrides.fontStyle !== undefined ||
    overrides.lineHeight !== undefined ||
    overrides.letterSpacing !== undefined ||
    overrides.textTransform !== undefined ||
    overrides.textDecoration !== undefined
  )
}

export function omitTypographyOverride(
  overrides: TextTypographyOverrides | undefined,
  key: keyof TextTypographyOverrides
): TextTypographyOverrides | undefined {
  if (!overrides) {
    return undefined
  }

  const next = { ...overrides }
  delete next[key]

  if (key === 'fontSource' || key === 'fontFamily') {
    delete next.fontSource
    delete next.fontFamily
  }

  return hasTextTypographyOverrides(next) ? next : undefined
}

function getRoleDefaultFontFamily(role: TextTypographyRole, fonts: SiteFonts, forms?: SiteForms): string {
  const normalized = normalizeSiteFonts(fonts)

  if (role === 'formField' && forms) {
    return getFontFamily(forms.labelFontSource, normalized)
  }

  if (role === 'heading' || role === 'logo' || role === 'formTitle') {
    return normalized.headingFamily
  }

  return normalized.bodyFamily
}

export function getThemeTypographyDefaults(
  role: TextTypographyRole,
  fonts: SiteFonts,
  options?: TextTypographyOptions
) {
  const normalized = normalizeSiteFonts(fonts)
  const headingLevel = options?.headingLevel ?? 2
  const forms = options?.forms

  switch (role) {
    case 'nav':
      return {
        fontFamily: normalized.bodyFamily,
        fontSize: normalized.navSize,
        fontWeight: 500,
        fontStyle: 'normal' as const,
        lineHeight: 1.4,
        letterSpacing: 0,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'logo':
      return {
        fontFamily: normalized.headingFamily,
        fontSize: normalized.logoSize,
        fontWeight: normalized.headingWeight,
        fontStyle: 'normal' as const,
        lineHeight: 1.2,
        letterSpacing: normalized.headingLetterSpacing,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'label':
      return {
        fontFamily: normalized.bodyFamily,
        fontSize: normalized.labelSize,
        fontWeight: 400,
        fontStyle: 'normal' as const,
        lineHeight: 1.4,
        letterSpacing: 0,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'tab':
      return {
        fontFamily: normalized.bodyFamily,
        fontSize: 14,
        fontWeight: 600,
        fontStyle: 'normal' as const,
        lineHeight: 1.4,
        letterSpacing: 0,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'control':
      return {
        fontFamily: normalized.bodyFamily,
        fontSize: 12,
        fontWeight: 600,
        fontStyle: 'normal' as const,
        lineHeight: 1.2,
        letterSpacing: 0.04,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'formTitle':
      return {
        fontFamily: normalized.headingFamily,
        fontSize: getHeadingFontSize(2, normalized),
        fontWeight: 700,
        fontStyle: 'normal' as const,
        lineHeight: 1.2,
        letterSpacing: normalized.headingLetterSpacing,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'formBody':
      return {
        fontFamily: normalized.bodyFamily,
        fontSize: normalized.bodySize,
        fontWeight: normalized.bodyWeight,
        fontStyle: 'normal' as const,
        lineHeight: 1.75,
        letterSpacing: 0,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'formField':
      return {
        fontFamily: forms ? getFontFamily(forms.labelFontSource, normalized) : normalized.bodyFamily,
        fontSize: forms?.fieldFontSize ?? 16,
        fontWeight: 400,
        fontStyle: 'normal' as const,
        lineHeight: 1.5,
        letterSpacing: 0,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    case 'heading':
      return {
        fontFamily: normalized.headingFamily,
        fontSize: getHeadingFontSize(headingLevel, normalized),
        fontWeight: normalized.headingWeight,
        fontStyle: 'normal' as const,
        lineHeight: 1.2,
        letterSpacing: normalized.headingLetterSpacing,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
    default:
      return {
        fontFamily: normalized.bodyFamily,
        fontSize: normalized.bodySize,
        fontWeight: normalized.bodyWeight,
        fontStyle: 'normal' as const,
        lineHeight: 1.75,
        letterSpacing: 0,
        textTransform: 'none' as const,
        textDecoration: 'none' as const
      }
  }
}

function resolveFontFamily(
  role: TextTypographyRole,
  fonts: SiteFonts,
  overrides?: TextTypographyOverrides,
  forms?: SiteForms
): string {
  const normalized = normalizeSiteFonts(fonts)

  if (overrides?.fontSource === 'heading') {
    return normalized.headingFamily
  }

  if (overrides?.fontSource === 'body') {
    return normalized.bodyFamily
  }

  if (overrides?.fontSource === 'custom' && overrides.fontFamily) {
    return overrides.fontFamily
  }

  return getRoleDefaultFontFamily(role, normalized, forms)
}

export type ResolvedTextTypography = {
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  lineHeight: number
  letterSpacing: number
  textTransform: TextTypographyOverrides['textTransform']
  textDecoration: TextTypographyOverrides['textDecoration']
}

export function resolveTextTypographyValues(
  role: TextTypographyRole,
  fonts: SiteFonts,
  overrides?: TextTypographyOverrides,
  options?: TextTypographyOptions
): ResolvedTextTypography {
  const defaults = getThemeTypographyDefaults(role, fonts, options)

  return {
    fontFamily: resolveFontFamily(role, fonts, overrides, options?.forms),
    fontSize: overrides?.fontSize ?? defaults.fontSize,
    fontWeight: overrides?.fontWeight ?? defaults.fontWeight,
    fontStyle: overrides?.fontStyle ?? defaults.fontStyle,
    lineHeight: overrides?.lineHeight ?? defaults.lineHeight,
    letterSpacing: overrides?.letterSpacing ?? defaults.letterSpacing,
    textTransform: overrides?.textTransform ?? defaults.textTransform,
    textDecoration: overrides?.textDecoration ?? defaults.textDecoration
  }
}

export function resolveTextTypographySx(
  role: TextTypographyRole,
  fonts: SiteFonts,
  overrides?: TextTypographyOverrides,
  options?: TextTypographyOptions
): SxProps<Theme> {
  return resolveTextTypographyValues(role, fonts, overrides, options)
}

export function getTypographyRoleLabel(role: TextTypographyRole): string {
  const labels: Record<TextTypographyRole, string> = {
    heading: 'Theme heading font',
    body: 'Theme paragraph font',
    nav: 'Theme navigation font',
    logo: 'Theme logo font',
    label: 'Theme caption font',
    tab: 'Theme tab font',
    control: 'Theme control font',
    formTitle: 'Theme form title font',
    formBody: 'Theme form body font',
    formField: 'Theme form field font'
  }

  return labels[role]
}

export function getTypographyFontSizeRange(role: TextTypographyRole): { min: number; max: number } {
  switch (role) {
    case 'heading':
    case 'formTitle':
      return { min: 14, max: 96 }
    case 'logo':
      return { min: 12, max: 40 }
    case 'nav':
    case 'tab':
    case 'formField':
      return { min: 10, max: 24 }
    case 'label':
    case 'control':
      return { min: 9, max: 18 }
    default:
      return { min: 10, max: 32 }
  }
}

export function getTypographyFontSelectValue(
  role: TextTypographyRole,
  overrides?: TextTypographyOverrides
): string {
  if (overrides?.fontSource === 'heading') {
    return '__heading__'
  }

  if (overrides?.fontSource === 'body') {
    return '__body__'
  }

  if (overrides?.fontSource === 'custom' && overrides.fontFamily) {
    return overrides.fontFamily
  }

  return '__theme__'
}

export function typographyFontSelectValueToOverride(
  value: string
): Pick<TextTypographyOverrides, 'fontSource' | 'fontFamily'> | null {
  if (value === '__theme__') {
    return null
  }

  if (value === '__heading__') {
    return { fontSource: 'heading' }
  }

  if (value === '__body__') {
    return { fontSource: 'body' }
  }

  return { fontSource: 'custom', fontFamily: value }
}

export function mergeFormFieldTypographySx(
  baseSx: SxProps<Theme>,
  fonts: SiteFonts,
  forms: SiteForms,
  overrides?: TextTypographyOverrides
): SxProps<Theme> {
  if (!hasTextTypographyOverrides(overrides)) {
    return baseSx
  }

  const typography = resolveTextTypographyValues('formField', fonts, overrides, { forms })

  return {
    ...baseSx,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    letterSpacing: typography.letterSpacing,
    textTransform: typography.textTransform,
    '& .MuiOutlinedInput-root': {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      '& .MuiOutlinedInput-input': {
        fontFamily: typography.fontFamily,
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        letterSpacing: typography.letterSpacing,
        textTransform: typography.textTransform
      }
    },
    '& .MuiInputLabel-root': {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing
    },
    '& .MuiFormControlLabel-label': {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      textTransform: typography.textTransform
    }
  }
}
