import { IMAGEKIT_URL_ENDPOINT, isImageKitUrl } from './config'

type ImageTransformOptions = {
  width?: number
  height?: number
  quality?: number
}

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

/** Delivery URL — compressed WebP, max 1920px wide, long CDN cache. */
export function getOptimizedImageUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!url || !isImageKitUrl(url)) {
    return url
  }

  const width = options.width ?? 1920
  const height = options.height ?? 1080
  const quality = options.quality ?? 80

  return appendTransform(url, `w-${width},h-${height},c-at_max,q-${quality},f-auto,lo-true,cm-exif`)
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

export { IMAGEKIT_URL_ENDPOINT }
