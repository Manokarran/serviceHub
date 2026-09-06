import { redirect } from 'next/navigation'

import type { Block } from '@/features/your-space/types'
import type { TenantLocation } from '@/lib/location/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { WebsiteBuilderLoader } from '@/features/your-space/components/WebsiteBuilderLoader'
import { requireOpenTenantOrRedirect } from '@/lib/auth/require-approved-tenant-page'
import { requireIsoString, serializeForClient, toIsoString } from '@/lib/utils/plain-json'
import { sitePageService } from '@/services/site-page'
import { siteWorkspaceService } from '@/services/site-workspace'
import { tenantProfileService } from '@/services/tenant'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type PageProps = {
  searchParams: Promise<{ p?: string }>
}

export default async function YourSpacePage({ searchParams }: PageProps) {
  const { session, tenantApproved } = await requireOpenTenantOrRedirect()
  const { user } = session
  const resolvedSearchParams = (await searchParams) ?? {}
  const initialPageSlug = resolvedSearchParams.p?.trim() || 'home'

  let initialDraftBlocks: Block[] | null = null
  let initialPublishedBlocks: Block[] = []
  let initialPageTitle = 'Home'
  let initialSavedAt: string | null = null
  let initialPublishedAt: string | null = null
  let initialDraftSiteStyles: SiteStyles | null = null
  let initialPublishedSiteStyles: SiteStyles | null = null
  let initialVersions: Awaited<ReturnType<typeof sitePageService.listPublishedVersions>> = []
  let initialPages: Awaited<ReturnType<typeof sitePageService.listPages>> = []
  let isSiteStarted = false
  let extraPageCount = 0
  let tenantLocation: TenantLocation | null = null

  if (user.tenantId) {
    try {
      const profile = await tenantProfileService.getProfile(user.tenantId)

      tenantLocation = profile.location

      initialPages = await sitePageService.listPages(user.tenantId)

      const resolvedSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'
      const sitePage = await sitePageService.getPage(user.tenantId, resolvedSlug)

      if (sitePage) {
        initialDraftBlocks = sitePage.draftBlocks
        initialPublishedBlocks = sitePage.publishedBlocks
        initialPageTitle = sitePage.title
        initialDraftSiteStyles = sitePage.draftSiteStyles
        initialPublishedSiteStyles = sitePage.publishedSiteStyles
        initialSavedAt = requireIsoString(sitePage.draftUpdatedAt)
        initialPublishedAt = toIsoString(sitePage.publishedAt)
        initialVersions = await sitePageService.listPublishedVersions(user.tenantId, resolvedSlug)
      }

      const workspaceStatus = await siteWorkspaceService.getStatus(user.tenantId)

      isSiteStarted = workspaceStatus.isSiteStarted
      extraPageCount = initialPages.filter(page => page.slug !== 'home').length
    } catch (error) {
      console.error('[YourSpacePage] Failed to load workspace', error)
    }
  }

  const tenantSlug = user.tenantSlug ?? 'default'
  const activeSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'

  const builderProps = serializeForClient({
    tenantSlug,
    tenantName: user.tenantName ?? 'Your Workspace',
    tenantLocation,
    tenantApproved,
    initialPageSlug: activeSlug,
    initialPages,
    initialPageTitle,
    initialDraftBlocks,
    initialPublishedBlocks,
    initialSavedAt,
    initialPublishedAt,
    initialDraftSiteStyles,
    initialPublishedSiteStyles,
    initialVersions,
    isSiteStarted,
    extraPageCount
  })

  return <WebsiteBuilderLoader {...builderProps} />
}
