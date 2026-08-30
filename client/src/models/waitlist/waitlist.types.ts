import type { Document, Types } from 'mongoose'

export const WAITLIST_STATUSES = ['waiting', 'notified', 'converted', 'cancelled'] as const
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number]

export interface IWaitlistEntry {
  tenantId: Types.ObjectId
  serviceId: Types.ObjectId
  slotId: Types.ObjectId
  customerId: Types.ObjectId
  quantity: number
  status: WaitlistStatus
  createdAt: Date
  updatedAt: Date
}

export interface IWaitlistEntryDocument extends IWaitlistEntry, Document {
  _id: Types.ObjectId
}
