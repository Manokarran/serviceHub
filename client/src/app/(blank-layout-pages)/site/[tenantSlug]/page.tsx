import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PublicSiteEmptyState } from '@/features/your-space/components/PublicSiteEmptyState'
import { PublicSiteRenderer } from '@/features/your-space/components/PublicSiteRenderer'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { sitePageService } from '@/services/site-page'

type PageProps = {
  params: Promise<{ tenantSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params
  const site = await sitePageService.getPublicHomePageByTenantSlug(tenantSlug)

  if (!site) {
    return { title: 'Site not found' }
  }

  return {
    title: site.tenant.name,
    description: `Welcome to ${site.tenant.name}`
  }
}

export default async function PublicSitePage({ params }: PageProps) {
  const { tenantSlug } = await params
  const site = await sitePageService.getPublicHomePageByTenantSlug(tenantSlug)

  if (!site) {
    notFound()
  }

  const blocks = JSON.parse(JSON.stringify(site.blocks)) as Block[]
  const siteStyles = site.siteStyles ? (JSON.parse(JSON.stringify(site.siteStyles)) as SiteStyles) : null

  if (blocks.length === 0) {
    return <PublicSiteEmptyState tenantName={site.tenant.name} />
  }

  return <PublicSiteRenderer blocks={blocks} siteStyles={siteStyles} />
}
