import mongoose, { Schema, type Model } from 'mongoose'

import type { IServiceScheduleDocument } from './service-schedule.types'

const serviceScheduleSchema = new Schema<IServiceScheduleDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true, index: true },

    label: { type: String, trim: true, maxlength: 120 },

    byWeekday: {
      type: [Number],
      default: [],
      required: true,
      validate: {
        validator: (days: number[]) => days.every(day => Number.isInteger(day) && day >= 0 && day <= 6),
        message: 'Weekdays must be integers between 0 and 6'
      }
    },

    startMinutes: { type: Number, required: true, min: 0, max: 24 * 60 - 1 },
    endMinutes: { type: Number, required: true, min: 1, max: 24 * 60 },

    capacity: { type: Number, required: true, default: 1, min: 1, max: 1000 },
    staffUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    validFrom: { type: Date, default: null },
    validTo: { type: Date, default: null },

    exceptionDates: { type: [String], default: [] },

    isActive: { type: Boolean, default: true, required: true }
  },
  {
    timestamps: true,
    collection: 'service_schedules'
  }
)

serviceScheduleSchema.index({ tenantId: 1, serviceId: 1, isActive: 1 })

export const ServiceScheduleModel: Model<IServiceScheduleDocument> =
  mongoose.models.ServiceSchedule ??
  mongoose.model<IServiceScheduleDocument>('ServiceSchedule', serviceScheduleSchema)
