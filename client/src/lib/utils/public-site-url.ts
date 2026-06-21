/**
 * Public customer-facing site path: /site/{tenantSlug}
 */
export function getPublicSitePath(tenantSlug: string): string {
  return `/site/${tenantSlug}`
}

/**
 * Full public site URL for server components and emails.
 */
export function getPublicSiteUrl(tenantSlug: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const basePath = (process.env.BASEPATH ?? '').replace(/\/$/, '')

  return `${base}${basePath}${getPublicSitePath(tenantSlug)}`
}

/**
 * Display-friendly URL without protocol (for UI labels).
 */
export function getPublicSiteDisplayUrl(tenantSlug: string): string {
  const full = getPublicSiteUrl(tenantSlug)

  return full.replace(/^https?:\/\//, '')
}
