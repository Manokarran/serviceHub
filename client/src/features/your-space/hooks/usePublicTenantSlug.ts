'use client'

import { usePathname } from 'next/navigation'

import { useBuilderOptional } from '../context/BuilderContext'
import { extractTenantSlugFromHostname } from '@/lib/utils/tenant-host'

function extractTenantSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/site\/([^/]+)/)

  return match?.[1] ?? null
}

export function usePublicTenantSlug(): string {
  const pathname = usePathname()
  const builder = useBuilderOptional()

  if (builder?.tenantSlug) {
    return builder.tenantSlug
  }

  const fromPath = extractTenantSlugFromPathname(pathname ?? '')

  if (fromPath) {
    return fromPath
  }

  if (typeof window !== 'undefined') {
    return extractTenantSlugFromHostname(window.location.host) ?? ''
  }

  return ''
}
