import type { UnsplashPhoto, UnsplashSearchResult } from './types'

const PHOTOS_PER_PAGE = 9

function getUnsplashKey(): string {
  return process.env.NEXT_PUBLIC_UNSPLASH_KEY ?? ''
}

export function isUnsplashConfigured(): boolean {
  return Boolean(getUnsplashKey())
}

export async function searchUnsplashPhotos(params: {
  query: string
  page?: number
  perPage?: number
  orientation?: 'landscape' | 'portrait' | 'squarish'
}): Promise<UnsplashSearchResult> {
  const key = getUnsplashKey()

  if (!key) {
    throw new Error('Unsplash API key is not configured.')
  }

  const searchParams = new URLSearchParams({
    query: params.query,
    page: String(params.page ?? 1),
    per_page: String(params.perPage ?? PHOTOS_PER_PAGE)
  })

  if (params.orientation) {
    searchParams.set('orientation', params.orientation)
  }

  const response = await fetch(`https://api.unsplash.com/search/photos?${searchParams.toString()}`, {
    headers: { Authorization: `Client-ID ${key}` }
  })

  if (!response.ok) {
    throw new Error('Failed to load photos from Unsplash.')
  }

  const data = (await response.json()) as { results: UnsplashPhoto[]; total_pages: number }

  return {
    results: data.results ?? [],
    totalPages: data.total_pages ?? 0
  }
}

/** Required by Unsplash API guidelines when a user selects a photo. */
export async function trackUnsplashDownload(photo: UnsplashPhoto): Promise<void> {
  const key = getUnsplashKey()

  if (!key || !photo.links.download_location) {
    return
  }

  try {
    await fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${key}` }
    })
  } catch {
    // Non-blocking — selection should still work if tracking fails.
  }
}

export function getUnsplashPhotoAlt(photo: UnsplashPhoto): string | undefined {
  const alt = photo.alt_description?.trim() || photo.description?.trim()

  return alt || undefined
}

export function isUnsplashPhotoSelected(photo: UnsplashPhoto, value?: string): boolean {
  if (!value) {
    return false
  }

  return value.includes(photo.urls.regular) || value.includes(photo.urls.thumb)
}

export const UNSPLASH_PHOTOS_PER_PAGE = PHOTOS_PER_PAGE
