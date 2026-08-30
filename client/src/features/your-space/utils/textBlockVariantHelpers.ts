import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import type {
  HeadingBlockProps,
  HeadingBlockVariant,
  TextBlockProps,
  TextBlockVariant,
  TextTypographyOverrides
} from '../types'
import type { SiteFonts } from '../types/siteStyles'
import { resolveTextTypographySx } from './textTypographyHelpers'
import { siteCanvasBelow } from './siteResponsiveHelpers'

export const TEXT_VARIANT_OPTIONS: { value: TextBlockVariant; label: string; icon: string }[] = [
  { value: 'paragraph', label: 'Paragraph', icon: 'ri-text' },
  { value: 'lead', label: 'Lead', icon: 'ri-font-size' },
  { value: 'quote', label: 'Quote', icon: 'ri-double-quotes-l' },
  { value: 'pullquote', label: 'Pull quote', icon: 'ri-chat-quote-line' },
  { value: 'testimonial', label: 'Review', icon: 'ri-user-star-line' },
  { value: 'calligraphy', label: 'Calligraphy', icon: 'ri-quill-pen-line' },
  { value: 'caption', label: 'Caption', icon: 'ri-text-snippet' },
  { value: 'callout', label: 'Callout', icon: 'ri-sticky-note-line' }
]

export const HEADING_VARIANT_OPTIONS: { value: HeadingBlockVariant; label: string; icon: string }[] = [
  { value: 'default', label: 'Standard', icon: 'ri-heading' },
  { value: 'display', label: 'Display', icon: 'ri-font-size-2' },
  { value: 'eyebrow', label: 'Eyebrow', icon: 'ri-text-spacing' },
  { value: 'script', label: 'Script', icon: 'ri-quill-pen-line' }
]

export function getTextVariant(props: TextBlockProps): TextBlockVariant {
  return props.variant ?? 'paragraph'
}

export function getHeadingVariant(props: HeadingBlockProps): HeadingBlockVariant {
  return props.variant ?? 'default'
}

export function textVariantNeedsAttribution(variant: TextBlockVariant): boolean {
  return variant === 'quote' || variant === 'pullquote' || variant === 'testimonial' || variant === 'calligraphy'
}

/** Extra Google Fonts used by decorative typography presets. */
export const DECORATIVE_GOOGLE_FONTS = [
  'Great+Vibes',
  'Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600',
  'Playfair+Display:ital,wght@0,500;0,600;1,500;1,600'
] as const

export function getDecorativeFontsStylesheetUrl(): string {
  return `https://fonts.googleapis.com/css2?${DECORATIVE_GOOGLE_FONTS.map(f => `family=${f}`).join('&')}&display=swap`
}

function mergeTypography(
  base: TextTypographyOverrides | undefined,
  preset: TextTypographyOverrides
): TextTypographyOverrides {
  return { ...preset, ...base }
}

export function getTextVariantTypographyPreset(variant: TextBlockVariant): TextTypographyOverrides | undefined {
  switch (variant) {
    case 'lead':
      return { fontSize: 20, fontWeight: 400, lineHeight: 1.55, letterSpacing: -0.01 }
    case 'quote':
      return {
        fontSource: 'custom',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: 22,
        fontWeight: 500,
        fontStyle: 'italic',
        lineHeight: 1.55
      }
    case 'pullquote':
      return {
        fontSource: 'custom',
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 28,
        fontWeight: 500,
        fontStyle: 'italic',
        lineHeight: 1.35,
        letterSpacing: -0.01
      }
    case 'testimonial':
      return {
        fontSource: 'custom',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: 20,
        fontWeight: 500,
        fontStyle: 'italic',
        lineHeight: 1.6
      }
    case 'calligraphy':
      return {
        fontSource: 'custom',
        fontFamily: '"Great Vibes", cursive',
        fontSize: 36,
        fontWeight: 400,
        lineHeight: 1.35,
        letterSpacing: 0.02
      }
    case 'caption':
      return { fontSize: 13, fontWeight: 500, lineHeight: 1.45, letterSpacing: 0.02, textTransform: 'none' }
    case 'callout':
      return { fontSize: 16, fontWeight: 500, lineHeight: 1.6 }
    default:
      return undefined
  }
}

export function getHeadingVariantTypographyPreset(
  variant: HeadingBlockVariant,
  level: 1 | 2 | 3
): TextTypographyOverrides | undefined {
  switch (variant) {
    case 'display':
      return {
        fontSize: level === 1 ? 56 : level === 2 ? 44 : 34,
        fontWeight: 700,
        lineHeight: 1.05,
        letterSpacing: -0.03
      }
    case 'eyebrow':
      return {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: 0.14,
        textTransform: 'uppercase'
      }
    case 'script':
      return {
        fontSource: 'custom',
        fontFamily: '"Great Vibes", cursive',
        fontSize: level === 1 ? 52 : level === 2 ? 42 : 34,
        fontWeight: 400,
        lineHeight: 1.2
      }
    default:
      return undefined
  }
}

