import { isReservedTenantSlug } from '@/lib/utils/tenant-slug'

/** Apex / product hosts that must never resolve as a tenant subdomain. */
const RESERVED_HOST_LABELS = new Set([
  'www',
  'app',
  'api',
  'admin',
  'static',
  'assets',
  'cdn',
  'mail',
  'status'
])

export type TenantHostResolution =
  | { type: 'app' }
  | { type: 'tenant'; tenantSlug: string }
  | { type: 'platform'; tenantSlug: string }
  | { type: 'unknown' }

export function getRootDomain(): string {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '').trim().toLowerCase().replace(/^\.+|\.+$/g, '')
}

/** Subdomain that hosts login, register, and the dashboard (default: app). */
export function getAppSubdomain(): string {
  const value = (process.env.NEXT_PUBLIC_APP_SUBDOMAIN ?? 'app').trim().toLowerCase()

  return value || 'app'
}

/**
 * When set, apex + www serve this published tenant (marketing site built in the builder).
 * Leave empty while www still hosts the product.
 */
export function getPlatformSiteSlug(): string {
  return (process.env.NEXT_PUBLIC_PLATFORM_SITE_SLUG ?? '').trim().toLowerCase()
}

export function isSubdomainRoutingEnabled(): boolean {
  return Boolean(getRootDomain())
}

export function getAppOrigin(): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim().replace(/\/$/, '')

  if (configured) {
    return configured
  }

  const root = getRootDomain()

  if (root) {
    return `https://${getAppSubdomain()}.${root}`
  }

  return 'http://localhost:3000'
}

function stripPort(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, '')
}

function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local')
  )
}

function isVercelDeploymentHost(hostname: string): boolean {
  return hostname.endsWith('.vercel.app')
}

/**
 * Classify a request Host header for multi-tenant subdomain routing.
 * When NEXT_PUBLIC_ROOT_DOMAIN is unset, every host is treated as the app (path-based /site/{slug}).
 */
export function resolveTenantHost(hostHeader: string | null | undefined): TenantHostResolution {
  const root = getRootDomain()
  const hostname = stripPort(hostHeader ?? '')

  if (!hostname) {
    return { type: 'unknown' }
  }

  if (!root) {
    return { type: 'app' }
  }

  if (isVercelDeploymentHost(hostname) || (isLocalDevHost(hostname) && hostname === 'localhost')) {
    return { type: 'app' }
  }

  if (hostname === root) {
    const platformSlug = getPlatformSiteSlug()

    if (platformSlug) {
      return { type: 'platform', tenantSlug: platformSlug }
    }

    return { type: 'app' }
  }

  if (!hostname.endsWith(`.${root}`)) {
    return { type: 'unknown' }
  }

  const label = hostname.slice(0, -(root.length + 1))

  if (!label || label.includes('.')) {
    // Nested subdomains (a.b.root) are not supported as tenants.
    return { type: 'unknown' }
  }

  if (label === getAppSubdomain()) {
    return { type: 'app' }
  }

  if (label === 'www') {
    const platformSlug = getPlatformSiteSlug()

    if (platformSlug) {
      return { type: 'platform', tenantSlug: platformSlug }
    }

    return { type: 'app' }
  }

  if (RESERVED_HOST_LABELS.has(label) || isReservedTenantSlug(label)) {
    return { type: 'app' }
  }

  return { type: 'tenant', tenantSlug: label }
}

export function extractTenantSlugFromHostname(hostHeader: string | null | undefined): string | null {
  const resolved = resolveTenantHost(hostHeader)

  if (resolved.type === 'tenant' || resolved.type === 'platform') {
    return resolved.tenantSlug
  }

  return null
}

export function isPublicSiteHost(hostHeader: string | null | undefined): boolean {
  const type = resolveTenantHost(hostHeader).type

  return type === 'tenant' || type === 'platform'
}
