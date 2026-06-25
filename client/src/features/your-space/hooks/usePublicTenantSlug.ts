'use client'

import { usePathname } from 'next/navigation'

import { useBuilderOptional } from '../context/BuilderContext'

function extractTenantSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/site\/([^/]+)/)

  return match?.[1] ?? null
}

export function usePublicTenantSlug(): string {
  const pathname = usePathname()
  const builder = useBuilderOptional()

  return builder?.tenantSlug ?? extractTenantSlugFromPathname(pathname ?? '') ?? ''
}
