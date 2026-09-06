import { Types } from 'mongoose'

import { connectDB } from '@/lib/db'
import type { CreditFeature } from '@/lib/constants/credits'
import {
  CreditLedgerModel,
  type CreditLedgerReason,
  type ICreditLedgerDocument
} from '@/models/credit-ledger'

export type CreateCreditLedgerInput = {
  tenantId: string
  delta: number
  balanceAfter: number
  reason: CreditLedgerReason
  feature?: CreditFeature
  description?: string
  actorUserId?: string
  actorEmail?: string
  metadata?: Record<string, unknown>
}

export class CreditLedgerRepository {
  async create(input: CreateCreditLedgerInput): Promise<ICreditLedgerDocument> {
    await connectDB()

    return CreditLedgerModel.create({
      tenantId: new Types.ObjectId(input.tenantId),
      delta: input.delta,
      balanceAfter: input.balanceAfter,
      reason: input.reason,
      feature: input.feature,
      description: input.description,
      actorUserId: input.actorUserId ? new Types.ObjectId(input.actorUserId) : undefined,
      actorEmail: input.actorEmail?.toLowerCase(),
      metadata: input.metadata
    })
  }

  async listForTenant(tenantId: string, limit = 50): Promise<ICreditLedgerDocument[]> {
    await connectDB()

    return CreditLedgerModel.find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, limit)))
      .exec()
  }
}

export const creditLedgerRepository = new CreditLedgerRepository()
