import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PublicSiteAnalytics } from '@/features/your-space/components/PublicSiteAnalytics'
import { PublicSiteEmptyState } from '@/features/your-space/components/PublicSiteEmptyState'
import { PublicSiteRenderer } from '@/features/your-space/components/PublicSiteRenderer'
import { DEFAULT_SITE_STYLES } from '@/features/your-space/constants/siteStylePresets'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { normalizeBlocks } from '@/features/your-space/utils/blockMigration'
import { mergeSiteStyles } from '@/features/your-space/utils/siteStylesHelpers'
import { sitePageService } from '@/services/site-page'

type PageProps = {
  params: Promise<{ tenantSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params
  const site = await sitePageService.getPublicPageByTenantSlug(tenantSlug, 'home')

  if (!site) {
    return { title: 'Sidhiyana' }
  }

  return {
    title: site.tenant.name,
    description: site.page.description || `Welcome to ${site.tenant.name}`
  }
}

export default async function PublicSiteHomePage({ params }: PageProps) {
  const { tenantSlug } = await params
  const site = await sitePageService.getPublicPageByTenantSlug(tenantSlug, 'home')

  if (!site) {
    notFound()
  }

  const blocks = normalizeBlocks(JSON.parse(JSON.stringify(site.blocks)) as Block[])
  const siteStyles = mergeSiteStyles(
    site.siteStyles ? (JSON.parse(JSON.stringify(site.siteStyles)) as Partial<SiteStyles>) : {},
    DEFAULT_SITE_STYLES
  )

  if (blocks.length === 0) {
    return (
      <>
        <PublicSiteAnalytics />
        <PublicSiteEmptyState tenantName={site.tenant.name} pageTitle={site.page.title} />
      </>
    )
  }

  return (
    <>
      <PublicSiteAnalytics />
      <PublicSiteRenderer blocks={blocks} siteStyles={siteStyles} tenantLocation={site.tenant.location} />
    </>
  )
}
