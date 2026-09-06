import { isHomePageSlug } from '@/lib/utils/page-slug'
import {
  getAppOrigin,
  getRootDomain,
  isPublicSiteHost,
  isSubdomainRoutingEnabled
} from '@/lib/utils/tenant-host'

/**
 * Internal / app-host path for a tenant home page: /site/{tenantSlug}
 * Still used for rewrites, preview on the app host, and stored block hrefs.
 */
export function getPublicSitePath(tenantSlug: string): string {
  return `/site/${tenantSlug}`
}

/**
 * Internal path for any page. Home resolves to the tenant root (no /home segment).
 */
export function getPublicPagePath(tenantSlug: string, pageSlug: string): string {
  if (isHomePageSlug(pageSlug)) {
    return getPublicSitePath(tenantSlug)
  }

  return `${getPublicSitePath(tenantSlug)}/${pageSlug}`
}

/**
 * Path as seen on a tenant subdomain (/, /about, /book).
 */
export function getTenantSubdomainPath(pageSlug: string): string {
  if (isHomePageSlug(pageSlug)) {
    return '/'
  }

  return `/${pageSlug}`
}

/**
 * Prefix/suffix around the editable slug in profile UI.
 * Subdomain mode: dream.sidhiyana.com → prefix "", suffix ".sidhiyana.com"
 * Path mode: localhost:3000/site/dream → prefix "localhost:3000/site/", suffix ""
 */
export function getPublicSiteSlugAffixes(): { prefix: string; suffix: string } {
  const root = getRootDomain()

  if (root) {
    return { prefix: '', suffix: `.${root}` }
  }

  const base = getAppOrigin().replace(/^https?:\/\//, '').replace(/\/$/, '')
  const basePath = (process.env.BASEPATH ?? '').replace(/\/$/, '')

  return { prefix: `${base}${basePath}/site/`, suffix: '' }
}

/**
 * Full public site URL (subdomain when ROOT_DOMAIN is set).
 */
export function getPublicSiteUrl(tenantSlug: string): string {
  const root = getRootDomain()

  if (root) {
    const protocol = getAppOrigin().startsWith('http://') ? 'http' : 'https'

    return `${protocol}://${tenantSlug}.${root}`
  }

  const basePath = (process.env.BASEPATH ?? '').replace(/\/$/, '')

  return `${getAppOrigin()}${basePath}${getPublicSitePath(tenantSlug)}`
}

/**
 * Full public URL for a specific page.
 */
export function getPublicPageUrl(tenantSlug: string, pageSlug: string): string {
  const root = getRootDomain()

  if (root) {
    const path = getTenantSubdomainPath(pageSlug)

    return path === '/' ? getPublicSiteUrl(tenantSlug) : `${getPublicSiteUrl(tenantSlug)}${path}`
  }

  const basePath = (process.env.BASEPATH ?? '').replace(/\/$/, '')

  return `${getAppOrigin()}${basePath}${getPublicPagePath(tenantSlug, pageSlug)}`
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

/**
 * Href for opening the live site from the dashboard (always absolute when subdomain routing is on).
 */
export function getPublicSiteHref(tenantSlug: string): string {
  return getPublicSiteUrl(tenantSlug)
}

export function getPublicPageHref(tenantSlug: string, pageSlug: string): string {
  return getPublicPageUrl(tenantSlug, pageSlug)
}

/**
 * Convert an internal /site/{slug}/... path to the host-aware public path.
 */
export function toHostAwarePublicPath(
  path: string,
  tenantSlug: string,
  hostHeader?: string | null
): string {
  if (!isSubdomainRoutingEnabled()) {
    return path
  }

  // On the server without a host, keep internal paths.
  if (hostHeader === undefined && typeof window === 'undefined') {
    return path
  }

  const host = hostHeader ?? (typeof window !== 'undefined' ? window.location.host : null)

  if (!host || !isPublicSiteHost(host)) {
    return path
  }

  const prefix = getPublicSitePath(tenantSlug)

  if (path === prefix || path === `${prefix}/`) {
    return '/'
  }

  if (path.startsWith(`${prefix}/`)) {
    return path.slice(prefix.length) || '/'
  }

  return path
}
