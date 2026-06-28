import { IMAGEKIT_URL_ENDPOINT, isImageKitUrl } from './config'

type ImageTransformOptions = {
  width?: number
  height?: number
  quality?: number
  /** When true, request 2× pixel density for retina displays. */
  retina?: boolean
}

/** Default delivery quality — higher than storage compression for crisp rendering. */
const DEFAULT_DISPLAY_QUALITY = 92
const DEFAULT_MAX_DELIVERY_WIDTH = 2560

type VideoTransformOptions = {
  width?: number
  height?: number
  quality?: number
}

function appendTransform(url: string, transform: string): string {
  try {
    const parsed = new URL(url)

    parsed.searchParams.set('tr', transform)

    return parsed.toString()
  } catch {
    return url
  }
}

/** Delivery URL — high-quality transform from the stored original, CDN cached. */
export function getOptimizedImageUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!url || !isImageKitUrl(url)) {
    return url
  }

  const width = options.width ?? DEFAULT_MAX_DELIVERY_WIDTH
  const height = options.height ?? DEFAULT_MAX_DELIVERY_WIDTH
  const quality = options.quality ?? DEFAULT_DISPLAY_QUALITY
  const dpr = options.retina ? ',dpr-2' : ''

  return appendTransform(url, `w-${width},h-${height},c-at_max,q-${quality},f-auto,lo-true,cm-exif${dpr}`)
}

/**
 * Delivery URL sized for a known display width — requests 2× pixels for retina by default.
 */
export function getDisplayImageUrl(
  url: string,
  displayWidth: number,
  options: Omit<ImageTransformOptions, 'width' | 'height' | 'retina'> = {}
): string {
  const deliveryWidth = Math.min(Math.round(displayWidth * 2), DEFAULT_MAX_DELIVERY_WIDTH)

  return getOptimizedImageUrl(url, {
    width: deliveryWidth,
    height: deliveryWidth,
    quality: options.quality ?? DEFAULT_DISPLAY_QUALITY
  })
}

/** Delivery URL — 1080p max, H.264, reduced quality for bandwidth/storage savings. */
export function getOptimizedVideoUrl(url: string, options: VideoTransformOptions = {}): string {
  if (!url || !isImageKitUrl(url)) {
    return url
  }

  const width = options.width ?? 1920
  const height = options.height ?? 1080
  const quality = options.quality ?? 50

  return appendTransform(url, `w-${width},h-${height},c-at_max,q-${quality},vc-h264,ac-none`)
}

export function getImageKitThumbnailUrl(url: string, size = 240): string {
  if (!url || !isImageKitUrl(url)) {
    return url
  }

  return appendTransform(url, `w-${size},h-${size},c-at_max,q-70,f-auto`)
}

export function buildImageKitFolder(tenantId: string, mediaType: 'image' | 'video'): string {
  return `/servicehub/${tenantId}/backgrounds/${mediaType}`
}

export function buildPlatformTemplateThumbnailFolder(): string {
  return '/servicehub/platform/templates/thumbnails'
}

export { IMAGEKIT_URL_ENDPOINT }
