import { notFound, redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { AppError } from '@/lib/errors'
import { serviceCatalogService } from '@/services/booking/service-catalog.service'
import { ServiceStudio } from '@/features/services/components/ServiceStudio'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ServiceStudioPage({ params }: Props) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.registrationComplete) {
    redirect('/register')
  }

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
