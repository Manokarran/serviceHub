import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { isTenantWorkspaceOpen } from '@/lib/constants/tenant'
import { tenantRepository } from '@/repositories'

/**
 * Ensures the signed-in staff user belongs to a workspace that is open
 * (pending or approved). Rejected tenants are blocked.
 */
export async function requireTenantWorkspace() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AppError('You must be signed in.', 401, 'UNAUTHORIZED')
  }

  if (session.user.context === 'customer') {
    throw new AppError('Staff access required.', 403, 'FORBIDDEN')
  }

  if (!session.user.registrationComplete || !session.user.tenantId) {
    throw new AppError('Complete registration first.', 403, 'REGISTRATION_INCOMPLETE')
  }

  const tenant = await tenantRepository.findById(session.user.tenantId)

  if (!tenant || !isTenantWorkspaceOpen(tenant.approvalStatus, tenant.createdAt)) {
    throw new AppError(
      'Your organization access was declined. Contact support if you believe this is a mistake.',
      403,
      'TENANT_REJECTED'
    )
  }

  return session
}
