'use client'

import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useBuilderOptional } from '../context/BuilderContext'
import { useCanvasBlockEdit } from '../components/inline/CanvasBlockEditContext'
import {
  isAnchorHref,
  isExternalHref,
  navigateWithTransition,
  resolveInternalPageSlug,
  resolvePublicNavigationHref
} from '../utils/pageLinkHelpers'

function extractTenantSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/site\/([^/]+)/)

  return match?.[1] ?? null
}

function scrollToAnchor(anchor: string) {
  const id = anchor.replace(/^#/, '')

  if (!id) {
    return
  }

  const target = document.getElementById(id)

  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function scrollBuilderCanvasToTop() {
  const canvas = document.querySelector<HTMLElement>('[data-builder-canvas-scroll]')

  canvas?.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useSitePageNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const builder = useBuilderOptional()
  const editContext = useCanvasBlockEdit()
  const isCanvasEditing = Boolean(builder && builder.mode === 'edit' && editContext)

  const tenantSlug = builder?.tenantSlug ?? extractTenantSlugFromPathname(pathname ?? '') ?? ''
  const pages = builder?.pages ?? []

  const handleLinkClick = useCallback(
    (event: MouseEvent<HTMLElement>, href?: string) => {
      const trimmed = href?.trim() || '#'

      if (isCanvasEditing) {
        event.preventDefault()

        return
      }

      if (!trimmed || trimmed === '#') {
        event.preventDefault()

        return
      }

      if (isAnchorHref(trimmed)) {
        event.preventDefault()
        scrollToAnchor(trimmed)

        return
      }

      if (isExternalHref(trimmed)) {
        return
      }

      const pageSlug = resolveInternalPageSlug(trimmed, tenantSlug, pages)

      if (builder && pageSlug) {
        event.preventDefault()

        void navigateWithTransition(async () => {
          await builder.switchPage(pageSlug)
          scrollBuilderCanvasToTop()

          if (pathname?.startsWith('/your-space')) {
            const params = new URLSearchParams(window.location.search)

            params.set('p', pageSlug)
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
          }
        })

        return
      }

      const destination = resolvePublicNavigationHref(trimmed, tenantSlug, pages)

      if (destination === pathname) {
        event.preventDefault()

        return
      }

      event.preventDefault()

      void navigateWithTransition(() => {
        router.push(destination)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    },
    [builder, isCanvasEditing, pages, pathname, router, tenantSlug]
  )

  const resolveHref = useCallback(
    (href?: string) => {
      const trimmed = href?.trim() || '#'

      if (!trimmed || trimmed === '#' || isExternalHref(trimmed) || isAnchorHref(trimmed)) {
        return trimmed
      }

      return resolvePublicNavigationHref(trimmed, tenantSlug, pages)
    },
    [pages, tenantSlug]
  )

  return {
    handleLinkClick,
    resolveHref,
    isCanvasEditing,
    isExternalHref
  }
}
