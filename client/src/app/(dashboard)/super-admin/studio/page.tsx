import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { listAllSiteTemplatesAction } from '@/app/actions/site-template.actions'
import { SuperAdminStudioView } from '@/features/site-templates/components/SuperAdminStudioView'

export default async function SuperAdminStudioPage() {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const result = await listAllSiteTemplatesAction()

  return <SuperAdminStudioView templates={result.success ? result.templates : []} />
}
