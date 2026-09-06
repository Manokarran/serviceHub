import mongoose, { Schema, type Model } from 'mongoose'

import { TENANT_APPROVAL_STATUSES, TENANT_PLANS, TENANT_STATUSES } from '@/models/shared/enums'

import type { ITenantDocument } from './tenant.types'

const tenantSchema = new Schema<ITenantDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 63,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens']
    },
    status: {
      type: String,
      enum: TENANT_STATUSES,
      default: 'trial',
      required: true
    },
    plan: {
      type: String,
      enum: TENANT_PLANS,
      default: 'free',
      required: true
    },
    approvalStatus: {
      type: String,
      enum: TENANT_APPROVAL_STATUSES,
      default: 'pending'
    },
    approvedAt: { type: Date },
    approvedByEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    rejectedAt: { type: Date },
    creditsBalance: {
      type: Number,
      min: 0,
      max: 1_000_000,
      default: 0,
      required: true
    },
    settings: {
      kind: { type: String, enum: ['base_template'], trim: true },
      primaryColor: { type: String, trim: true },
      logoUrl: { type: String, trim: true },
      customDomain: { type: String, trim: true, lowercase: true },
      defaultTimezone: { type: String, trim: true, maxlength: 64 },
      defaultCurrency: { type: String, trim: true, uppercase: true, maxlength: 3 },
      location: {
        address: { type: String, trim: true, maxlength: 500 },
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        context: {
          countryCode: { type: String, trim: true, lowercase: true, maxlength: 2 },
          country: { type: String, trim: true, maxlength: 100 },
          region: { type: String, trim: true, maxlength: 100 },
          place: { type: String, trim: true, maxlength: 100 }
        }
      },
      siteStartedAt: { type: Date },
      appliedTemplateId: { type: String, trim: true },
      contactNotificationEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
      contactAutoReplyEnabled: { type: Boolean, default: false },
      contactAutoReplySubject: { type: String, trim: true, maxlength: 200 },
      contactAutoReplyMessage: { type: String, trim: true, maxlength: 2000 }
    }
  },
  {
    timestamps: true,
    collection: 'tenants'
  }
)

tenantSchema.index({ status: 1 })
tenantSchema.index({ approvalStatus: 1, createdAt: -1 })
tenantSchema.index({ 'settings.customDomain': 1 }, { sparse: true })

const existingTenantModel = mongoose.models.Tenant as Model<ITenantDocument> | undefined

// Dev hot-reload: rebuild if an older schema was registered without creditsBalance
if (process.env.NODE_ENV === 'development' && existingTenantModel && !existingTenantModel.schema.path('creditsBalance')) {
  mongoose.deleteModel('Tenant')
}

export const TenantModel: Model<ITenantDocument> =
  mongoose.models.Tenant ?? mongoose.model<ITenantDocument>('Tenant', tenantSchema)
