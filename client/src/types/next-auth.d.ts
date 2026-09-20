import type { DefaultSession } from 'next-auth'

import type { UserRole } from '@/lib/constants/roles'
import type { TenantApprovalStatus, TenantPlan } from '@/lib/constants/tenant'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      googleId?: string
      registrationComplete: boolean
      role?: UserRole
      tenantId?: string
      tenantName?: string
      tenantSlug?: string
      tenantPlan?: TenantPlan
      /** True when a super admin has approved publishing (legacy tenants count as approved). */
      tenantApproved?: boolean
      tenantApprovalStatus?: TenantApprovalStatus
      /** False when rejected — pending orgs may still edit and preview. */
      tenantWorkspaceOpen?: boolean
      isSuperAdmin?: boolean
      context?: 'staff' | 'customer'
      customerId?: string
      /** Super admin is viewing the app as another staff user. */
      impersonating?: boolean
      impersonatedUserId?: string
      originalSuperAdminEmail?: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    googleId?: string
    registrationComplete?: boolean
    role?: UserRole
    tenantId?: string
    tenantName?: string
    tenantSlug?: string
    tenantPlan?: TenantPlan
    tenantApproved?: boolean
    tenantApprovalStatus?: TenantApprovalStatus
    tenantWorkspaceOpen?: boolean
    isSuperAdmin?: boolean
    context?: 'staff' | 'customer'
    customerId?: string
    impersonating?: boolean
    impersonatedUserId?: string
    originalSuperAdminId?: string
    originalSuperAdminEmail?: string
    originalSuperAdminName?: string
    originalSuperAdminImage?: string | null
    originalGoogleId?: string
  }
}
