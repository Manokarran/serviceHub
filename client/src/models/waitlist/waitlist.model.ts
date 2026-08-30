import mongoose, { Schema, type Model } from 'mongoose'

import { WAITLIST_STATUSES, type IWaitlistEntryDocument } from './waitlist.types'

const waitlistSchema = new Schema<IWaitlistEntryDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'ServiceSlot', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'SiteCustomer', required: true, index: true },
    quantity: { type: Number, required: true, min: 1, max: 1000 },
    status: { type: String, enum: WAITLIST_STATUSES, required: true, default: 'waiting' }
  },
  {
    timestamps: true,
    collection: 'service_waitlist'
  }
)

waitlistSchema.index({ tenantId: 1, slotId: 1, customerId: 1 }, { unique: true })
waitlistSchema.index({ tenantId: 1, slotId: 1, status: 1, createdAt: 1 })

export const WaitlistEntryModel: Model<IWaitlistEntryDocument> =
  mongoose.models.WaitlistEntry ??
  mongoose.model<IWaitlistEntryDocument>('WaitlistEntry', waitlistSchema)
