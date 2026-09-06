import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isTenantApproved, isTenantWorkspaceOpen } from '@/lib/constants/tenant'
import { tenantRepository } from '@/repositories'

/**
 * Redirects to /home unless the user's tenant workspace is open (pending or approved).
 * Rejected orgs stay on Home with a locked message.
 */
export async function requireOpenTenantOrRedirect() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete || !session.user.tenantId) {
    redirect('/register')
  }

  const tenant = await tenantRepository.findById(session.user.tenantId)

  if (!tenant || !isTenantWorkspaceOpen(tenant.approvalStatus, tenant.createdAt)) {
    redirect('/home')
  }

  return {
    session,
    tenant,
    tenantApproved: isTenantApproved(tenant.approvalStatus, tenant.createdAt)
  }
}

/**
 * @deprecated Prefer requireOpenTenantOrRedirect — pending tenants may use the workspace.
 * Kept for publish-only flows that still need full approval.
 */
export async function requireApprovedTenantOrRedirect() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete || !session.user.tenantId) {
    redirect('/register')
  }

  const tenant = await tenantRepository.findById(session.user.tenantId)

  if (!tenant || !isTenantApproved(tenant.approvalStatus, tenant.createdAt)) {
    redirect('/home')
  }

  return { session, tenant }
}
