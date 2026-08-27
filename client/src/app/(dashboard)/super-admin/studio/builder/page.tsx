import { redirect } from 'next/navigation'

import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { WebsiteBuilderLoader } from '@/features/your-space/components/WebsiteBuilderLoader'
import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { requireIsoString, serializeForClient, toIsoString } from '@/lib/utils/plain-json'
import {
  BASE_TEMPLATE_TENANT_NAME,
  getOrCreateBaseTemplateTenantId,
  getBaseTemplateTenantSlug
} from '@/lib/site-template/base-template-tenant'
import { sitePageService } from '@/services/site-page'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type PageProps = {
  searchParams: Promise<{ p?: string }>
}

export default async function BaseTemplateBuilderPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const tenantId = await getOrCreateBaseTemplateTenantId()
  const tenantSlug = await getBaseTemplateTenantSlug()
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

  try {
    await sitePageService.ensureBaseWebsitePages(tenantId)
    initialPages = await sitePageService.listPages(tenantId)
    const resolvedSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'
    const sitePage = await sitePageService.getPage(tenantId, resolvedSlug)

    if (sitePage) {
      initialDraftBlocks = sitePage.draftBlocks
      initialPublishedBlocks = sitePage.publishedBlocks
      initialPageTitle = sitePage.title
      initialDraftSiteStyles = sitePage.draftSiteStyles
      initialPublishedSiteStyles = sitePage.publishedSiteStyles
      initialSavedAt = requireIsoString(sitePage.draftUpdatedAt)
      initialPublishedAt = toIsoString(sitePage.publishedAt)
      initialVersions = await sitePageService.listPublishedVersions(tenantId, resolvedSlug)
    }
  } catch (error) {
    console.error('[BaseTemplateBuilderPage] Failed to load workspace', error)
  }

  const activeSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'

  return (
    <WebsiteBuilderLoader
      {...serializeForClient({
        tenantSlug,
        tenantName: BASE_TEMPLATE_TENANT_NAME,
        builderScope: 'base_template' as const,
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
        isSiteStarted: true,
        extraPageCount: initialPages.filter(page => page.slug !== 'home').length
      })}
    />
  )
}
