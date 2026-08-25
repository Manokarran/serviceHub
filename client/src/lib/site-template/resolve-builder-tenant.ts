import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { AppError } from '@/lib/errors'

import { getOrCreateBaseTemplateTenantId } from './base-template-tenant'

export type BuilderScope = 'organization' | 'base_template' | 'library_template'

type ResolvedBuilderTenant = {
  tenantId: string
  userId: string
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

    return { tenantId, userId: session.user.id }
  }

  if (!session.user.tenantId) {
    throw new AppError('You must be signed in with an organization.', 401, 'UNAUTHORIZED')
  }

  return { tenantId: session.user.tenantId, userId: session.user.id }
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
