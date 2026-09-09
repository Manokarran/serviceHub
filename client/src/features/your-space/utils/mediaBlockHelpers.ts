import type { SxProps, Theme } from '@mui/material/styles'

import type { ImageContinuousAnimation, ImageEntranceAnimation, ImageHoverEffect } from '../types'
import type { ImageAspectRatio, SiteMisc } from '../types/siteStyles'

const ASPECT_RATIO_MAP: Record<ImageAspectRatio, string | undefined> = {
  auto: undefined,
  '16/9': '16 / 9',
  '4/3': '4 / 3',
  '1/1': '1 / 1'
}

export const IMAGE_DISPLAY_MAX_WIDTH = 720

export function getMediaAspectRatio(misc: SiteMisc): string | undefined {
  return ASPECT_RATIO_MAP[misc.imageAspectRatio]
}

export function getMediaOpacityFraction(opacity?: number): number {
  const value = opacity ?? 100

  return Math.min(100, Math.max(0, value)) / 100
}

export function getMediaHoverSx(
  animation: ImageHoverEffect,
  options?: { /** Ancestor selector that should also activate hover styles, e.g. `.showcase-hover-root` */ groupRoot?: string }
): SxProps<Theme> {
  const group = options?.groupRoot

  const withGroupHover = (hoverRules: Record<string, unknown>): SxProps<Theme> => {
    if (!group) {
      return hoverRules
    }

    const grouped: Record<string, unknown> = { ...hoverRules }

    for (const [key, value] of Object.entries(hoverRules)) {
      if (key.startsWith('&:hover')) {
        const suffix = key.slice('&:hover'.length)
        grouped[`${group}:hover &${suffix}`] = value
      }
    }

    return grouped
  }

  if (animation === 'zoom') {
    return withGroupHover({
      '& .media-block-image': {
        transition: 'transform 0.65s ease',
        transform: 'scale(1)',
        transformOrigin: 'center center'
      },
      '&:hover .media-block-image': {
        transform: 'scale(1.08)'
      }
    })
  }

  if (animation === 'fade') {
    return withGroupHover({
      '& .media-block-image': {
        transition: 'opacity 0.45s ease',
        opacity: 1
      },
      '&:hover .media-block-image': {
        opacity: 0.82
      }
    })
  }

  if (animation === 'lift') {
    return withGroupHover({
      transition: 'transform 0.45s ease, box-shadow 0.45s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.16)'
      }
    })
  }

  if (animation === 'blur') {
    return withGroupHover({
      '& .media-block-image': {
        transition: 'filter 0.45s ease, transform 0.45s ease',
        filter: 'blur(0px)',
        transform: 'scale(1)',
        transformOrigin: 'center center'
      },
      '&:hover .media-block-image': {
        filter: 'blur(2px)',
        transform: 'scale(1.04)'
      }
    })
  }

  if (animation === 'grayscale') {
    return withGroupHover({
      '& .media-block-image': {
        transition: 'filter 0.45s ease',
        filter: 'grayscale(0)'
      },
      '&:hover .media-block-image': {
        filter: 'grayscale(0.85)'
      }
    })
  }

  return {}
}

export function getMediaFrameSx(
  misc: SiteMisc,
  hoverEffect?: ImageHoverEffect,
  cornerRadius?: number
): SxProps<Theme> {
  const aspectRatio = getMediaAspectRatio(misc)
  const hasFixedAspect = Boolean(aspectRatio)
  const animation = hoverEffect ?? misc.imageHoverEffect ?? 'zoom'
  const radius = cornerRadius ?? misc.imageCornerRadius

  return {
    borderRadius: `${radius}px`,
    overflow: 'hidden',
    width: hasFixedAspect ? '100%' : 'fit-content',
    maxWidth: '100%',
    ...(aspectRatio ? { aspectRatio } : {}),
    ...getMediaHoverSx(animation)
  }
}

/** Frame + image layout for image blocks — intrinsic size when aspect ratio is auto. */
export function getImageFrameSx(
  misc: SiteMisc,
  hoverEffect?: ImageHoverEffect,
  cornerRadius?: number,
  naturalWidth?: number
): SxProps<Theme> {
  const aspectRatio = getMediaAspectRatio(misc)
  const hasFixedAspect = Boolean(aspectRatio)
  const cappedNaturalWidth =
    naturalWidth && naturalWidth > 0
      ? Math.min(naturalWidth, IMAGE_DISPLAY_MAX_WIDTH)
      : IMAGE_DISPLAY_MAX_WIDTH

  return {
    ...getMediaFrameSx(misc, hoverEffect, cornerRadius),
    maxWidth: hasFixedAspect ? IMAGE_DISPLAY_MAX_WIDTH : cappedNaturalWidth
  }
}

