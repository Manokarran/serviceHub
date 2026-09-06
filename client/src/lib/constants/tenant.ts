export const TENANT_STATUSES = ['trial', 'active', 'suspended'] as const

export type TenantStatus = (typeof TENANT_STATUSES)[number]

export const TENANT_PLANS = ['free', 'pro', 'enterprise'] as const

export type TenantPlan = (typeof TENANT_PLANS)[number]

export const TENANT_APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const

export type TenantApprovalStatus = (typeof TENANT_APPROVAL_STATUSES)[number]

/**
 * Cutoff for orgs created before the approval feature.
 * Docs without approvalStatus and created before this date are treated as approved.
 * Anything newer without an explicit status is NOT approved.
 */
export const TENANT_APPROVAL_FEATURE_STARTED_AT = new Date('2026-09-05T00:00:00.000Z')

/** True when the org may publish a live site (super-admin approved, or legacy). */
export function isTenantApproved(
  approvalStatus?: TenantApprovalStatus | null,
  createdAt?: Date | string | null
): boolean {
  if (approvalStatus === 'approved') {
    return true
  }

  if (approvalStatus === 'pending' || approvalStatus === 'rejected') {
    return false
  }

  // Legacy: missing field on pre-feature tenants only
  if (createdAt) {
    const created = createdAt instanceof Date ? createdAt : new Date(createdAt)

    if (!Number.isNaN(created.getTime()) && created < TENANT_APPROVAL_FEATURE_STARTED_AT) {
      return true
    }
  }

  return false
}

/**
 * Pending orgs can edit, preview, use AI credits, and manage services.
 * Rejected orgs stay locked out of the workspace.
 */
export function isTenantWorkspaceOpen(
  approvalStatus?: TenantApprovalStatus | null,
  createdAt?: Date | string | null
): boolean {
  if (approvalStatus === 'rejected') {
    return false
  }

  if (approvalStatus === 'pending' || approvalStatus === 'approved') {
    return true
  }

  return isTenantApproved(approvalStatus, createdAt)
}

export function resolveTenantApprovalStatus(
  approvalStatus?: TenantApprovalStatus | null,
  createdAt?: Date | string | null
): TenantApprovalStatus {
  if (approvalStatus === 'pending' || approvalStatus === 'approved' || approvalStatus === 'rejected') {
    return approvalStatus
  }

  return isTenantApproved(approvalStatus, createdAt) ? 'approved' : 'pending'
}
