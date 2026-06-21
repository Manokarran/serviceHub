import type { SxProps, Theme } from '@mui/material/styles'

import type { ImageHoverEffect } from '../types'
import type { ImageAspectRatio, SiteMisc } from '../types/siteStyles'

const ASPECT_RATIO_MAP: Record<ImageAspectRatio, string | undefined> = {
  auto: undefined,
  '16/9': '16 / 9',
  '4/3': '4 / 3',
  '1/1': '1 / 1'
}

export function getMediaAspectRatio(misc: SiteMisc): string | undefined {
  return ASPECT_RATIO_MAP[misc.imageAspectRatio]
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
  const animation = hoverEffect ?? misc.imageHoverEffect
  const radius = cornerRadius ?? misc.imageCornerRadius

  return {
    borderRadius: `${radius}px`,
    overflow: 'hidden',
    ...(aspectRatio ? { aspectRatio } : {}),
    ...getMediaHoverSx(animation)
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
