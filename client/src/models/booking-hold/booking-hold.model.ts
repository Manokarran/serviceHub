import mongoose, { Schema, type Model } from 'mongoose'

import type { IBookingHoldDocument } from './booking-hold.types'

const bookingHoldSchema = new Schema<IBookingHoldDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'ServiceSlot', required: true },
    holdToken: { type: String, required: true, unique: true, index: true },
    quantity: { type: Number, required: true, min: 1, max: 1000 },
    status: { type: String, enum: ['active', 'consumed', 'released'], default: 'active', required: true },
    expiresAt: { type: Date, required: true, index: true }
  },
  {
    timestamps: true,
    collection: 'booking_holds'
  }
)

bookingHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
bookingHoldSchema.index({ tenantId: 1, slotId: 1, status: 1 })

export const BookingHoldModel: Model<IBookingHoldDocument> =
  mongoose.models.BookingHold ?? mongoose.model<IBookingHoldDocument>('BookingHold', bookingHoldSchema)
