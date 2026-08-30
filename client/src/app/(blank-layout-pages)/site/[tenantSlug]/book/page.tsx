import { notFound } from 'next/navigation'

import type { Metadata } from 'next'

import { PublicSiteAnalytics } from '@/features/your-space/components/PublicSiteAnalytics'
import { ServiceDirectoryBlock } from '@/features/your-space/components/blocks/ServiceDirectoryBlock'
import { ServiceBookingBlock } from '@/features/your-space/components/blocks/ServiceBookingBlock'
import type { ServiceBookingBlockProps } from '@/features/your-space/types'
import { sitePageService } from '@/services/site-page'

type PageProps = {
  params: Promise<{ tenantSlug: string }>
  searchParams: Promise<{ service?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params
  const site = await sitePageService.getPublicPageByTenantSlug(tenantSlug, 'home')

  return { title: site ? `Book · ${site.tenant.name}` : 'Booking' }
}

export default async function PublicBookingPage({ params, searchParams }: PageProps) {
  const { tenantSlug } = await params
  const { service } = await searchParams
  const site = await sitePageService.getPublicPageByTenantSlug(tenantSlug, 'home')

  if (!site) {
    notFound()
  }

  const props: ServiceBookingBlockProps = {
    serviceSlug: service ?? '',
    title: 'Book your appointment',
    subtitle: 'Choose an available service and time.',
    layout: 'inline',
    showServiceSummary: true,
    showTimezone: true,
    ctaLabel: 'Continue booking',
    alignment: 'left'
  }

  return (
    <>
      <PublicSiteAnalytics />
      {service ? (
        <ServiceBookingBlock props={props} />
      ) : (
        <ServiceDirectoryBlock
          props={{
            title: 'Choose a service',
            subtitle: 'Select a service to view available times.',
            serviceIds: [],
            category: '',
            layout: 'cards',
            showSearch: true,
            showCategory: true,
            showPrice: true,
            showDuration: true,
            showAvailability: true,
            ctaLabel: 'View times',
            alignment: 'left'
          }}
        />
      )}
    </>
  )
}
