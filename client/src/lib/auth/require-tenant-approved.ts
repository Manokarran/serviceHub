import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { isTenantApproved } from '@/lib/constants/tenant'
import { tenantRepository } from '@/repositories'

/**
 * Ensures the signed-in staff user belongs to an approved tenant (DB check).
 * Use for publish / live-site actions only — editing uses requireTenantWorkspace.
 */
export async function requireTenantApproved() {
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

  if (!tenant || !isTenantApproved(tenant.approvalStatus, tenant.createdAt)) {
    throw new AppError(
      'Publishing goes live after a super admin approves your organization. You can keep editing and previewing in the meantime.',
      403,
      'TENANT_NOT_APPROVED'
    )
  }

  return session
}