export function resolveTextBlockTypographySx(
  props: TextBlockProps,
  fonts: SiteFonts
): SxProps<Theme> {
  const variant = getTextVariant(props)
  const preset = getTextVariantTypographyPreset(variant)
  const merged = mergeTypography(props.typography, preset ?? {})

  return {
    ...resolveTextTypographySx('body', fonts, Object.keys(merged).length ? merged : undefined),
    color: props.color,
    display: 'block'
  }
}

export function resolveHeadingBlockTypographySx(
  props: HeadingBlockProps,
  fonts: SiteFonts
): SxProps<Theme> {
  const variant = getHeadingVariant(props)
  const preset = getHeadingVariantTypographyPreset(variant, props.level)
  const merged = mergeTypography(props.typography, preset ?? {})

  return {
    ...resolveTextTypographySx('heading', fonts, Object.keys(merged).length ? merged : undefined, {
      headingLevel: props.level
    }),
    color: props.color,
    display: 'block'
  }
}

export function getTextVariantShellSx(
  props: TextBlockProps,
  theme: Theme
): SxProps<Theme> {
  const variant = getTextVariant(props)
  const accent = props.accentColor?.trim() || theme.palette.primary.main
  const align = props.alignment
  const mobileSpacing = siteCanvasBelow({ px: 2 })

  switch (variant) {
    case 'quote':
      return {
        px: { xs: 2.5, sm: 4 },
        py: 2,
        textAlign: align,
        borderLeft: `3px solid ${accent}`,
        pl: { xs: 2.5, sm: 3 },
        ml: align === 'center' ? 'auto' : 0,
        mr: align === 'center' || align === 'right' ? (align === 'right' ? 0 : 'auto') : undefined,
        maxWidth: 720,
        ...mobileSpacing
      }
    case 'pullquote':
      return {
        px: 4,
        py: 3,
        textAlign: align === 'left' ? 'center' : align,
        maxWidth: 640,
        mx: 'auto',
        position: 'relative',
        ...mobileSpacing
      }
    case 'testimonial':
      return {
        px: 3,
        py: 3,
        textAlign: align,
        maxWidth: 680,
        mx: align === 'center' ? 'auto' : undefined,
        borderRadius: 2,
        backgroundColor: alpha(accent, 0.06),
        border: `1px solid ${alpha(accent, 0.14)}`,
        ...mobileSpacing
      }
    case 'calligraphy':
      return {
        px: 4,
        py: 3,
        textAlign: align === 'left' ? 'center' : align,
        maxWidth: 720,
        mx: 'auto',
        ...mobileSpacing
      }
    case 'callout':
      return {
        px: 3,
        py: 2.25,
        textAlign: align,
        maxWidth: 720,
        mx: align === 'center' ? 'auto' : undefined,
        borderRadius: 1.5,
        backgroundColor: alpha(accent, 0.08),
        borderLeft: `4px solid ${accent}`,
        ...mobileSpacing
      }
    case 'lead':
      return {
        px: 4,
        py: 1.5,
        textAlign: align,
        maxWidth: 760,
        mx: align === 'center' ? 'auto' : undefined,
        ...mobileSpacing
      }
    case 'caption':
      return {
        px: 4,
        py: 0.75,
        textAlign: align,
        maxWidth: 640,
        mx: align === 'center' ? 'auto' : undefined,
        opacity: 0.85,
        ...mobileSpacing
      }
    default:
      return {
        px: 4,
        py: 1,
        textAlign: align,
        maxWidth: 720,
        mx: align === 'center' ? 'auto' : undefined,
        ...mobileSpacing
      }
  }
}

export function getHeadingVariantShellSx(props: HeadingBlockProps): SxProps<Theme> {
  const variant = getHeadingVariant(props)

  if (variant === 'eyebrow') {
    return {
      px: 4,
      py: 1,
      textAlign: props.alignment,
      opacity: 0.75,
      ...siteCanvasBelow({ px: 2 })
    }
  }

  if (variant === 'display' || variant === 'script') {
    return {
      px: 4,
      py: 2.5,
      textAlign: props.alignment,
      maxWidth: variant === 'script' ? 800 : undefined,
      mx: props.alignment === 'center' ? 'auto' : undefined,
      ...siteCanvasBelow({ px: 2 })
    }
  }

  return {
    px: 4,
    py: 2,
    textAlign: props.alignment,
    ...siteCanvasBelow({ px: 2 })
  }
}
