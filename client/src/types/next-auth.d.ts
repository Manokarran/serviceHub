import type { DefaultSession } from 'next-auth'

import type { UserRole } from '@/lib/constants/roles'
import type { TenantPlan } from '@/lib/constants/tenant'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      registrationComplete: boolean
      role?: UserRole
      tenantId?: string
      tenantName?: string
      tenantSlug?: string
      tenantPlan?: TenantPlan
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    registrationComplete?: boolean
    role?: UserRole
    tenantId?: string
    tenantName?: string
    tenantSlug?: string
    tenantPlan?: TenantPlan
  }
}
