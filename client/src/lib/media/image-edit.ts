import type { ImageAdjustments, ImageCropSettings } from '@/features/your-space/types'
import { DEFAULT_IMAGE_ADJUSTMENTS, DEFAULT_IMAGE_CROP } from '@/features/your-space/types'

export const ENHANCE_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 106,
  contrast: 112,
  saturation: 108,
  sharpness: 35
}

export function normalizeImageCrop(crop?: ImageCropSettings | null): ImageCropSettings {
  if (!crop) {
    return { ...DEFAULT_IMAGE_CROP }
  }

  const width = clamp(crop.width, 0.05, 1)
  const height = clamp(crop.height, 0.05, 1)
  const x = clamp(crop.x, 0, 1 - width)
  const y = clamp(crop.y, 0, 1 - height)

  return { x, y, width, height }
}

export function normalizeImageAdjustments(adjustments?: ImageAdjustments | null): ImageAdjustments {
  if (!adjustments) {
    return { ...DEFAULT_IMAGE_ADJUSTMENTS }
  }

  return {
    brightness: clamp(adjustments.brightness, 50, 150),
    contrast: clamp(adjustments.contrast, 50, 150),
    saturation: clamp(adjustments.saturation, 0, 200),
    sharpness: clamp(adjustments.sharpness, 0, 100)
  }
}

export function isDefaultImageCrop(crop?: ImageCropSettings | null): boolean {
  const normalized = normalizeImageCrop(crop)

  return (
    normalized.x <= 0.001 &&
    normalized.y <= 0.001 &&
    normalized.width >= 0.999 &&
    normalized.height >= 0.999
  )
}

export function isDefaultImageAdjustments(adjustments?: ImageAdjustments | null): boolean {
  const normalized = normalizeImageAdjustments(adjustments)

  return (
    normalized.brightness === DEFAULT_IMAGE_ADJUSTMENTS.brightness &&
    normalized.contrast === DEFAULT_IMAGE_ADJUSTMENTS.contrast &&
    normalized.saturation === DEFAULT_IMAGE_ADJUSTMENTS.saturation &&
    normalized.sharpness === DEFAULT_IMAGE_ADJUSTMENTS.sharpness
  )
}

export function buildCssImageFilter(adjustments?: ImageAdjustments | null): string | undefined {
  const values = normalizeImageAdjustments(adjustments)

  if (isDefaultImageAdjustments(values)) {
    return undefined
  }

  const parts = [
    `brightness(${values.brightness / 100})`,
    `contrast(${values.contrast / 100})`,
    `saturate(${values.saturation / 100})`
  ]

  return parts.join(' ')
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

async function loadImageElement(src: string): Promise<HTMLImageElement> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.decoding = 'async'
  image.src = src

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Could not load the image for editing.'))
  })

  return image
}

/** Bake crop + adjustments into a new image blob (for permanent saves). */
export async function renderEditedImageBlob(params: {
  src: string
  crop?: ImageCropSettings | null
  adjustments?: ImageAdjustments | null
  quality?: number
}): Promise<{ blob: Blob; width: number; height: number }> {
  const crop = normalizeImageCrop(params.crop)
  const adjustments = normalizeImageAdjustments(params.adjustments)
  const image = await loadImageElement(params.src)

  const sourceWidth = image.naturalWidth
  const sourceHeight = image.naturalHeight
  const cropX = Math.round(crop.x * sourceWidth)
  const cropY = Math.round(crop.y * sourceHeight)
  const cropWidth = Math.max(1, Math.round(crop.width * sourceWidth))
  const cropHeight = Math.max(1, Math.round(crop.height * sourceHeight))

  const canvas = document.createElement('canvas')
  canvas.width = cropWidth
  canvas.height = cropHeight

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not prepare the image editor.')
  }

  const filter = buildCssImageFilter(adjustments)

  if (filter) {
    context.filter = filter
  }

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Failed to export the edited image.'))
        }
      },
      'image/webp',
      params.quality ?? 0.9
    )
  })

  return { blob, width: cropWidth, height: cropHeight }
}
