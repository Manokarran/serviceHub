'use client'

import { useEffect, useState } from 'react'

import { prefetchCachedMedia, releaseCachedMediaUrl, resolveCachedMediaUrl } from '@/lib/media/media-cache'

export function useCachedMediaUrl(sourceUrl: string | null | undefined): string | null {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(sourceUrl ?? null)

  useEffect(() => {
    if (!sourceUrl) {
      setResolvedUrl(null)

      return
    }

    let cancelled = false
    let localResolved = sourceUrl

    setResolvedUrl(sourceUrl)

    void resolveCachedMediaUrl(sourceUrl)
      .then(cachedUrl => {
        if (cancelled) {
          releaseCachedMediaUrl(sourceUrl, cachedUrl)

          return
        }

        localResolved = cachedUrl
        setResolvedUrl(cachedUrl)
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedUrl(sourceUrl)
        }
      })

    return () => {
      cancelled = true
      releaseCachedMediaUrl(sourceUrl, localResolved)
    }
  }, [sourceUrl])

  return resolvedUrl
}

export { prefetchCachedMedia }
