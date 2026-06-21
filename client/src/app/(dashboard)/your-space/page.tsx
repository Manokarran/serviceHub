import { redirect } from 'next/navigation'

import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { WebsiteBuilder } from '@/features/your-space/components/WebsiteBuilder'
import { auth } from '@/lib/auth'
import { getPublicSiteDisplayUrl, getPublicSiteUrl } from '@/lib/utils/public-site-url'
import { sitePageService } from '@/services/site-page'

export default async function YourSpacePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete) {
    redirect('/register')
  }

  const { user } = session

  let initialDraftBlocks: Block[] | null = null
  let initialPublishedBlocks: Block[] = []
  let initialSavedAt: string | null = null
  let initialPublishedAt: string | null = null
  let initialDraftSiteStyles: SiteStyles | null = null
  let initialPublishedSiteStyles: SiteStyles | null = null
  let initialVersions: Awaited<ReturnType<typeof sitePageService.listPublishedVersions>> = []

  if (user.tenantId) {
    const sitePage = await sitePageService.getHomePage(user.tenantId)

    if (sitePage) {
      initialDraftBlocks = JSON.parse(JSON.stringify(sitePage.draftBlocks)) as Block[]
      initialPublishedBlocks = JSON.parse(JSON.stringify(sitePage.publishedBlocks)) as Block[]
      initialDraftSiteStyles = sitePage.draftSiteStyles
        ? (JSON.parse(JSON.stringify(sitePage.draftSiteStyles)) as SiteStyles)
        : null
      initialPublishedSiteStyles = sitePage.publishedSiteStyles
        ? (JSON.parse(JSON.stringify(sitePage.publishedSiteStyles)) as SiteStyles)
        : null
      initialSavedAt = sitePage.draftUpdatedAt.toISOString()
      initialPublishedAt = sitePage.publishedAt?.toISOString() ?? null
    }

    initialVersions = await sitePageService.listPublishedVersions(user.tenantId)
  }

  const tenantSlug = user.tenantSlug ?? 'default'

  return (
    <WebsiteBuilder
      tenantSlug={tenantSlug}
      tenantName={user.tenantName ?? 'Your Workspace'}
      siteUrl={getPublicSiteUrl(tenantSlug)}
      displayUrl={getPublicSiteDisplayUrl(tenantSlug)}
      initialDraftBlocks={initialDraftBlocks}
      initialPublishedBlocks={initialPublishedBlocks}
      initialSavedAt={initialSavedAt}
      initialPublishedAt={initialPublishedAt}
      initialDraftSiteStyles={initialDraftSiteStyles}
      initialPublishedSiteStyles={initialPublishedSiteStyles}
      initialVersions={initialVersions}
    />
  )
}
