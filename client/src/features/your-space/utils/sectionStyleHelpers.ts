import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import type { BackgroundType, BlockBackgroundProps, ImageHoverEffect, SectionBlockProps, SectionBorderStyle, SectionLayout, SectionSplitStyle } from '../types'

export function getBlockBackground(props: BlockBackgroundProps, fallback = '#ffffff'): string {
  return props.background ?? props.backgroundColor ?? fallback
}

/** @deprecated Use `getBlockBackground` */
export const getSectionBackground = getBlockBackground

export function getBlockBackgroundType(props: BlockBackgroundProps): BackgroundType {
  return props.backgroundType ?? 'color'
}

/** @deprecated Use `getBlockBackgroundType` */
export const getSectionBackgroundType = getBlockBackgroundType

export function isSimpleColor(value: string): boolean {
  const trimmed = value.trim()

  return (
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ||
    /^rgba?\(/.test(trimmed) ||
    /^hsla?\(/.test(trimmed)
  )
}

export function parsePhotoUrl(background: string): string | null {
  const match = background.match(/url\((['"]?)(.*?)\1\)/)

  return match?.[2] ?? null
}

export function parseMediaUrl(background: string): string | null {
  const photoUrl = parsePhotoUrl(background)

  if (photoUrl) {
    return photoUrl
  }

  const trimmed = background.trim()

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  return null
}

export function isVideoBackground(props: BlockBackgroundProps): boolean {
  if (props.backgroundType === 'video') {
    return true
  }

  const mediaUrl = parseMediaUrl(getBlockBackground(props))

  if (!mediaUrl) {
    return false
  }

  return /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl)
}

export function isPhotoBackground(props: BlockBackgroundProps): boolean {
  if (props.backgroundType === 'video') {
    return false
  }

  if (props.backgroundType === 'photo') {
    return true
  }

  const mediaUrl = parseMediaUrl(getBlockBackground(props))

  if (!mediaUrl) {
    return false
  }

  return !/\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl)
}

export function isMediaBackground(props: BlockBackgroundProps): boolean {
  return isPhotoBackground(props) || isVideoBackground(props)
}

export function buildPhotoBackgroundCss(url: string): string {
  return `url(${url}) center/cover no-repeat`
}

export function buildVideoBackgroundValue(url: string): string {
  return url
}

export function getPhotoAnimation(
  props: BlockBackgroundProps,
  siteDefault: ImageHoverEffect = 'none'
): ImageHoverEffect {
  return props.backgroundPhotoAnimation ?? siteDefault
}

export function getPhotoOpacity(props: BlockBackgroundProps): number {
  const opacity = props.backgroundPhotoOpacity ?? 100

  return Math.min(100, Math.max(0, opacity))
}

export function getBlockBackgroundOpacity(props: { backgroundOpacity?: number }): number {
  const opacity = props.backgroundOpacity ?? 100

  return Math.min(100, Math.max(0, opacity))
}

export function applyBackgroundAlpha(color: string, opacityPercent: number): string {
  const fraction = Math.min(100, Math.max(0, opacityPercent)) / 100

  if (fraction >= 1 || !isSimpleColor(color)) {
    return color
  }

  return alpha(color, fraction)
}

export const SECTION_PHOTO_LAYER_CLASS = 'builder-section-photo'

export function getPhotoLayerSx(opacityPercent: number): SxProps<Theme> {
  const opacityFraction = Math.min(100, Math.max(0, opacityPercent)) / 100

  return {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: opacityFraction,
    transformOrigin: 'center center',
    '--builder-photo-opacity': String(opacityFraction)
  }
}

/** Image Blocks hover effect — zoom/fade triggers on section mouseover */
export function getPhotoHoverSectionSx(animation: ImageHoverEffect, opacityPercent: number): SxProps<Theme> {
  const opacityFraction = Math.min(100, Math.max(0, opacityPercent)) / 100
  const photoLayer = `.${SECTION_PHOTO_LAYER_CLASS}`

  if (animation === 'zoom') {
    return {
      [`& ${photoLayer}`]: {
        transition: 'transform 0.65s ease',
        transform: 'scale(1)'
      },
      [`&:hover ${photoLayer}`]: {
        transform: 'scale(1.1)'
      }
    }
  }

  if (animation === 'fade') {
    return {
      [`& ${photoLayer}`]: {
        transition: 'opacity 0.45s ease',
        opacity: opacityFraction
      },
      [`&:hover ${photoLayer}`]: {
        opacity: opacityFraction * 0.72
      }
    }
  }

  return {}
}

export function getBlockBackgroundShellSx(
  props: BlockBackgroundProps,
  photoAnimation: ImageHoverEffect,
  photoOpacity: number,
  fallbackColor = '#ffffff'
): SxProps<Theme> {
  const background = getBlockBackground(props, fallbackColor)
  const usesSimpleColor = isSimpleColor(background)
  const hasMedia = isMediaBackground(props)
  const backgroundOpacity = getBlockBackgroundOpacity(props)

  return {
    position: 'relative',
    overflow: 'hidden',
    ...(usesSimpleColor && !hasMedia
      ? { backgroundColor: applyBackgroundAlpha(background, backgroundOpacity) }
      : !hasMedia
        ? { backgroundColor: 'transparent' }
        : {}),
    ...(hasMedia ? getPhotoHoverSectionSx(photoAnimation, photoOpacity) : {})
  }
}

export const DEFAULT_SECTION_STYLE: Pick<
  SectionBlockProps,
  | 'borderStyle'
  | 'borderWidth'
  | 'borderColor'
  | 'borderRadius'
  | 'splitStyle'
  | 'splitGap'
  | 'splitDividerColor'
  | 'primaryColumnBackground'
  | 'secondaryColumnBackground'
> = {
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  borderRadius: 0,
  splitStyle: 'gap',
  splitGap: 24,
  splitDividerColor: '#e2e8f0',
  primaryColumnBackground: '',
  secondaryColumnBackground: ''
}

export function getSectionFrameSx(props: SectionBlockProps): SxProps<Theme> {
  const radius = props.borderRadius ?? 0

  switch (props.borderStyle ?? 'none') {
    case 'subtle':
      return {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: radius,
        overflow: 'hidden'
      }
    case 'outline':
      return {
        border: `${props.borderWidth ?? 1}px solid ${props.borderColor ?? '#e2e8f0'}`,
        borderRadius: radius,
        overflow: 'hidden'
      }
    case 'elevated':
      return {
        borderRadius: radius,
        border: '1px solid',
        borderColor: alpha('#000', 0.06),
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden'
      }
    case 'inset':
      return {
        borderRadius: radius,
        border: '1px solid',
        borderColor: alpha('#000', 0.08),
        backgroundColor: alpha('#000', 0.02),
        overflow: 'hidden'
      }
    default:
      return radius > 0 ? { borderRadius: radius, overflow: 'hidden' } : {}
  }
}

function getContrastBaseColor(props: SectionBlockProps): string {
  const base = getBlockBackground(props)

  return isSimpleColor(base) ? base : '#f8fafc'
}

function autoColumnTint(base: string, amount: number): string {
  return alpha(base, amount)
}

export function getSectionColumnBackground(
  props: SectionBlockProps,
  column: 'primary' | 'secondary'
): string | undefined {
  const splitStyle = props.splitStyle ?? 'gap'

  if (splitStyle !== 'contrast') {
    return undefined
  }

  const custom = column === 'primary' ? props.primaryColumnBackground : props.secondaryColumnBackground

  if (custom) {
    return custom
  }

  const base = getContrastBaseColor(props)

  return column === 'primary' ? autoColumnTint(base, 0.04) : autoColumnTint(base, 0.1)
}

export function getSectionSplitContainerSx(
  props: SectionBlockProps,
  layout: SectionLayout
): SxProps<Theme> {
  const splitStyle = props.splitStyle ?? 'gap'
  const gap = splitStyle === 'gap' ? props.splitGap ?? 24 : 0
  const isHorizontal = layout === 'split-horizontal'

  return {
    display: 'flex',
    flexDirection: isHorizontal ? { xs: 'column', sm: 'row' } : 'column',
    gap: isHorizontal ? { xs: 16, sm: `${gap}px` } : `${gap}px`,
    width: '100%',
    position: 'relative'
  }
}

export function getSectionDividerSx(props: SectionBlockProps, layout: SectionLayout): SxProps<Theme> {
  const isHorizontal = layout === 'split-horizontal'

  return {
    flexShrink: 0,
    alignSelf: 'stretch',
    backgroundColor: props.splitDividerColor ?? '#e2e8f0',
    width: isHorizontal ? '1px' : '100%',
    height: isHorizontal ? 'auto' : '1px',
    minHeight: isHorizontal ? 48 : undefined,
    display: { xs: isHorizontal ? 'none' : 'block', sm: 'block' },
    my: isHorizontal ? 0 : 1
  }
}

export function getSectionColumnShellSx(
  props: SectionBlockProps,
  column: 'primary' | 'secondary',
  editMode: boolean
): SxProps<Theme> {
  const bg = getSectionColumnBackground(props, column)
  const splitStyle = props.splitStyle ?? 'gap'
  const radius = Math.max(0, (props.borderRadius ?? 0) - 2)
  const backgroundOpacity = getBlockBackgroundOpacity(props)

  return {
    flex: column === 'primary' ? props.splitRatio : 100 - props.splitRatio,
    minWidth: 0,
    ...(bg
      ? isSimpleColor(bg)
        ? { backgroundColor: applyBackgroundAlpha(bg, backgroundOpacity) }
        : { background: bg }
      : {}),
    ...(splitStyle === 'contrast' && radius > 0 ? { borderRadius: radius } : {}),
    ...(editMode && splitStyle === 'contrast'
      ? {
          outline: '1px solid',
          outlineColor: alpha('#000', 0.06),
          outlineOffset: -1
        }
      : {})
  }
}

export function shouldShowSplitDivider(props: SectionBlockProps): boolean {
  return (props.splitStyle ?? 'gap') === 'divider'
}

export const SECTION_BORDER_OPTIONS: { value: SectionBorderStyle; label: string; icon: string }[] = [
  { value: 'none', label: 'None', icon: 'ri-checkbox-blank-line' },
  { value: 'subtle', label: 'Subtle', icon: 'ri-square-line' },
  { value: 'outline', label: 'Outline', icon: 'ri-checkbox-blank-line' },
  { value: 'elevated', label: 'Card', icon: 'ri-layout-2-line' },
  { value: 'inset', label: 'Inset', icon: 'ri-layout-bottom-line' }
]

export const SECTION_SPLIT_STYLE_OPTIONS: { value: SectionSplitStyle; label: string; icon: string }[] = [
  { value: 'flush', label: 'Flush', icon: 'ri-layout-grid-line' },
  { value: 'gap', label: 'Gap', icon: 'ri-space' },
  { value: 'divider', label: 'Divider', icon: 'ri-layout-column-line' },
  { value: 'contrast', label: 'Contrast', icon: 'ri-contrast-2-line' }
]
