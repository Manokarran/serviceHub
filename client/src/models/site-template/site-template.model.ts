import mongoose, { Schema, type Model } from 'mongoose'

import { SITE_TEMPLATE_CATEGORIES, SITE_TEMPLATE_STATUSES } from '@/lib/constants/site-template'

import type { ISiteTemplateDocument } from './site-template.types'

const siteTemplatePageSchema = new Schema(
  {
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 64 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    sortOrder: { type: Number, default: 0 },
    blocks: { type: Schema.Types.Mixed, default: [] },
    siteStyles: { type: Schema.Types.Mixed, default: null }
  },
  { _id: false }
)

const siteTemplateSchema = new Schema<ISiteTemplateDocument>(
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
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true
    },
    generatedThumbnailUrl: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      enum: SITE_TEMPLATE_CATEGORIES,
      default: 'business',
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: SITE_TEMPLATE_STATUSES,
      default: 'draft',
      required: true,
      index: true
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    pages: {
      type: [siteTemplatePageSchema],
      default: []
    },
    tenantSettings: {
      primaryColor: { type: String, trim: true },
      logoUrl: { type: String, trim: true }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'site_templates'
  }
)

siteTemplateSchema.index({ status: 1, sortOrder: 1, name: 1 })
siteTemplateSchema.index({ category: 1, status: 1 })

export const SiteTemplateModel: Model<ISiteTemplateDocument> =
  mongoose.models.SiteTemplate ??
  mongoose.model<ISiteTemplateDocument>('SiteTemplate', siteTemplateSchema)
