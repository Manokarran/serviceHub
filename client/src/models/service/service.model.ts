import mongoose, { Schema, type Model } from 'mongoose'

import {
  DEFAULT_SERVICE_TIMEZONE,
  SERVICE_BOOKING_MODES,
  SERVICE_PURCHASE_MODES,
  SERVICE_LOCATION_TYPES,
  SERVICE_PRICE_MODELS,
  SERVICE_CURRENCY_OPTIONS,
  DEFAULT_SCHEDULE_HORIZON_DAYS,
  SERVICE_SLOT_MODES,
  SERVICE_STATUSES
} from '@/lib/constants/service'

import type { IServiceDocument } from './service.types'

const serviceSchema = new Schema<IServiceDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens']
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    tagline: { type: String, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 5000 },
    coverImageUrl: { type: String, trim: true, maxlength: 2048 },
    category: { type: String, trim: true, maxlength: 60 },
    tags: { type: [String], default: [] },

    slotMode: { type: String, enum: SERVICE_SLOT_MODES, default: 'fixed', required: true },
    durationMinutes: { type: Number, default: 60, required: true, min: 5, max: 24 * 60 },
    slotIntervalMinutes: { type: Number, min: 5, max: 24 * 60 },
    bufferAfterMinutes: { type: Number, default: 0, required: true, min: 0, max: 240 },
    defaultCapacity: { type: Number, default: 10, required: true, min: 1, max: 1000 },
    maxSeatsPerBooking: { type: Number, default: 1, required: true, min: 1, max: 50 },

    bookingMode: { type: String, enum: SERVICE_BOOKING_MODES, default: 'instant', required: true },
    purchaseMode: { type: String, enum: SERVICE_PURCHASE_MODES, default: 'single_session', required: true },
    minNoticeHours: { type: Number, default: 2, required: true, min: 0, max: 720 },
    maxDaysAhead: { type: Number, default: 60, required: true, min: 1, max: 365 },
    scheduleHorizonDays: {
      type: Number,
      default: DEFAULT_SCHEDULE_HORIZON_DAYS,
      required: true,
      min: 7,
      max: 365
    },
    scheduleStartDate: { type: String, trim: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Invalid season start date'] },
    scheduleEndDate: { type: String, trim: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Invalid season end date'] },
    cancellationWindowHours: { type: Number, default: 12, required: true, min: 0, max: 720 },
    waitlistEnabled: { type: Boolean, default: false, required: true },
    excludePublicHolidays: { type: Boolean, default: false, required: true },

    locationType: { type: String, enum: SERVICE_LOCATION_TYPES, default: 'in_person', required: true },
    locationLabel: { type: String, trim: true, maxlength: 240 },
    timezone: { type: String, default: DEFAULT_SERVICE_TIMEZONE, required: true, trim: true, maxlength: 64 },

    priceModel: { type: String, enum: SERVICE_PRICE_MODELS, default: 'per_session', required: true },
    priceAmountMinor: { type: Number, default: 0, required: true, min: 0 },
    currency: {
      type: String,
      enum: SERVICE_CURRENCY_OPTIONS.map(option => option.code),
      default: 'INR',
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 3
    },

    status: { type: String, enum: SERVICE_STATUSES, default: 'draft', required: true, index: true },
    sortOrder: { type: Number, default: 0, required: true },

    hasBookings: { type: Boolean, default: false, required: true },
    nextAvailableAt: { type: Date, default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true,
    collection: 'services'
  }
)

serviceSchema.index({ tenantId: 1, slug: 1 }, { unique: true })
serviceSchema.index({ tenantId: 1, status: 1, sortOrder: 1 })
serviceSchema.index({ tenantId: 1, category: 1 })

const existingServiceModel = mongoose.models.Service as Model<IServiceDocument> | undefined

if (
  process.env.NODE_ENV === 'development' &&
  existingServiceModel &&
  !existingServiceModel.schema.path('purchaseMode')
) {
  mongoose.deleteModel('Service')
}

export const ServiceModel: Model<IServiceDocument> =
  mongoose.models.Service ?? mongoose.model<IServiceDocument>('Service', serviceSchema)
