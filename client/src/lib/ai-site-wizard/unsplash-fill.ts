import type {
  ImageContinuousAnimation,
  ImageEntranceAnimation,
  ImageHoverEffect
} from '@/features/your-space/types'
import { isUnsplashConfigured, searchUnsplashPhotos, trackUnsplashDownload } from '@/lib/unsplash/client'
import type { UnsplashColorFilter, UnsplashPhoto } from '@/lib/unsplash/types'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

import type { BlockMediaSlot, MediaFill } from './block-media'
import { hexDistance } from './color-harmony'
import { getPalette } from './design-catalog'
import { hashSeed, pickFromPool } from './variety'

/** Photo tone follows the generated palette so imagery and UI share a colour story. */
export function resolveUnsplashColorFilter(paletteId: string): UnsplashColorFilter | undefined {
  return getPalette(paletteId).unsplashColor
}

const ENTRANCE_POOLS: Record<AiSiteWizardProfile['animationLevel'], ImageEntranceAnimation[]> = {
  none: ['none'],
  subtle: ['none', 'fade-in', 'slide-up'],
  moderate: ['fade-in', 'slide-up', 'zoom-in', 'blur-in'],
  energetic: ['zoom-in', 'blur-in', 'flip-up', 'slide-up']
}

const CONTINUOUS_POOLS: Record<AiSiteWizardProfile['animationLevel'], ImageContinuousAnimation[]> = {
  none: ['none'],
  subtle: ['none', 'float'],
  moderate: ['none', 'float', 'pulse', 'breathe'],
  energetic: ['float', 'pulse', 'shimmer', 'swing', 'breathe']
}

const HOVER_POOLS: Record<AiSiteWizardProfile['animationLevel'], ImageHoverEffect[]> = {
  none: ['zoom'],
  subtle: ['zoom', 'fade', 'lift'],
  moderate: ['zoom', 'fade', 'lift', 'blur'],
  energetic: ['zoom', 'fade', 'lift', 'blur', 'grayscale']
}

export async function fillMediaSlotsFromUnsplash(
  profile: AiSiteWizardProfile,
  slots: BlockMediaSlot[],
  seed: string,
  options?: { color?: UnsplashColorFilter; accentHex?: string; keywords?: string[] }
): Promise<{ fills: Map<string, MediaFill>; used: number }> {
  const fills = new Map<string, MediaFill>()
  const limitedSlots = slots.slice(0, 12)

  if (!limitedSlots.length || !isUnsplashConfigured()) {
    return { fills, used: 0 }
  }

  const queries = [...(options?.keywords ?? []), `${profile.category} website photography`]
    .filter(query => query.trim().length > 2)
    .slice(0, 3)

  const collected: UnsplashPhoto[] = []

  const results = await Promise.all(
    queries.map(async (query, index) => {
      try {
        const page = (hashSeed(`${seed}:unsplash:${index}`) % 3) + 1

        return await searchUnsplashPhotos({
          query,
          page,
          perPage: 10,
          orientation: 'landscape',
          color: options?.color
        })
      } catch (error) {
        console.error('[fillMediaSlotsFromUnsplash]', query, error)

        return null
      }
    })
  )

  for (const result of results) {
    for (const photo of result?.results ?? []) {
      if (photo.urls.regular && !collected.some(entry => entry.id === photo.id)) {
        collected.push(photo)
      }
    }
  }

  if (!collected.length && options?.color) {
    const fallbackResults = await Promise.all(
      queries.map(async (query, index) => {
        try {
          const page = (hashSeed(`${seed}:unsplash:fallback:${index}`) % 3) + 1

          return await searchUnsplashPhotos({
            query,
            page,
            perPage: 10,
            orientation: 'landscape'
          })
        } catch (error) {
          console.error('[fillMediaSlotsFromUnsplash]', query, error)

          return null
        }
      })
    )

    for (const result of fallbackResults) {
      for (const photo of result?.results ?? []) {
        if (photo.urls.regular && !collected.some(entry => entry.id === photo.id)) {
          collected.push(photo)
        }
      }
    }
  }

  if (!collected.length) {
    return { fills, used: 0 }
  }

  const accentHex = options?.accentHex?.trim()

  const ranked = accentHex
    ? [...collected].sort(
        (left, right) => hexDistance(left.color ?? '', accentHex) - hexDistance(right.color ?? '', accentHex)
      )
    : collected

  const preferred = ranked.slice(0, Math.max(6, Math.ceil(ranked.length / 2)))
  const pool = preferred.length ? preferred : collected
  const tracked = new Set<string>()

  limitedSlots.forEach((slot, index) => {
    const photo = pickFromPool(pool, seed, `${slot.path}:${index}`)
    const hoverEffect = pickFromPool(HOVER_POOLS[profile.animationLevel], seed, `${slot.path}:hover`)

    fills.set(slot.path, {
      url: photo.urls.regular,
      alt: photo.alt_description?.trim() || `${profile.companyName} photography`,
      hoverEffect,
      entranceAnimation:
        slot.kind === 'image' || slot.kind === 'showcase'
          ? pickFromPool(ENTRANCE_POOLS[profile.animationLevel], seed, `${slot.path}:in`)
          : 'none',
      continuousAnimation:
        slot.kind === 'image'
          ? pickFromPool(CONTINUOUS_POOLS[profile.animationLevel], seed, `${slot.path}:loop`)
          : 'none'
    })

    if (!tracked.has(photo.id)) {
      tracked.add(photo.id)
      void trackUnsplashDownload(photo)
    }
  })

  return { fills, used: fills.size }
}
