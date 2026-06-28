import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { listAllSiteTemplatesAction } from '@/app/actions/site-template.actions'
import { SuperAdminTemplatesView } from '@/features/site-templates/components/SuperAdminTemplatesView'

export default async function SuperAdminTemplatesPage() {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const result = await listAllSiteTemplatesAction()

  if (!result.success) {
    return <p>{result.error}</p>
  }

  return <SuperAdminTemplatesView initialTemplates={result.templates} />
}
