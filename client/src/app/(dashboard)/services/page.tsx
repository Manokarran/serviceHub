import { redirect } from 'next/navigation'

import { isManagerRole } from '@/lib/constants/roles'
import { requireOpenTenantOrRedirect } from '@/lib/auth/require-approved-tenant-page'
import { serviceCatalogService } from '@/services/booking/service-catalog.service'
import { tenantProfileService } from '@/services/tenant'
import { ServicesPageClient } from '@/features/services/components/ServicesPageClient'

export default async function ServicesPage() {
  const { session } = await requireOpenTenantOrRedirect()

  if (!session.user.tenantId || !isManagerRole(session.user.role)) {
    redirect('/home')
  }

  const [services, profile] = await Promise.all([
    serviceCatalogService.listServices(session.user.tenantId),
    tenantProfileService.getProfile(session.user.tenantId)
  ])

  return (
    <ServicesPageClient
      initialServices={services}
      tenantSlug={session.user.tenantSlug ?? ''}
      siteDefaults={{
        timezone: profile.defaultTimezone,
        currency: profile.defaultCurrency
      }}
    />
  )
}
