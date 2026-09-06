import { BASE_TEMPLATE_TENANT_SLUG } from '@/lib/site-template/base-template-constants'

/** Tenant slugs that must never be claimed as a public site subdomain or `/site/{slug}` URL. */
export const RESERVED_TENANT_SLUGS = new Set([
  BASE_TEMPLATE_TENANT_SLUG,
  'www',
  'app',
  'api',
  'admin',
  'login',
  'register',
  'site',
  'static',
  'assets',
  'cdn',
  'mail',
  'help',
  'support',
  'status',
  'billing',
  'dashboard',
  'super-admin',
  'profile',
  'settings'
])

export function isReservedTenantSlug(slug: string): boolean {
  return RESERVED_TENANT_SLUGS.has(slug.toLowerCase())
}
