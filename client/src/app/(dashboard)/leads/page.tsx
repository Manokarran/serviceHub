import { redirect } from 'next/navigation'

import { isManagerRole } from '@/lib/constants/roles'
import { requireOpenTenantOrRedirect } from '@/lib/auth/require-approved-tenant-page'
import { contactService } from '@/services/contact/contact.service'
import { LeadsPageClient } from '@/features/leads/components/LeadsPageClient'

export default async function LeadsPage() {
  const { session } = await requireOpenTenantOrRedirect()

  if (!session.user.tenantId || !isManagerRole(session.user.role)) {
    redirect('/home')
  }

  const [leads, settings] = await Promise.all([
    contactService.listSubmissions(session.user.tenantId, 'all'),
    contactService.getContactSettings(session.user.tenantId)
  ])

  const counts = {
    all: leads.length,
    new: leads.filter(lead => lead.status === 'new').length,
    read: leads.filter(lead => lead.status === 'read').length,
    archived: leads.filter(lead => lead.status === 'archived').length
  }

  return <LeadsPageClient initialLeads={leads} initialSettings={settings} initialCounts={counts} />
}
