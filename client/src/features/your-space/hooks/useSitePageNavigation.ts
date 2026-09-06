'use client'

import { useCallback } from 'react'
import type { MouseEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useBuilderOptional } from '../context/BuilderContext'
import { useCanvasBlockEdit } from '../components/inline/CanvasBlockEditContext'
import { getPublicPagePath, toHostAwarePublicPath } from '@/lib/utils/public-site-url'
import { extractTenantSlugFromHostname } from '@/lib/utils/tenant-host'
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

function isBuilderWorkspacePath(pathname: string | null): boolean {
  if (!pathname) {
    return false
  }

  return (
    pathname.startsWith('/your-space') ||
    pathname.startsWith('/super-admin/studio/builder') ||
    pathname.includes('/super-admin/templates/')
  )
}

/** Don't hijack clicks that are meant to edit link labels inline. */
function isInlineEditingClick(event: MouseEvent<HTMLElement>): boolean {
  const target = event.target as HTMLElement | null

  if (!target) {
    return false
  }

  return Boolean(
    target.closest('input, textarea, [contenteditable="true"]') ||
      target.closest('[data-inline-editing="true"]')
  )
}

export function useSitePageNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const builder = useBuilderOptional()
  const editContext = useCanvasBlockEdit()
  const isCanvasEditing = Boolean(builder && builder.mode === 'edit' && editContext)
  const inBuilderWorkspace = Boolean(builder) || isBuilderWorkspacePath(pathname)

  const tenantSlug =
    builder?.tenantSlug ??
    extractTenantSlugFromPathname(pathname ?? '') ??
    (typeof window !== 'undefined' ? extractTenantSlugFromHostname(window.location.host) : null) ??
    ''
  const pages = builder?.pages ?? []

  const switchBuilderPage = useCallback(
    async (pageSlug: string) => {
      if (!builder) {
        return
      }

      await navigateWithTransition(async () => {
        await builder.switchPage(pageSlug)
        scrollBuilderCanvasToTop()

        if (isBuilderWorkspacePath(pathname)) {
          const params = new URLSearchParams(window.location.search)

          params.set('p', pageSlug)
          router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        }
      })
    },
    [builder, pathname, router]
  )

  const handleLinkClick = useCallback(
    (event: MouseEvent<HTMLElement>, href?: string) => {
      const trimmed = href?.trim() || '#'

      if (isInlineEditingClick(event)) {
        event.preventDefault()

        return
      }

      if (!trimmed || trimmed === '#') {
        event.preventDefault()

        return
      }

      // Prefer in-builder page switches for hash links like "#about" when that page exists.
      const pageSlug = resolveInternalPageSlug(trimmed, tenantSlug, pages)

      if (builder && pageSlug) {
        event.preventDefault()
        void switchBuilderPage(pageSlug)

        return
      }

      if (isExternalHref(trimmed)) {
        // Keep editors from leaving the builder via accidental external nav.
        if (inBuilderWorkspace && builder?.mode === 'edit') {
          event.preventDefault()
        }

        return
      }

      // Inside the builder workspace, never fall through to public /site URLs
      // (those often redirect to app home for unapproved tenants).
      if (inBuilderWorkspace) {
        if (isAnchorHref(trimmed) && !pageSlug) {
          event.preventDefault()
          scrollToAnchor(trimmed)

          return
        }

        event.preventDefault()

        return
      }

      // Live public site: "#about" / "about" / "/about" → /site/{tenant}/about
      if (pageSlug && tenantSlug) {
        const destination = toHostAwarePublicPath(getPublicPagePath(tenantSlug, pageSlug), tenantSlug)

        if (destination === pathname) {
          event.preventDefault()

          return
        }

        event.preventDefault()

        void navigateWithTransition(() => {
          router.push(destination)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        })

        return
      }

      if (isAnchorHref(trimmed)) {
        event.preventDefault()
        scrollToAnchor(trimmed)

        return
      }

      const destination = toHostAwarePublicPath(
        resolvePublicNavigationHref(trimmed, tenantSlug, pages),
        tenantSlug
      )

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
    [builder, inBuilderWorkspace, pages, pathname, router, switchBuilderPage, tenantSlug]
  )

  const resolveHref = useCallback(
    (href?: string) => {
      const trimmed = href?.trim() || '#'

      if (!trimmed || trimmed === '#' || isExternalHref(trimmed)) {
        return trimmed
      }

      // Keep builder anchors inert for middle-click / open-in-new-tab while editing.
      if (inBuilderWorkspace && builder) {
        const pageSlug = resolveInternalPageSlug(trimmed, tenantSlug, pages)

        if (pageSlug) {
          return `#page/${pageSlug}`
        }

        return isAnchorHref(trimmed) ? trimmed : '#'
      }

      // Live site: resolve "#about" / "about" to the real public path (keeps /site/{tenant} on www).
      if (tenantSlug) {
        const pageSlug = resolveInternalPageSlug(trimmed, tenantSlug, pages)

        if (pageSlug) {
          return toHostAwarePublicPath(getPublicPagePath(tenantSlug, pageSlug), tenantSlug)
        }
      }

      if (isAnchorHref(trimmed)) {
        return trimmed
      }

      return toHostAwarePublicPath(resolvePublicNavigationHref(trimmed, tenantSlug, pages), tenantSlug)
    },
    [builder, inBuilderWorkspace, pages, tenantSlug]
  )

  return {
    handleLinkClick,
    resolveHref,
    isCanvasEditing,
    isExternalHref
  }
}
