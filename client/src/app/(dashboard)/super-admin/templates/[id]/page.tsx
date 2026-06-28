import { redirect, notFound } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { getSiteTemplateAction } from '@/app/actions/site-template.actions'
import { TemplateDetailView } from '@/features/site-templates/components/TemplateDetailView'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SuperAdminTemplateDetailPage({ params }: Props) {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const { id } = await params
  const result = await getSiteTemplateAction(id)

  if (!result.success) {
    notFound()
  }

  return <TemplateDetailView template={result.template} />
}