export function getImageElementSx(hasFixedAspect: boolean): SxProps<Theme> {
  return {
    width: hasFixedAspect ? '100%' : 'auto',
    maxWidth: '100%',
    height: hasFixedAspect ? '100%' : 'auto',
    objectFit: hasFixedAspect ? 'cover' : 'scale-down',
    display: 'block'
  }
}

export function getImageDeliveryWidth(naturalWidth?: number): number {
  if (naturalWidth && naturalWidth > 0) {
    return Math.min(naturalWidth, IMAGE_DISPLAY_MAX_WIDTH)
  }

  return IMAGE_DISPLAY_MAX_WIDTH
}

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)'

/**
 * Returns sx for the outer wrapper that hides the image before it enters the
 * viewport (`active = false`) and plays the entrance animation once visible.
 */
export function getEntranceAnimationSx(
  animation: ImageEntranceAnimation,
  active: boolean
): SxProps<Theme> {
  if (animation === 'none') return {}

  if (!active) {
    // Keep image in its pre-animation state so the layout is stable but hidden
    switch (animation) {
      case 'fade-in':
        return { opacity: 0 }
      case 'slide-up':
        return { opacity: 0, transform: 'translateY(28px)' }
      case 'zoom-in':
        return { opacity: 0, transform: 'scale(0.87)' }
      case 'blur-in':
        return { opacity: 0, filter: 'blur(10px)' }
      case 'flip-up':
        return { opacity: 0, transform: 'perspective(600px) rotateX(25deg)' }
      default:
        return { opacity: 0 }
    }
  }

  switch (animation) {
    case 'fade-in':
      return {
        '@keyframes imgFadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
        animation: 'imgFadeIn 0.65s ease both'
      }
    case 'slide-up':
      return {
        '@keyframes imgSlideUp': {
          from: { opacity: 0, transform: 'translateY(28px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        animation: `imgSlideUp 0.7s ${SPRING} both`
      }
    case 'zoom-in':
      return {
        '@keyframes imgZoomIn': {
          from: { opacity: 0, transform: 'scale(0.87)' },
          to: { opacity: 1, transform: 'scale(1)' }
        },
        animation: `imgZoomIn 0.6s ${SPRING} both`
      }
    case 'blur-in':
      return {
        '@keyframes imgBlurIn': {
          from: { opacity: 0, filter: 'blur(10px)' },
          to: { opacity: 1, filter: 'blur(0px)' }
        },
        animation: 'imgBlurIn 0.8s ease both'
      }
    case 'flip-up':
      return {
        '@keyframes imgFlipUp': {
          from: { opacity: 0, transform: 'perspective(600px) rotateX(25deg)' },
          to: { opacity: 1, transform: 'perspective(600px) rotateX(0deg)' }
        },
        animation: `imgFlipUp 0.65s ${SPRING} both`
      }
    default:
      return {}
  }
}

/**
 * Returns sx for the image frame that applies a looping CSS animation.
 * `userOpacity` (0–1) is used so the breathe effect respects the block's opacity setting.
 */
export function getContinuousAnimationSx(
  animation: ImageContinuousAnimation,
  userOpacity: number
): SxProps<Theme> {
  switch (animation) {
    case 'float':
      return {
        '@keyframes imgFloat': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        animation: 'imgFloat 3s ease-in-out infinite'
      }
    case 'pulse':
      return {
        '@keyframes imgPulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' }
        },
        animation: 'imgPulse 2.8s ease-in-out infinite'
      }
    case 'breathe':
      return {
        // Use CSS custom properties so the breathe range respects user's opacity setting
        '--breath-hi': String(userOpacity),
        '--breath-lo': String(Math.max(0, userOpacity * 0.55)),
        '@keyframes imgBreathe': {
          '0%, 100%': { opacity: 'var(--breath-hi)' },
          '50%': { opacity: 'var(--breath-lo)' }
        },
        animation: 'imgBreathe 4s ease-in-out infinite'
      } as SxProps<Theme>
    case 'shimmer':
      return {
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.38) 50%, transparent 70%)',
          backgroundSize: '250% 100%',
          '@keyframes imgShimmer': {
            from: { backgroundPosition: '150% center' },
            to: { backgroundPosition: '-150% center' }
          },
          animation: 'imgShimmer 2.5s linear infinite',
          pointerEvents: 'none'
        }
      }
    case 'swing':
      return {
        transformOrigin: 'center 40%',
        '@keyframes imgSwing': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2.5deg)' },
          '75%': { transform: 'rotate(2.5deg)' }
        },
        animation: 'imgSwing 3.5s ease-in-out infinite'
      }
    default:
      return {}
  }
}

