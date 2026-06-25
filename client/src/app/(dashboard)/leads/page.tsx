import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { contactService } from '@/services/contact/contact.service'
import { LeadsPageClient } from '@/features/leads/components/LeadsPageClient'

export default async function LeadsPage() {
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
