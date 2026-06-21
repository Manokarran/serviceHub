import mongoose, { Schema, type Model } from 'mongoose'

import type { BlockType } from '@/features/your-space/types'

import type { ISitePageDocument, ISitePageVersionDocument } from './site-page.types'

const BLOCK_TYPES: BlockType[] = [
  'section',
  'header',
  'footer',
  'hero',
  'heading',
  'text',
  'button',
  'image',
  'video',
  'logo'
]


const sitePageBlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, enum: BLOCK_TYPES },
    props: { type: Schema.Types.Mixed, required: true }
  },
  { _id: false }
)

const sitePageSchema = new Schema<ISitePageDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      default: 'home',
      trim: true,
      lowercase: true,
      maxlength: 64
    },
    blocks: {
      type: [sitePageBlockSchema],
      default: []
    },
    draftBlocks: {
      type: [sitePageBlockSchema],
      default: []
    },
    publishedBlocks: {
      type: [sitePageBlockSchema],
      default: []
    },
    draftSiteStyles: { type: Schema.Types.Mixed, default: null },
    publishedSiteStyles: { type: Schema.Types.Mixed, default: null },
    draftUpdatedAt: { type: Date },
    publishedAt: { type: Date, default: null }
  },
  {
    timestamps: true,
    collection: 'site_pages'
  }
)

sitePageSchema.index({ tenantId: 1, slug: 1 }, { unique: true })

const sitePageVersionSchema = new Schema<ISitePageVersionDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    pageSlug: {
      type: String,
      required: true,
      default: 'home',
      trim: true,
      lowercase: true
    },
    blocks: {
      type: [sitePageBlockSchema],
      required: true
    },
    publishedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    collection: 'site_page_versions'
  }
)

sitePageVersionSchema.index({ tenantId: 1, pageSlug: 1, publishedAt: -1 })

export const SitePageModel: Model<ISitePageDocument> =
  mongoose.models.SitePage ?? mongoose.model<ISitePageDocument>('SitePage', sitePageSchema)

export const SitePageVersionModel: Model<ISitePageVersionDocument> =
  mongoose.models.SitePageVersion ??
  mongoose.model<ISitePageVersionDocument>('SitePageVersion', sitePageVersionSchema)
