'use client'

import { useEffect, useState } from 'react'

/** Matches FlowShorts-style floating chrome — engage shortly after leave-top. */
const SCROLL_THRESHOLD_PX = 24

function getScrollTop(target: HTMLElement | Window): number {
  if (target === window) {
    return window.scrollY || document.documentElement.scrollTop || 0
  }

  return (target as HTMLElement).scrollTop
}

function findScrollParent(el: HTMLElement | null): HTMLElement | Window {
  let node = el?.parentElement ?? null

  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node)

    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node
    }

    node = node.parentElement
  }

  return window
}

/**
 * Tracks whether sticky header/footer chrome should enter its compact floating state.
 * Listens to the nearest scroll container (builder canvas or window on published sites).
 */
export function useStickyChromeScroll(enabled: boolean, shellEl: HTMLElement | null) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setScrolled(false)

      return
    }

    const scrollParent = findScrollParent(shellEl)

    const update = () => {
      setScrolled(getScrollTop(scrollParent) > SCROLL_THRESHOLD_PX)
    }

    update()
    scrollParent.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })

    return () => {
      scrollParent.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled, shellEl])

  return scrolled
}

/** @deprecated Use `useStickyChromeScroll` */
export const useStickyHeaderScroll = useStickyChromeScroll
