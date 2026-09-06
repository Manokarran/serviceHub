'use client'

import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { extractTenantSlugFromHostname, isPublicSiteHost } from '@/lib/utils/tenant-host'
import { isHomePageSlug } from '@/lib/utils/page-slug'

const VISITOR_STORAGE_KEY = 'sh.pub.vid'
const VIEW_LOCK_PREFIX = 'sh.pub.viewlock'
const CLICK_LOCK_KEY = 'sh.pub.clicklock'
const VIEW_LOCK_MS = 4000
const CLICK_LOCK_MS = 1200

function readPublicSiteContext(pathname: string | null): { tenantSlug: string; pageSlug: string } | null {
  const pathMatch = pathname?.match(/^\/site\/([^/]+)(?:\/([^/]+))?/)

  if (pathMatch?.[1]) {
    return {
      tenantSlug: pathMatch[1],
      pageSlug: pathMatch[2] || 'home'
    }
  }

  if (typeof window === 'undefined' || !isPublicSiteHost(window.location.host)) {
    return null
  }

  const tenantSlug = extractTenantSlugFromHostname(window.location.host)

  if (!tenantSlug) {
    return null
  }

  const segment = pathname?.replace(/^\//, '').split('/')[0] || 'home'

  return {
    tenantSlug,
    pageSlug: isHomePageSlug(segment) || !segment ? 'home' : segment
  }
}

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY)

    if (existing && existing.length >= 8) {
      return existing
    }

    const created = crypto.randomUUID()

    window.localStorage.setItem(VISITOR_STORAGE_KEY, created)

    return created
  } catch {
    return `tmp-${Math.random().toString(36).slice(2, 12)}`
  }
}

function recentlyLocked(key: string, windowMs: number): boolean {
  try {
    const raw = window.sessionStorage.getItem(key)
    const last = raw ? Number(raw) : 0

    if (last && Date.now() - last < windowMs) {
      return true
    }

    window.sessionStorage.setItem(key, String(Date.now()))

    return false
  } catch {
    return false
  }
}

function sendEvent(payload: { tenantSlug: string; visitorId: string; type: 'view' | 'click'; pageSlug: string }) {
  void fetch('/api/public/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => undefined)
}

function isContentClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  const actionable = target.closest('a, button, [role="button"]')

  if (!(actionable instanceof HTMLElement)) {
    return false
  }

  if (actionable.closest('header, footer, nav, [role="navigation"], [data-site-analytics="ignore"]')) {
    return false
  }

  if (actionable.closest('[role="tablist"], [role="tab"]')) {
    return false
  }

  if (actionable instanceof HTMLButtonElement && actionable.type === 'submit') {
    return false
  }

  if (actionable instanceof HTMLAnchorElement) {
    const href = actionable.getAttribute('href') || ''

    if (!href || href === '#' || href.startsWith('#')) {
      return false
    }
  }

  return true
}

export function PublicSiteAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    if (window.self !== window.top) {
      return undefined
    }

    const context = readPublicSiteContext(pathname)

    if (!context) {
      return undefined
    }

    const visitorId = getVisitorId()
    const viewLockKey = `${VIEW_LOCK_PREFIX}:${context.tenantSlug}:${context.pageSlug}`

    if (!recentlyLocked(viewLockKey, VIEW_LOCK_MS)) {
      sendEvent({
        tenantSlug: context.tenantSlug,
        visitorId,
        type: 'view',
        pageSlug: context.pageSlug
      })
    }

    const onClick = (event: MouseEvent) => {
      if (!isContentClick(event.target)) {
        return
      }

      if (recentlyLocked(CLICK_LOCK_KEY, CLICK_LOCK_MS)) {
        return
      }

      sendEvent({
        tenantSlug: context.tenantSlug,
        visitorId,
        type: 'click',
        pageSlug: context.pageSlug
      })
    }

    document.addEventListener('click', onClick, true)

    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [pathname])

  return null
}
