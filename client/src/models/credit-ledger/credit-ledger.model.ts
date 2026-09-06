import mongoose, { Schema, type Model } from 'mongoose'

import { CREDIT_FEATURES } from '@/lib/constants/credits'

import { CREDIT_LEDGER_REASONS, type ICreditLedgerDocument } from './credit-ledger.types'

const creditLedgerSchema = new Schema<ICreditLedgerDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    delta: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    reason: { type: String, enum: CREDIT_LEDGER_REASONS, required: true },
    feature: { type: String, enum: CREDIT_FEATURES },
    description: { type: String, trim: true, maxlength: 400 },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    metadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    collection: 'credit_ledger'
  }
)

creditLedgerSchema.index({ tenantId: 1, createdAt: -1 })

export const CreditLedgerModel: Model<ICreditLedgerDocument> =
  mongoose.models.CreditLedger ?? mongoose.model<ICreditLedgerDocument>('CreditLedger', creditLedgerSchema)
