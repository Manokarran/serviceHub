import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { isTenantApproved, isTenantWorkspaceOpen } from '@/lib/constants/tenant'
import { AppError } from '@/lib/errors'
import { tenantRepository } from '@/repositories'

import { getOrCreateBaseTemplateTenantId } from './base-template-tenant'

export type BuilderScope = 'organization' | 'base_template' | 'library_template'

type ResolvedBuilderTenant = {
  tenantId: string
  userId: string
  tenantApproved: boolean
}

export async function resolveBuilderTenant(scope: BuilderScope = 'organization'): Promise<ResolvedBuilderTenant> {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AppError('You must be signed in.', 401, 'UNAUTHORIZED')
  }

  if (scope === 'library_template') {
    throw new AppError('Library template edits use the template page APIs.', 400, 'INVALID_SCOPE')
  }

  if (scope === 'base_template') {
    if (!isSuperAdminEmail(session.user.email)) {
      throw new AppError('Super admin access required.', 403, 'FORBIDDEN')
    }

    const tenantId = await getOrCreateBaseTemplateTenantId()

    return { tenantId, userId: session.user.id, tenantApproved: true }
  }

  if (!session.user.tenantId) {
    throw new AppError('You must be signed in with an organization.', 401, 'UNAUTHORIZED')
  }

  const tenant = await tenantRepository.findById(session.user.tenantId)

  if (!tenant || !isTenantWorkspaceOpen(tenant.approvalStatus, tenant.createdAt)) {
    throw new AppError(
      'Your organization access was declined. Contact support if you believe this is a mistake.',
      403,
      'TENANT_REJECTED'
    )
  }

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    tenantApproved: isTenantApproved(tenant.approvalStatus, tenant.createdAt)
  }
}

export async function requireLibraryTemplateEditor(): Promise<{ userId: string }> {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AppError('You must be signed in.', 401, 'UNAUTHORIZED')
  }

  if (!isSuperAdminEmail(session.user.email)) {
    throw new AppError('Super admin access required.', 403, 'FORBIDDEN')
  }

  return { userId: session.user.id }
}
