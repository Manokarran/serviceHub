import type { Document, Types } from 'mongoose'

import type { BlockType } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'

export interface ISitePageBlock {
  id: string
  type: BlockType
  props: Record<string, unknown>
}

export interface ISitePage {
  tenantId: Types.ObjectId
  slug: string
  title: string
  description: string
  sortOrder: number
  /** @deprecated Legacy field — migrated to draftBlocks/publishedBlocks */
  blocks?: ISitePageBlock[]
  draftBlocks: ISitePageBlock[]
  publishedBlocks: ISitePageBlock[]
  draftSiteStyles?: SiteStyles | null
  publishedSiteStyles?: SiteStyles | null
  draftUpdatedAt?: Date
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ISitePageDocument extends ISitePage, Document {}

export interface ISitePageVersion {
  tenantId: Types.ObjectId
  pageSlug: string
  blocks: ISitePageBlock[]
  publishedAt: Date
  publishedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface ISitePageVersionDocument extends ISitePageVersion, Document {}

export type PublishedVersionSummary = {
  id: string
  publishedAt: string
  blockCount: number
}

export type SitePageSummary = {
  slug: string
  title: string
  description: string
  sortOrder: number
  isHome: boolean
  publishedAt: string | null
  hasUnpublishedChanges: boolean
  blockCount: number
}
