import { connectDB } from '@/lib/db'
import type { TenantApprovalStatus } from '@/lib/constants/tenant'
import { TenantModel, type ITenantDocument } from '@/models/tenant'

const TENANT_POPULATE_FIELDS = 'name slug status plan approvalStatus'

export type CreateTenantInput = Pick<ITenantDocument, 'name' | 'slug'> & {
  approvalStatus?: TenantApprovalStatus
  creditsBalance?: number
}

export class TenantRepository {
  async findById(id: string): Promise<ITenantDocument | null> {
    await connectDB()

    return TenantModel.findById(id).exec()
  }

  async findBySlug(slug: string): Promise<ITenantDocument | null> {
    await connectDB()

    return TenantModel.findOne({ slug: slug.toLowerCase() }).exec()
  }

  async isSlugTaken(slug: string, excludeTenantId?: string): Promise<boolean> {
    await connectDB()

    const existing = await TenantModel.findOne({ slug: slug.toLowerCase() }).select('_id').exec()

    if (!existing) {
      return false
    }

    if (excludeTenantId && existing._id.toString() === excludeTenantId) {
      return false
    }

    return true
  }

  async updateNameAndSlug(
    id: string,
    data: { name: string; slug: string }
  ): Promise<ITenantDocument | null> {
    await connectDB()

    return TenantModel.findByIdAndUpdate(
      id,
      { $set: { name: data.name, slug: data.slug } },
      { returnDocument: 'after', runValidators: true }
    ).exec()
  }

  async create(data: CreateTenantInput): Promise<ITenantDocument> {
    await connectDB()

    return TenantModel.create({
      name: data.name,
      slug: data.slug,
      approvalStatus: data.approvalStatus ?? 'pending',
      creditsBalance: data.creditsBalance ?? 0
    })
  }

  async deleteById(id: string): Promise<void> {
    await connectDB()

    await TenantModel.findByIdAndDelete(id).exec()
  }

  async listForApproval(filter?: {
    approvalStatus?: TenantApprovalStatus | 'all'
  }): Promise<ITenantDocument[]> {
    await connectDB()

    const query: Record<string, unknown> = {
      'settings.kind': { $ne: 'base_template' }
    }

    if (filter?.approvalStatus && filter.approvalStatus !== 'all') {
      if (filter.approvalStatus === 'approved') {
        // Include legacy tenants that never had approvalStatus set
        query.$or = [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }]
      } else {
        query.approvalStatus = filter.approvalStatus
      }
    }

