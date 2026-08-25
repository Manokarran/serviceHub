import { redirect } from 'next/navigation'

import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { WebsiteBuilder } from '@/features/your-space/components/WebsiteBuilder'
import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import {
  BASE_TEMPLATE_TENANT_NAME,
  getOrCreateBaseTemplateTenantId,
  getBaseTemplateTenantSlug
} from '@/lib/site-template/base-template-tenant'
import { sitePageService } from '@/services/site-page'

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
  const { p: pageParam } = await searchParams
  const initialPageSlug = pageParam?.trim() || 'home'

  await sitePageService.ensureBaseWebsitePages(tenantId)

  let initialDraftBlocks: Block[] | null = null
  let initialPublishedBlocks: Block[] = []
  let initialPageTitle = 'Home'
  let initialSavedAt: string | null = null
  let initialPublishedAt: string | null = null
  let initialDraftSiteStyles: SiteStyles | null = null
  let initialPublishedSiteStyles: SiteStyles | null = null
  let initialVersions: Awaited<ReturnType<typeof sitePageService.listPublishedVersions>> = []
  const initialPages = await sitePageService.listPages(tenantId)
  const resolvedSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'
  const sitePage = await sitePageService.getPage(tenantId, resolvedSlug)

  if (sitePage) {
    initialDraftBlocks = JSON.parse(JSON.stringify(sitePage.draftBlocks)) as Block[]
    initialPublishedBlocks = JSON.parse(JSON.stringify(sitePage.publishedBlocks)) as Block[]
    initialPageTitle = sitePage.title
    initialDraftSiteStyles = sitePage.draftSiteStyles
      ? (JSON.parse(JSON.stringify(sitePage.draftSiteStyles)) as SiteStyles)
      : null
    initialPublishedSiteStyles = sitePage.publishedSiteStyles
      ? (JSON.parse(JSON.stringify(sitePage.publishedSiteStyles)) as SiteStyles)
      : null
    initialSavedAt = sitePage.draftUpdatedAt.toISOString()
    initialPublishedAt = sitePage.publishedAt?.toISOString() ?? null
    initialVersions = await sitePageService.listPublishedVersions(tenantId, resolvedSlug)
  }

  const activeSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'

  return (
    <WebsiteBuilder
      tenantSlug={tenantSlug}
      tenantName={BASE_TEMPLATE_TENANT_NAME}
      builderScope='base_template'
      initialPageSlug={activeSlug}
      initialPages={initialPages}
      initialPageTitle={initialPageTitle}
      initialDraftBlocks={initialDraftBlocks}
      initialPublishedBlocks={initialPublishedBlocks}
      initialSavedAt={initialSavedAt}
      initialPublishedAt={initialPublishedAt}
      initialDraftSiteStyles={initialDraftSiteStyles}
      initialPublishedSiteStyles={initialPublishedSiteStyles}
      initialVersions={initialVersions}
      isSiteStarted
      extraPageCount={initialPages.filter(page => page.slug !== 'home').length}
    />
  )
}
