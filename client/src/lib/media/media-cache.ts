const CACHE_NAME = 'servicehub-media-v1'
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

type CacheEntry = {
  blobUrl: string
  cachedAt: number
}

const memoryCache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<string>>()

function isCacheSupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window
}

function isEntryFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.cachedAt < CACHE_MAX_AGE_MS
}

async function fetchAndStore(url: string): Promise<string> {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' })

  if (!response.ok) {
    throw new Error(`Failed to fetch media (${response.status})`)
  }

  const blob = await response.blob()

  if (isCacheSupported()) {
    try {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(url, new Response(blob.slice(), { headers: response.headers }))
    } catch {
      // Cache API failures should not block rendering.
    }
  }

  const blobUrl = URL.createObjectURL(blob)
  memoryCache.set(url, { blobUrl, cachedAt: Date.now() })

  return blobUrl
}

/** Resolve a media URL from memory/Cache API, prefetching on first access. */
export async function resolveCachedMediaUrl(sourceUrl: string): Promise<string> {
  if (!sourceUrl || typeof window === 'undefined') {
    return sourceUrl
  }

  const cached = memoryCache.get(sourceUrl)

  if (cached && isEntryFresh(cached)) {
    return cached.blobUrl
  }

  if (cached) {
    URL.revokeObjectURL(cached.blobUrl)
    memoryCache.delete(sourceUrl)
  }

  const pending = inflight.get(sourceUrl)

  if (pending) {
    return pending
  }

  const task = (async () => {
    if (isCacheSupported()) {
      try {
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(sourceUrl)

        if (cachedResponse) {
          const blob = await cachedResponse.blob()
          const blobUrl = URL.createObjectURL(blob)
          memoryCache.set(sourceUrl, { blobUrl, cachedAt: Date.now() })

          return blobUrl
        }
      } catch {
        // Fall through to network fetch.
      }
    }

    return fetchAndStore(sourceUrl)
  })()

  inflight.set(sourceUrl, task)

  try {
    return await task
  } finally {
    inflight.delete(sourceUrl)
  }
}

export function prefetchCachedMedia(sourceUrl: string | null | undefined): void {
  if (!sourceUrl || typeof window === 'undefined') {
    return
  }

  void resolveCachedMediaUrl(sourceUrl).catch(() => {
    // Prefetch is best-effort.
  })
}

export function releaseCachedMediaUrl(sourceUrl: string, resolvedUrl: string): void {
  if (resolvedUrl === sourceUrl) {
    return
  }

  URL.revokeObjectURL(resolvedUrl)

  const cached = memoryCache.get(sourceUrl)

  if (cached?.blobUrl === resolvedUrl) {
    memoryCache.delete(sourceUrl)
  }
}
