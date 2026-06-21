'use client'

import { useCallback, useEffect, useState } from 'react'

export function useBuilderFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleChange)

    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = useCallback(async (element: HTMLElement | null) => {
    if (!element) {
      return
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await element.requestFullscreen()
      }
    } catch {
      // Fullscreen may be blocked by browser policy
    }
  }, [])

  return { isFullscreen, toggleFullscreen }
}
