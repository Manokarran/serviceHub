import mongoose, { Schema, type Model } from 'mongoose'

import type { ISiteCustomerDocument } from './site-customer.types'

const siteCustomerSchema = new Schema<ISiteCustomerDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    googleId: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 40 },
    image: { type: String, trim: true, maxlength: 2048 },
    isActive: { type: Boolean, default: true, required: true },
    lastLoginAt: { type: Date }
  },
  {
    timestamps: true,
    collection: 'site_customers'
  }
)

siteCustomerSchema.index({ tenantId: 1, googleId: 1 }, { unique: true })
siteCustomerSchema.index({ tenantId: 1, email: 1 })

export const SiteCustomerModel: Model<ISiteCustomerDocument> =
  mongoose.models.SiteCustomer ?? mongoose.model<ISiteCustomerDocument>('SiteCustomer', siteCustomerSchema)
