export const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, '') ?? ''

export function isImageKitConfigured(): boolean {
  const hasPublicConfig = Boolean(
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.trim() && IMAGEKIT_URL_ENDPOINT
  )

  if (typeof window !== 'undefined') {
    return hasPublicConfig
  }

  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY?.trim() && hasPublicConfig)
}

export function isImageKitUrl(url: string): boolean {
  if (!IMAGEKIT_URL_ENDPOINT || !url) {
    return false
  }

  try {
    return new URL(url).hostname === new URL(IMAGEKIT_URL_ENDPOINT).hostname
  } catch {
    return url.startsWith(IMAGEKIT_URL_ENDPOINT)
  }
}
