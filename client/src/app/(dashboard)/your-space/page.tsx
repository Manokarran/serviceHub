import { redirect } from 'next/navigation'

import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { WebsiteBuilder } from '@/features/your-space/components/WebsiteBuilder'
import { auth } from '@/lib/auth'
import { sitePageService } from '@/services/site-page'
import { siteWorkspaceService } from '@/services/site-workspace'

type PageProps = {
  searchParams: Promise<{ p?: string }>
}

export default async function YourSpacePage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete) {
    redirect('/register')
  }

  const { user } = session
  const { p: pageParam } = await searchParams
  const initialPageSlug = pageParam?.trim() || 'home'

  let initialDraftBlocks: Block[] | null = null
  let initialPublishedBlocks: Block[] = []
  let initialPageTitle = 'Home'
  let initialSavedAt: string | null = null
  let initialPublishedAt: string | null = null
  let initialDraftSiteStyles: SiteStyles | null = null
  let initialPublishedSiteStyles: SiteStyles | null = null
  let initialVersions: Awaited<ReturnType<typeof sitePageService.listPublishedVersions>> = []
  let initialPages: Awaited<ReturnType<typeof sitePageService.listPages>> = []

  if (user.tenantId) {
    initialPages = await sitePageService.listPages(user.tenantId)

    const resolvedSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'
    const sitePage = await sitePageService.getPage(user.tenantId, resolvedSlug)

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
      initialVersions = await sitePageService.listPublishedVersions(user.tenantId, resolvedSlug)
    }
  }

  const tenantSlug = user.tenantSlug ?? 'default'
  const activeSlug = initialPages.some(page => page.slug === initialPageSlug) ? initialPageSlug : 'home'

  let isSiteStarted = false
  let extraPageCount = 0

  if (user.tenantId) {
    const workspaceStatus = await siteWorkspaceService.getStatus(user.tenantId)

    isSiteStarted = workspaceStatus.isSiteStarted
    extraPageCount = initialPages.filter(page => page.slug !== 'home').length
  }

  return (
    <WebsiteBuilder
      tenantSlug={tenantSlug}
      tenantName={user.tenantName ?? 'Your Workspace'}
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
      isSiteStarted={isSiteStarted}
      extraPageCount={extraPageCount}
    />
  )
}
