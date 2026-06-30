import type { ImageCropSettings } from '@/features/your-space/types'

import { normalizeImageCrop } from '@/lib/media/image-edit'

export type ImageLayout = {
  offsetX: number
  offsetY: number
  displayWidth: number
  displayHeight: number
}

export type CropRectPx = {
  x: number
  y: number
  width: number
  height: number
}

export type CropHandle =
  | 'move'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'

const MIN_CROP_FRACTION = 0.05
export const IMAGE_CROP_EDITOR_PADDING = 32

export function computeImageLayout(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  padding = IMAGE_CROP_EDITOR_PADDING
): ImageLayout {
  const innerWidth = Math.max(1, containerWidth - padding * 2)
  const innerHeight = Math.max(1, containerHeight - padding * 2)
  const safeNaturalWidth = Math.max(1, naturalWidth)
  const safeNaturalHeight = Math.max(1, naturalHeight)
  const scale = Math.min(innerWidth / safeNaturalWidth, innerHeight / safeNaturalHeight)
  const displayWidth = safeNaturalWidth * scale
  const displayHeight = safeNaturalHeight * scale

  return {
    offsetX: padding + (innerWidth - displayWidth) / 2,
    offsetY: padding + (innerHeight - displayHeight) / 2,
    displayWidth,
    displayHeight
  }
}

export function cropToRectPx(crop: ImageCropSettings, layout: ImageLayout): CropRectPx {
  const normalized = normalizeImageCrop(crop)

  return {
    x: layout.offsetX + normalized.x * layout.displayWidth,
    y: layout.offsetY + normalized.y * layout.displayHeight,
    width: normalized.width * layout.displayWidth,
    height: normalized.height * layout.displayHeight
  }
}

export function rectPxToCrop(rect: CropRectPx, layout: ImageLayout): ImageCropSettings {
  return normalizeImageCrop({
    x: (rect.x - layout.offsetX) / layout.displayWidth,
    y: (rect.y - layout.offsetY) / layout.displayHeight,
    width: rect.width / layout.displayWidth,
    height: rect.height / layout.displayHeight
  })
}

export function clampRectToImage(rect: CropRectPx, layout: ImageLayout): CropRectPx {
  const minSize = Math.min(layout.displayWidth, layout.displayHeight) * MIN_CROP_FRACTION
  let { x, y, width, height } = rect

  width = Math.max(minSize, width)
  height = Math.max(minSize, height)

  const minX = layout.offsetX
  const minY = layout.offsetY
  const maxX = layout.offsetX + layout.displayWidth
  const maxY = layout.offsetY + layout.displayHeight

  if (x < minX) {
    x = minX
  }

  if (y < minY) {
    y = minY
  }

  if (x + width > maxX) {
    x = maxX - width
  }

  if (y + height > maxY) {
    y = maxY - height
  }

  if (x < minX) {
    x = minX
    width = maxX - minX
  }

  if (y < minY) {
    y = minY
    height = maxY - minY
  }

  return { x, y, width, height }
}

function applyAspectRatio(rect: CropRectPx, aspect: number, handle: CropHandle): CropRectPx {
  let { x, y, width, height } = rect
  const right = x + width
  const bottom = y + height

  if (handle === 'e' || handle === 'w') {
    height = width / aspect
  } else if (handle === 'n' || handle === 's') {
    width = height * aspect
  } else {
    height = width / aspect
  }

  if (handle.includes('w')) {
    x = right - width
  }

  if (handle.includes('n')) {
    y = bottom - height
  }

  return { x, y, width, height }
}

export function resizeCropRect(
  startRect: CropRectPx,
  handle: CropHandle,
  pointerX: number,
  pointerY: number,
  layout: ImageLayout,
  aspectRatio: number | null
): CropRectPx {
  const minSize = Math.min(layout.displayWidth, layout.displayHeight) * MIN_CROP_FRACTION

  let { x, y, width, height } = startRect
  const right = x + width
  const bottom = y + height

  if (handle.includes('e')) {
    width = Math.max(minSize, pointerX - x)
  }

  if (handle.includes('w')) {
    const nextX = Math.min(pointerX, right - minSize)
    width = right - nextX
    x = nextX
  }

  if (handle.includes('s')) {
    height = Math.max(minSize, pointerY - y)
  }

  if (handle.includes('n')) {
    const nextY = Math.min(pointerY, bottom - minSize)
    height = bottom - nextY
    y = nextY
  }

  let next = clampRectToImage({ x, y, width, height }, layout)

  if (aspectRatio && aspectRatio > 0 && handle !== 'move') {
    next = applyAspectRatio(next, aspectRatio, handle)
    next = clampRectToImage(next, layout)
  }

  return next
}

export function moveCropRect(startRect: CropRectPx, deltaX: number, deltaY: number, layout: ImageLayout): CropRectPx {
  return clampRectToImage(
    {
      x: startRect.x + deltaX,
      y: startRect.y + deltaY,
      width: startRect.width,
      height: startRect.height
    },
    layout
  )
}

export function getAspectRatioValue(preset: 'free' | '1:1' | '16:9' | '4:3'): number | null {
  if (preset === 'free') {
    return null
  }

  if (preset === '1:1') {
    return 1
  }

  if (preset === '16:9') {
    return 16 / 9
  }

  return 4 / 3
}

export function fitCropToAspect(crop: ImageCropSettings, aspect: number, layout: ImageLayout): ImageCropSettings {
  const rect = cropToRectPx(crop, layout)
  const fitted = clampRectToImage(applyAspectRatio(rect, aspect, 'se'), layout)

  return rectPxToCrop(fitted, layout)
}

/** Map viewport pointer coordinates to container-local pixels. */
export function pointerToContainerCoords(
  clientX: number,
  clientY: number,
  containerRect: DOMRect
): { x: number; y: number } {
  return {
    x: clientX - containerRect.left,
    y: clientY - containerRect.top
  }
}
