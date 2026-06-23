import { isHomePageSlug } from '@/lib/utils/page-slug'

/**
 * Public customer-facing site path for the home page: /site/{tenantSlug}
 */
export function getPublicSitePath(tenantSlug: string): string {
  return `/site/${tenantSlug}`
}

/**
 * Public path for any page. Home resolves to the tenant root (no /home segment).
 */
export function getPublicPagePath(tenantSlug: string, pageSlug: string): string {
  if (isHomePageSlug(pageSlug)) {
    return getPublicSitePath(tenantSlug)
  }

  return `${getPublicSitePath(tenantSlug)}/${pageSlug}`
}

function resolveAppBase(): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const basePath = (process.env.BASEPATH ?? '').replace(/\/$/, '')

  return `${base}${basePath}`
}

/**
 * Full public site URL for server components and emails.
 */
export function getPublicSiteUrl(tenantSlug: string): string {
  return `${resolveAppBase()}${getPublicSitePath(tenantSlug)}`
}

/**
 * Full public URL for a specific page.
 */
export function getPublicPageUrl(tenantSlug: string, pageSlug: string): string {
  return `${resolveAppBase()}${getPublicPagePath(tenantSlug, pageSlug)}`
}

/**
 * Display-friendly URL without protocol (for UI labels).
 */
export function getPublicSiteDisplayUrl(tenantSlug: string): string {
  return getPublicSiteUrl(tenantSlug).replace(/^https?:\/\//, '')
}

/**
 * Display-friendly page URL without protocol.
 */
export function getPublicPageDisplayUrl(tenantSlug: string, pageSlug: string): string {
  return getPublicPageUrl(tenantSlug, pageSlug).replace(/^https?:\/\//, '')
}
