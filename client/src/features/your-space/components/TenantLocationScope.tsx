'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { TenantLocation } from '@/lib/location/types'

const TenantLocationContext = createContext<TenantLocation | null>(null)

export function TenantLocationScope({
  location,
  children
}: {
  location: TenantLocation | null | undefined
  children: ReactNode
}) {
  return <TenantLocationContext.Provider value={location ?? null}>{children}</TenantLocationContext.Provider>
}

export function useTenantLocation() {
  return useContext(TenantLocationContext)
}