const STICKY_CHROME_MORPH_TRANSITION = 'padding 300ms cubic-bezier(0.4, 0, 0.2, 1)'

const STICKY_CHROME_BAR_TRANSITION =
  'border-radius 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 300ms cubic-bezier(0.4, 0, 0.2, 1)'

/** Floating pill inset when sticky header/footer has scrolled (FlowShorts-style). */
export const STICKY_CHROME_FLOAT_RADIUS_PX = 16

/** @deprecated Use `STICKY_CHROME_FLOAT_RADIUS_PX` */
export const STICKY_HEADER_FLOAT_RADIUS_PX = STICKY_CHROME_FLOAT_RADIUS_PX

export function getFixedBlockShellSx(
  type: 'header' | 'footer',
  fixed: boolean,
  scrolled = false
): SxProps<Theme> {
  if (!fixed) {
    return {}
  }

  const inset = scrolled ? { xs: 1.5, sm: 2.5 } : 0

  if (type === 'footer') {
    return {
      position: 'sticky',
      zIndex: 1100,
      bottom: 0,
      px: inset,
      pb: scrolled ? 1.5 : 0,
      transition: STICKY_CHROME_MORPH_TRANSITION
    }
  }

  return {
    position: 'sticky',
    zIndex: 1100,
    top: 0,
    px: inset,
    pt: scrolled ? 1.5 : 0,
    transition: STICKY_CHROME_MORPH_TRANSITION
  }
}

/** Shadow wrapper around sticky chrome (keeps shadow outside overflow:hidden). */
export function getStickyChromeFloatShadowSx(
  scrolled: boolean,
  borderRadius?: number
): SxProps<Theme> {
  const restRadius = borderRadius ?? 0
  const floatRadius = Math.max(restRadius, STICKY_CHROME_FLOAT_RADIUS_PX)

  return {
    borderRadius: scrolled ? `${floatRadius}px` : restRadius ? `${restRadius}px` : 0,
    boxShadow: scrolled
      ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      : 'none',
    transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1), border-radius 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

/** @deprecated Use `getStickyChromeFloatShadowSx` */
export const getStickyHeaderFloatShadowSx = getStickyChromeFloatShadowSx

type StickyChromeBarOptions = {
  scrolled: boolean
  borderRadius?: number
  /** Resting edge hairline — header uses bottom, footer uses top. */
  edge: 'bottom' | 'top'
  edgeColor?: string
}

/** Inner chrome styles for sticky header/footer at-rest vs floating-scrolled. */
export function getStickyChromeBarSx({
  scrolled,
  borderRadius,
  edge,
  edgeColor = 'rgba(0,0,0,0.06)'
}: StickyChromeBarOptions): SxProps<Theme> {
  const restRadius = borderRadius ?? 0
  const floatRadius = Math.max(restRadius, STICKY_CHROME_FLOAT_RADIUS_PX)
  const edgeBorder = scrolled ? '1px solid transparent' : `1px solid ${edgeColor}`

  return {
    transition: STICKY_CHROME_BAR_TRANSITION,
    borderRadius: scrolled ? `${floatRadius}px` : restRadius ? `${restRadius}px` : 0,
    ...(edge === 'bottom' ? { borderBottom: edgeBorder } : { borderTop: edgeBorder }),
    backdropFilter: scrolled ? 'blur(16px) saturate(1.2)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.2)' : 'none'
  }
}

/** @deprecated Use `getStickyChromeBarSx` */
export function getStickyHeaderBarSx(
  scrolled: boolean,
  borderRadius?: number
): SxProps<Theme> {
  return getStickyChromeBarSx({ scrolled, borderRadius, edge: 'bottom' })
}
