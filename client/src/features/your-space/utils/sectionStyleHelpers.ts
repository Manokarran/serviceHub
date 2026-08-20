import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import { DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../constants/heroVisual'
import type { BackgroundType, BlockBackgroundProps, ImageHoverEffect, SectionBlockProps, SectionBorderStyle, SectionLayout, SectionSplitStyle, SplitVisualConfig } from '../types'
import { siteCanvasAbove, siteCanvasBelow } from './siteResponsiveHelpers'

export function getBlockBackground(props: BlockBackgroundProps, fallback = '#ffffff'): string {
  return props.background ?? props.backgroundColor ?? fallback
}

/** @deprecated Use `getBlockBackground` */
export const getSectionBackground = getBlockBackground

export function getBlockBackgroundType(props: BlockBackgroundProps): BackgroundType {
  return props.backgroundType ?? 'color'
}

export type BlockBackgroundMode = 'static' | 'animated'

export function isAnimatedBackgroundMode(config: SplitVisualConfig): boolean {
  const animation = config.splitVisualAnimation ?? 'static'

  return animation !== 'static'
}

/** Photo, video, pattern, and gradient fills always use static layers — not animated visuals. */
export function isEffectiveAnimatedBackgroundMode(
  config: BlockBackgroundProps & SplitVisualConfig
): boolean {
  if (isMediaBackground(config)) {
    return false
  }

  const backgroundType = getBlockBackgroundType(config)

  if (isVisualBackgroundType(backgroundType) && backgroundType !== 'color') {
    return false
  }

  return isAnimatedBackgroundMode(config)
}

export function shouldRenderBlockBackgroundLayers(
  config: BlockBackgroundProps & SplitVisualConfig
): boolean {
  return !isEffectiveAnimatedBackgroundMode(config)
}

export function getBlockBackgroundMode(config: BlockBackgroundProps & SplitVisualConfig): BlockBackgroundMode {
  return isEffectiveAnimatedBackgroundMode(config) ? 'animated' : 'static'
}

export function isVisualBackgroundType(backgroundType: string): boolean {
  return (
    backgroundType === 'gradient' ||
    backgroundType === 'pattern' ||
    backgroundType === 'photo' ||
    backgroundType === 'video'
  )
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
  const trimmed = background.trim()

  if (!trimmed.startsWith('url(')) {
    return null
  }

  const quotedMatch = trimmed.match(/^url\(\s*(['"])(.*?)\1/)
  if (quotedMatch?.[2]) {
    return quotedMatch[2].trim()
  }

  const unquotedMatch = trimmed.match(/^url\(\s*([^)]+)\s*\)/)
  if (unquotedMatch?.[1]) {
    return unquotedMatch[1].trim()
  }

  return null
}

export function isValidMediaUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) {
    return false
  }

  try {
    const parsed = new URL(url.trim())

    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'blob:'
  } catch {
    return false
  }
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

/** Normalize persisted photo/video values to a bare URL string. */
export function normalizeStoredMediaUrl(background: string, backgroundType?: BackgroundType): string {
  if (backgroundType !== 'photo' && backgroundType !== 'video') {
    return background
  }

  const parsed = parseMediaUrl(background)

  if (parsed && isValidMediaUrl(parsed)) {
    return parsed
  }

  if (isValidMediaUrl(background)) {
    return background.trim()
  }

  return background
}

export function resolveBlockMediaUrl(props: BlockBackgroundProps, fallback?: string): string | null {
  const raw = getBlockBackground(props, fallback ?? '')
  const parsed = parseMediaUrl(raw) ?? (isValidMediaUrl(raw) ? raw.trim() : null)

  return parsed && isValidMediaUrl(parsed) ? parsed : null
}

export function isVideoBackground(props: BlockBackgroundProps): boolean {
  const mediaUrl = resolveBlockMediaUrl(props)

  if (!mediaUrl) {
    return false
  }

  if (props.backgroundType === 'video') {
    return true
  }

  if (props.backgroundType === 'photo') {
    return false
  }

  return /\.(mp4|webm|mov)(\?|#|$)/i.test(mediaUrl)
}

export function isPhotoBackground(props: BlockBackgroundProps): boolean {
  const mediaUrl = resolveBlockMediaUrl(props)

  if (!mediaUrl) {
    return false
  }

  if (props.backgroundType === 'video') {
    return false
  }

  if (props.backgroundType === 'photo') {
    return true
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

/** Unified fill opacity for color, pattern, gradient, photo, and video backgrounds. */
export function getBlockFillOpacity(props: BlockBackgroundProps): number {
  const opacity = props.backgroundOpacity ?? props.backgroundPhotoOpacity ?? 100

  // Sections default to 0 for a transparent color fill; photo/video must remain visible.
  if (opacity === 0 && isMediaBackground(props)) {
    return 100
  }

  return Math.min(100, Math.max(0, opacity))
}

/** @deprecated Use `getBlockFillOpacity` */
export const getPhotoOpacity = getBlockFillOpacity

export function getBlockBackgroundOpacity(props: BlockBackgroundProps): number {
  return getBlockFillOpacity(props)
}

export function getStaticBackgroundModeUpdate(): Pick<SplitVisualConfig, 'splitVisualAnimation'> {
  return { splitVisualAnimation: 'static' }
}

export function getAnimatedBackgroundModeUpdate(
  config: BlockBackgroundProps & SplitVisualConfig & { backgroundColor?: string }
): Partial<BlockBackgroundProps & SplitVisualConfig & { backgroundColor?: string }> {
  if (isEffectiveAnimatedBackgroundMode(config)) {
    return {}
  }

  const backgroundType = getBlockBackgroundType(config)
  const usesStaticVisualFill =
    isMediaBackground(config) ||
    (isVisualBackgroundType(backgroundType) && backgroundType !== 'color')

  const updates: Partial<BlockBackgroundProps & SplitVisualConfig & { backgroundColor?: string }> = {
    splitVisualAnimation:
      config.splitVisualAnimation && config.splitVisualAnimation !== 'static'
        ? config.splitVisualAnimation
        : DEFAULT_HERO_SPLIT_VISUAL_ANIMATION
  }

  if (usesStaticVisualFill) {
    const fallback = config.backgroundColor ?? '#ffffff'
    const current = config.background ?? fallback

    updates.backgroundType = 'color'
    updates.background = isSimpleColor(current) ? current : fallback
  }

  return updates
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
  fallbackColor = '#ffffff',
  options?: { fillEnabled?: boolean }
): SxProps<Theme> {
  const fillEnabled = options?.fillEnabled ?? true
  const background = getBlockBackground(props, fallbackColor)
  const usesSimpleColor = isSimpleColor(background)
  const hasMedia = isMediaBackground(props)
  const backgroundOpacity = getBlockBackgroundOpacity(props)

  return {
    position: 'relative',
    overflow: 'hidden',
    ...(fillEnabled && usesSimpleColor && !hasMedia
      ? { backgroundColor: applyBackgroundAlpha(background, backgroundOpacity) }
      : !fillEnabled || !hasMedia
        ? { backgroundColor: 'transparent' }
        : {}),
    ...(fillEnabled && hasMedia ? getPhotoHoverSectionSx(photoAnimation, photoOpacity) : {})
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
    position: 'relative',
    ...(isHorizontal
      ? {
          ...siteCanvasBelow({ flexDirection: 'column', gap: '16px' }),
          ...siteCanvasAbove({ flexDirection: 'row', gap: `${gap}px` })
        }
      : {})
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
    my: isHorizontal ? 0 : 1,
    ...(isHorizontal
      ? {
          ...siteCanvasBelow({ display: 'none' }),
          ...siteCanvasAbove({ display: 'block' })
        }
      : {})
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

  const layout = props.layout ?? 'default'
  const isHorizontalSplit = layout === 'split-horizontal'
  const isVerticalSplit = layout === 'split-vertical'

  return {
    flex: column === 'primary' ? props.splitRatio : 100 - props.splitRatio,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    ...(isVerticalSplit
      ? {
          minHeight: editMode ? 112 : undefined,
          flexBasis: 0
        }
      : {}),
    ...(isHorizontalSplit
      ? {
          ...siteCanvasBelow({ flex: '1 1 auto', width: '100%' })
        }
      : {}),
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
