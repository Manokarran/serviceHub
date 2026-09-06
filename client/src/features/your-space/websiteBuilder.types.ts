import type { PublishedVersionSummary, SitePageSummary } from '@/models/site-page/site-page.types'

import type { Block } from './types'
import type { SiteStyles } from './types/siteStyles'
import type { TenantLocation } from '@/lib/location/types'

export type WebsiteBuilderProps = {
  tenantSlug: string
  tenantName: string
  tenantLocation?: TenantLocation | null
  /** False while awaiting super-admin approval — draft/preview OK, publish blocked. */
  tenantApproved?: boolean
  builderScope?: 'organization' | 'base_template' | 'library_template'
  libraryTemplateId?: string | null
  initialPageSlug: string
  initialPages: SitePageSummary[]
  initialPageTitle: string
  initialDraftBlocks: Block[] | null
  initialPublishedBlocks: Block[]
  initialSavedAt: string | null
  initialPublishedAt: string | null
  initialDraftSiteStyles: SiteStyles | null
  initialPublishedSiteStyles: SiteStyles | null
  initialVersions: PublishedVersionSummary[]
  isSiteStarted: boolean
  extraPageCount: number
}
