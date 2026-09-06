import { redirect } from 'next/navigation'

import { listTenantRegistrationRequestsAction } from '@/app/actions/tenant-approval.actions'
import { RegistrationRequestsClient } from '@/features/admin/components/RegistrationRequestsClient'
import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'

export const dynamic = 'force-dynamic'

export default async function SuperAdminRequestsPage() {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const result = await listTenantRegistrationRequestsAction('all')

  if (!result.success) {
    redirect('/super-admin')
  }

  return (
    <RegistrationRequestsClient initialRequests={result.requests} pendingCount={result.pendingCount} />
  )
}
