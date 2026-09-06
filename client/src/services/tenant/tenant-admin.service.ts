import 'server-only'

import { Types } from 'mongoose'

import { AppError } from '@/lib/errors'
import { isTenantApproved, type TenantApprovalStatus } from '@/lib/constants/tenant'
import { BASE_TEMPLATE_TENANT_SLUG } from '@/lib/site-template/base-template-tenant'
import { connectDB } from '@/lib/db'
import { BookingModel } from '@/models/booking'
import { BookingHoldModel } from '@/models/booking-hold'
import { ContactSubmissionModel } from '@/models/contact-submission'
import { CreditLedgerModel } from '@/models/credit-ledger'
import { ServiceModel } from '@/models/service'
import { ServiceScheduleModel } from '@/models/service-schedule'
import { ServiceSlotModel } from '@/models/service-slot'
import { SiteAnalyticsEventModel } from '@/models/site-analytics'
import { SiteCustomerModel } from '@/models/site-customer'
import { SitePageModel, SitePageVersionModel } from '@/models/site-page'
import { WaitlistEntryModel } from '@/models/waitlist'
import { tenantRepository, userRepository } from '@/repositories'

export type TenantRegistrationRequest = {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  approvalStatus: TenantApprovalStatus
  creditsBalance: number
  approvedAt: string | null
  approvedByEmail: string | null
  rejectedAt: string | null
  createdAt: string
  owner: {
    id: string
    name: string
    email: string
  } | null
}

function toObjectId(tenantId: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(tenantId)) {
    throw new AppError('Invalid organization id', 400, 'INVALID_TENANT_ID')
  }

  return new Types.ObjectId(tenantId)
}

export class TenantAdminService {
  async listRegistrationRequests(
    filter: TenantApprovalStatus | 'all' = 'all'
  ): Promise<TenantRegistrationRequest[]> {
    const tenants = await tenantRepository.listForApproval({ approvalStatus: filter })

    const rows = await Promise.all(
      tenants.map(async tenant => {
        const owner = await userRepository.findOwnerByTenantId(tenant._id.toString())
        const approvalStatus = (tenant.approvalStatus ?? 'approved') as TenantApprovalStatus

        return {
          id: tenant._id.toString(),
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          plan: tenant.plan,
          approvalStatus,
          creditsBalance: typeof tenant.creditsBalance === 'number' ? tenant.creditsBalance : 0,
          approvedAt: tenant.approvedAt?.toISOString() ?? null,
          approvedByEmail: tenant.approvedByEmail ?? null,
          rejectedAt: tenant.rejectedAt?.toISOString() ?? null,
          createdAt: tenant.createdAt.toISOString(),
          owner: owner
            ? {
                id: owner._id.toString(),
                name: owner.name,
                email: owner.email
              }
            : null
        } satisfies TenantRegistrationRequest
      })
    )

    return rows
  }

  async countPendingRequests(): Promise<number> {
    return tenantRepository.countPendingApprovals()
  }

  async approveTenant(tenantId: string, approvedByEmail: string) {
    await this.assertMutableTenant(tenantId)

    const updated = await tenantRepository.setApprovalStatus(tenantId, {
      approvalStatus: 'approved',
      approvedByEmail
    })

    if (!updated) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    return updated
  }

  async rejectTenant(tenantId: string) {
    await this.assertMutableTenant(tenantId)

    const updated = await tenantRepository.setApprovalStatus(tenantId, {
      approvalStatus: 'rejected'
    })

    if (!updated) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    return updated
  }

  async deleteTenantCompletely(tenantId: string): Promise<void> {
    const tenant = await this.assertMutableTenant(tenantId)
    const id = toObjectId(tenantId)
    const idString = tenant._id.toString()

    await connectDB()

    // Users first so a partial failure never leaves an approved session linked to a deleted org
    const deletedUsers = await userRepository.deleteManyByTenantId(idString)

    if (deletedUsers === 0) {
      // Fallback: string/ObjectId mismatch edge cases
      await userRepository.deleteManyByTenantId(tenantId)
    }

    await Promise.all([
      SitePageModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      SitePageVersionModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      ServiceModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      ServiceScheduleModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      ServiceSlotModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      BookingModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      BookingHoldModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      WaitlistEntryModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      SiteCustomerModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      ContactSubmissionModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      SiteAnalyticsEventModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec(),
      CreditLedgerModel.deleteMany({ tenantId: { $in: [id, idString] } }).exec()
    ])

    await tenantRepository.deleteById(idString)
  }

  private async assertMutableTenant(tenantId: string) {
    const tenant = await tenantRepository.findById(tenantId)

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    if (tenant.slug === BASE_TEMPLATE_TENANT_SLUG || tenant.settings?.kind === 'base_template') {
      throw new AppError('The base template organization cannot be modified here.', 403, 'BASE_TEMPLATE_PROTECTED')
    }

    return tenant
  }
}

export function tenantIsApprovedFromDoc(approvalStatus?: TenantApprovalStatus | null) {
  return isTenantApproved(approvalStatus)
}

export const tenantAdminService = new TenantAdminService()
