import { notFound, redirect } from 'next/navigation'

import { isManagerRole } from '@/lib/constants/roles'
import { requireOpenTenantOrRedirect } from '@/lib/auth/require-approved-tenant-page'
import { AppError } from '@/lib/errors'
import { serviceCatalogService } from '@/services/booking/service-catalog.service'
import { ServiceStudio } from '@/features/services/components/ServiceStudio'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ServiceStudioPage({ params }: Props) {
  const { session } = await requireOpenTenantOrRedirect()

  if (!session.user.tenantId || !isManagerRole(session.user.role)) {
    redirect('/home')
  }

  const { id } = await params

  try {
    const detail = await serviceCatalogService.getServiceDetail(session.user.tenantId, id)

    return <ServiceStudio initialDetail={detail} tenantSlug={session.user.tenantSlug ?? ''} />
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 404) {
      notFound()
    }

    throw error
  }
}
