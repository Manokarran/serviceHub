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

export function getMediaHoverSx(animation: ImageHoverEffect): SxProps<Theme> {
  if (animation === 'zoom') {
    return {
      '& .media-block-image': {
        transition: 'transform 0.65s ease',
        transform: 'scale(1)'
      },
      '&:hover .media-block-image': {
        transform: 'scale(1.08)'
      }
    }
  }

  if (animation === 'fade') {
    return {
      '& .media-block-image': {
        transition: 'opacity 0.45s ease',
        opacity: 1
      },
      '&:hover .media-block-image': {
        opacity: 0.82
      }
    }
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
  const animation = hoverEffect ?? misc.imageHoverEffect
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

export function getFixedBlockShellSx(type: 'header' | 'footer', fixed: boolean): SxProps<Theme> {
  if (!fixed) {
    return {}
  }

  return {
    position: 'sticky',
    zIndex: 1100,
    ...(type === 'header' ? { top: 0 } : { bottom: 0 })
  }
}