    return TenantModel.find(query).sort({ createdAt: -1 }).exec()
  }

  async countPendingApprovals(): Promise<number> {
    await connectDB()

    return TenantModel.countDocuments({
      approvalStatus: 'pending',
      'settings.kind': { $ne: 'base_template' }
    }).exec()
  }

  async setApprovalStatus(
    id: string,
    data: {
      approvalStatus: TenantApprovalStatus
      approvedByEmail?: string
    }
  ): Promise<ITenantDocument | null> {
    await connectDB()

    if (data.approvalStatus === 'approved') {
      return TenantModel.findByIdAndUpdate(
        id,
        {
          $set: {
            approvalStatus: 'approved',
            approvedAt: new Date(),
            approvedByEmail: data.approvedByEmail?.toLowerCase()
          },
          $unset: { rejectedAt: '' }
        },
        { returnDocument: 'after', runValidators: true }
      ).exec()
    }

    // pending cancel + remove approval both land on rejected
    const updated = await TenantModel.findByIdAndUpdate(
      id,
      {
        $set: {
          approvalStatus: 'rejected',
          rejectedAt: new Date()
        },
        $unset: { approvedAt: '', approvedByEmail: '' }
      },
      { returnDocument: 'after', runValidators: true }
    ).exec()

    return updated
  }

  async updateSettings(id: string, settings: Partial<ITenantDocument['settings']>): Promise<ITenantDocument | null> {
    await connectDB()

    const setPayload: Record<string, unknown> = {}
    const unsetPayload: Record<string, ''> = {}

    for (const [key, value] of Object.entries(settings)) {
      if (value === undefined || value === '') {
        unsetPayload[`settings.${key}`] = ''
      } else {
        setPayload[`settings.${key}`] = value
      }
    }

    const update: Record<string, unknown> = {}

    if (Object.keys(setPayload).length > 0) {
      update.$set = setPayload
    }

    if (Object.keys(unsetPayload).length > 0) {
      update.$unset = unsetPayload
    }

    if (Object.keys(update).length === 0) {
      return TenantModel.findById(id).exec()
    }

    return TenantModel.findByIdAndUpdate(id, update, { returnDocument: 'after' }).exec()
  }

  async getCreditsBalance(id: string): Promise<number | null> {
    await connectDB()

    // lean() + explicit select avoids stale schema caches omitting the field
    const tenant = await TenantModel.findById(id).select('creditsBalance').lean().exec()

    if (!tenant) {
      return null
    }

    const balance = (tenant as { creditsBalance?: unknown }).creditsBalance

    return typeof balance === 'number' && Number.isFinite(balance) ? balance : 0
  }

  /** Ensure creditsBalance exists as a number before $inc / $gte queries. */
  private async ensureCreditsField(id: string): Promise<void> {
    await TenantModel.updateOne(
      {
        _id: id,
        $or: [{ creditsBalance: { $exists: false } }, { creditsBalance: null }]
      },
      { $set: { creditsBalance: 0 } }
    ).exec()
  }

  /**
   * Atomically deduct credits when balance is sufficient.
   * Returns null when the tenant is missing or balance is too low.
   */
  async tryDeductCredits(id: string, amount: number): Promise<{ creditsBalance: number } | null> {
    await connectDB()

    if (amount <= 0) {
      const balance = await this.getCreditsBalance(id)

      return balance === null ? null : { creditsBalance: balance }
    }

    await this.ensureCreditsField(id)

    const updated = await TenantModel.findOneAndUpdate(
      { _id: id, creditsBalance: { $gte: amount } },
      { $inc: { creditsBalance: -amount } },
      { returnDocument: 'after' }
    )
      .select('creditsBalance')
      .lean()
      .exec()

    if (!updated) {
      return null
    }

    const creditsBalance = (updated as { creditsBalance?: unknown }).creditsBalance

    return {
      creditsBalance: typeof creditsBalance === 'number' && Number.isFinite(creditsBalance) ? creditsBalance : 0
    }
  }

  async addCredits(id: string, amount: number): Promise<{ creditsBalance: number } | null> {
    await connectDB()

    if (amount === 0) {
      const balance = await this.getCreditsBalance(id)

      return balance === null ? null : { creditsBalance: balance }
    }

    if (amount < 0) {
      return this.tryDeductCredits(id, Math.abs(amount))
    }

    await this.ensureCreditsField(id)

    const updated = await TenantModel.findByIdAndUpdate(id, { $inc: { creditsBalance: amount } }, { returnDocument: 'after' })
      .select('creditsBalance')
      .lean()
      .exec()

    if (!updated) {
      return null
    }

    const creditsBalance = (updated as { creditsBalance?: unknown }).creditsBalance

    return {
      creditsBalance: typeof creditsBalance === 'number' && Number.isFinite(creditsBalance) ? creditsBalance : amount
    }
  }

  async setCreditsBalance(id: string, balance: number): Promise<{ creditsBalance: number } | null> {
    await connectDB()

    const updated = await TenantModel.findByIdAndUpdate(
      id,
      { $set: { creditsBalance: Math.max(0, Math.floor(balance)) } },
      { returnDocument: 'after', runValidators: true }
    )
      .select('creditsBalance')
      .lean()
      .exec()

    if (!updated) {
      return null
    }

    const creditsBalance = (updated as { creditsBalance?: unknown }).creditsBalance

    return {
      creditsBalance:
        typeof creditsBalance === 'number' && Number.isFinite(creditsBalance)
          ? creditsBalance
          : Math.max(0, Math.floor(balance))
    }
  }
}

export const TENANT_USER_POPULATE = TENANT_POPULATE_FIELDS

export const tenantRepository = new TenantRepository()
