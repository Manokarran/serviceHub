import mongoose, { Schema, type Model } from 'mongoose'

import { TENANT_PLANS, TENANT_STATUSES } from '@/models/shared/enums'

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
    settings: {
      primaryColor: { type: String, trim: true },
      logoUrl: { type: String, trim: true },
      customDomain: { type: String, trim: true, lowercase: true },
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
tenantSchema.index({ 'settings.customDomain': 1 }, { sparse: true })

export const TenantModel: Model<ITenantDocument> =
  mongoose.models.Tenant ?? mongoose.model<ITenantDocument>('Tenant', tenantSchema)
