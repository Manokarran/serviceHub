import mongoose, { Schema, type Model } from 'mongoose'

import { SERVICE_SLOT_STATUSES } from '@/lib/constants/service'

import type { IServiceSlotDocument } from './service-slot.types'

const serviceSlotSchema = new Schema<IServiceSlotDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'ServiceSchedule', required: true, index: true },
    staffUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    timezone: { type: String, required: true, trim: true, maxlength: 64 },

    capacity: { type: Number, required: true, min: 1, max: 1000 },
    seatsBooked: { type: Number, required: true, default: 0, min: 0 },
    seatsHeld: { type: Number, required: true, default: 0, min: 0 },

    status: { type: String, enum: SERVICE_SLOT_STATUSES, default: 'scheduled', required: true },
    priceOverrideMinor: { type: Number, default: null, min: 0 },

    materialisedAt: { type: Date, required: true, default: () => new Date() }
  },
  {
    timestamps: true,
    collection: 'service_slots'
  }
)

serviceSlotSchema.index({ tenantId: 1, serviceId: 1, staffUserId: 1, startAt: 1 }, { unique: true })
serviceSlotSchema.index({ tenantId: 1, startAt: 1, status: 1 })
serviceSlotSchema.index({ tenantId: 1, staffUserId: 1, startAt: 1 })
serviceSlotSchema.index({ scheduleId: 1, startAt: 1 })

export const ServiceSlotModel: Model<IServiceSlotDocument> =
  mongoose.models.ServiceSlot ?? mongoose.model<IServiceSlotDocument>('ServiceSlot', serviceSlotSchema)
