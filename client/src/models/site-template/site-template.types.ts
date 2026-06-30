import type { Types } from 'mongoose'

import type { SiteTemplateCategory, SiteTemplateStatus } from '@/lib/constants/site-template'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

export type ISiteTemplatePageSnapshot = {
  slug: string
  title: string
  description: string
  sortOrder: number
  blocks: Block[]
  siteStyles?: SiteStyles | null
}

export type ISiteTemplateTenantSettings = {
  primaryColor?: string
  logoUrl?: string
}

export type ISiteTemplateDocument = {
  _id: Types.ObjectId
  name: string
  slug: string
  description: string
  thumbnailUrl?: string | null
  generatedThumbnailUrl?: string | null
  category: SiteTemplateCategory
  tags: string[]
  status: SiteTemplateStatus
  sortOrder: number
  pages: ISiteTemplatePageSnapshot[]
  tenantSettings?: ISiteTemplateTenantSettings | null
  createdBy: Types.ObjectId
  publishedAt?: Date | null
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

export type SiteTemplateHomePreview = {
  blocks: Block[]
  siteStyles?: SiteStyles | null
}

export type SiteTemplateSummary = {
  id: string
  name: string
  slug: string
  description: string
  thumbnailUrl: string | null
  generatedThumbnailUrl: string | null
  category: SiteTemplateCategory
  tags: string[]
  status: SiteTemplateStatus
  sortOrder: number
  pageCount: number
  usageCount: number
  publishedAt: string | null
  updatedAt: string
  homePreview: SiteTemplateHomePreview | null
}

export type SiteTemplateDetail = SiteTemplateSummary & {
  pages: ISiteTemplatePageSnapshot[]
  tenantSettings: ISiteTemplateTenantSettings | null
}
