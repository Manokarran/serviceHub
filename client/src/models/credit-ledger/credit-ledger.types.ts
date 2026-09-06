import type { Document, Types } from 'mongoose'

import type { CreditFeature } from '@/lib/constants/credits'

export const CREDIT_LEDGER_REASONS = [
  'signup_grant',
  'admin_grant',
  'admin_adjust',
  'usage',
  'refund'
] as const

export type CreditLedgerReason = (typeof CREDIT_LEDGER_REASONS)[number]

export interface ICreditLedgerEntry {
  tenantId: Types.ObjectId
  delta: number
  balanceAfter: number
  reason: CreditLedgerReason
  feature?: CreditFeature
  description?: string
  actorUserId?: Types.ObjectId
  actorEmail?: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface ICreditLedgerDocument extends ICreditLedgerEntry, Document {}
