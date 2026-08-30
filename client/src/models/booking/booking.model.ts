import mongoose, { Schema, type Model } from 'mongoose'

import { BOOKING_STATUSES, type IBookingDocument } from './booking.types'

const bookingSchema = new Schema<IBookingDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'ServiceSlot', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'SiteCustomer', required: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    customerPhone: { type: String, trim: true, maxlength: 40 },
    quantity: { type: Number, required: true, min: 1, max: 1000 },
    termEnrollmentId: { type: String, trim: true, maxlength: 128, default: null, index: true },
    status: { type: String, enum: BOOKING_STATUSES, required: true, default: 'confirmed' },
    statusHistory: [
      {
        status: { type: String, enum: BOOKING_STATUSES, required: true },
        changedAt: { type: Date, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        reason: { type: String, trim: true, maxlength: 500 }
      }
    ],
    confirmationCode: { type: String, required: true, trim: true, unique: true, index: true },
    idempotencyKey: { type: String, required: true, trim: true },
    priceAmountMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true, maxlength: 3 },
    serviceName: { type: String, required: true, trim: true, maxlength: 120 },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    timezone: { type: String, required: true, trim: true, maxlength: 64 }
  },
  {
    timestamps: true,
    collection: 'bookings'
  }
)

const existingBookingModel = mongoose.models.Booking as Model<IBookingDocument> | undefined
const existingStatusEnum = existingBookingModel?.schema.path('status')?.enumValues
const hasTermEnrollmentPath = Boolean(existingBookingModel?.schema.path('termEnrollmentId'))

if (
  process.env.NODE_ENV === 'development' &&
  existingBookingModel &&
  (!existingStatusEnum?.includes('removed') || !hasTermEnrollmentPath)
) {
  mongoose.deleteModel('Booking')
}

bookingSchema.index({ tenantId: 1, idempotencyKey: 1 }, { unique: true })
bookingSchema.index({ tenantId: 1, customerId: 1, startAt: -1 })
bookingSchema.index({ tenantId: 1, slotId: 1, customerId: 1 }, { unique: true })

export const BookingModel: Model<IBookingDocument> =
  mongoose.models.Booking ?? mongoose.model<IBookingDocument>('Booking', bookingSchema)
