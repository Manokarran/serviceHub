import type { SxProps, Theme } from '@mui/material/styles'

import type { ImageAdjustments, ImageCropSettings } from '../types'
import {
  buildCssImageFilter,
  isDefaultImageAdjustments,
  isDefaultImageCrop
} from '@/lib/media/image-edit'
import { isImageKitUrl } from '@/lib/imagekit/config'
import { getEditedImageUrl } from '@/lib/imagekit/urls'

export function getCroppedImageElementSx(crop?: ImageCropSettings | null): SxProps<Theme> {
  if (!crop || isDefaultImageCrop(crop)) {
    return {}
  }

  return {
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    maxWidth: 'none',
    marginLeft: `${-(crop.x / crop.width) * 100}%`,
    marginTop: `${-(crop.y / crop.height) * 100}%`,
    objectFit: 'cover'
  }
}

export function shouldApplyClientImageEdits(params: {
  src: string
  crop?: ImageCropSettings | null
  adjustments?: ImageAdjustments | null
}): boolean {
  if (!params.src || isImageKitUrl(params.src)) {
    return false
  }

  return !isDefaultImageCrop(params.crop) || !isDefaultImageAdjustments(params.adjustments)
}

export function resolveBlockImageSrc(params: {
  src: string
  displayWidth: number
  crop?: ImageCropSettings | null
  adjustments?: ImageAdjustments | null
  naturalWidth?: number
  naturalHeight?: number
}): string {
  if (!params.src) {
    return ''
  }

  return getEditedImageUrl(params.src, params.displayWidth, {
    crop: params.crop,
    adjustments: params.adjustments,
    naturalWidth: params.naturalWidth,
    naturalHeight: params.naturalHeight
  })
}

export function getImageAdjustmentFilterSx(adjustments?: ImageAdjustments | null): SxProps<Theme> {
  const filter = buildCssImageFilter(adjustments)

  return filter ? { filter } : {}
}
