import mongoose, { Schema, type Model } from 'mongoose'

import { SITE_ANALYTICS_EVENT_TYPES, type ISiteAnalyticsEventDocument } from './site-analytics.types'

const NINETY_DAYS_IN_SECONDS = 90 * 24 * 60 * 60

const siteAnalyticsEventSchema = new Schema<ISiteAnalyticsEventDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    visitorId: { type: String, required: true, trim: true, maxlength: 64 },
    type: { type: String, required: true, enum: SITE_ANALYTICS_EVENT_TYPES },
    pageSlug: { type: String, required: true, trim: true, maxlength: 80, default: 'home' }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'site_analytics_events'
  }
)

siteAnalyticsEventSchema.index({ tenantId: 1, createdAt: -1 })
siteAnalyticsEventSchema.index({ tenantId: 1, type: 1, createdAt: -1 })
siteAnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: NINETY_DAYS_IN_SECONDS })

export const SiteAnalyticsEventModel: Model<ISiteAnalyticsEventDocument> =
  mongoose.models.SiteAnalyticsEvent ??
  mongoose.model<ISiteAnalyticsEventDocument>('SiteAnalyticsEvent', siteAnalyticsEventSchema)
