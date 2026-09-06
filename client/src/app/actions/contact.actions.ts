'use server'

import { requireTenantWorkspace } from '@/lib/auth/require-tenant-workspace'
import { AppError } from '@/lib/errors'
import { isManagerRole } from '@/lib/constants/roles'
import type { ContactLeadFilter, ContactSubmissionSummary } from '@/models/contact-submission'
import type {
  ContactLeadFilterInput,
  TenantContactSettingsInput,
  UpdateLeadStatusInput
} from '@/lib/validators/contact.validator'
import { updateLeadStatusSchema } from '@/lib/validators/contact.validator'
import type { ContactSettingsView } from '@/services/contact/contact.service'
import { contactService } from '@/services/contact/contact.service'
import { tenantSettingsService } from '@/services/tenant/tenant-settings.service'

async function requireLeadManager() {
  const session = await requireTenantWorkspace()

  if (!session.user.tenantId || !isManagerRole(session.user.role)) {
    throw new AppError('You do not have permission to manage contact settings', 403, 'FORBIDDEN')
  }

  return session
}

type LeadsResult =
  | {
      success: true
      leads: ContactSubmissionSummary[]
      settings: ContactSettingsView
      counts: { all: number; new: number; read: number; archived: number }
    }
  | { success: false; error: string }

type SettingsResult =
  | { success: true; settings: ContactSettingsView }
  | { success: false; error: string }

type ExportResult = { success: true; csv: string; filename: string } | { success: false; error: string }

type LeadStatusResult =
  | { success: true; lead: ContactSubmissionSummary }
  | { success: false; error: string }

export async function getContactLeadsAction(filter: ContactLeadFilterInput = 'all'): Promise<LeadsResult> {
  try {
    const session = await requireLeadManager()

    const [allLeads, settings] = await Promise.all([
      contactService.listSubmissions(session.user.tenantId!, 'all'),
      contactService.getContactSettings(session.user.tenantId!)
    ])

    const leads = filter === 'all' ? allLeads : allLeads.filter(lead => lead.status === filter)

    const counts = {
      all: allLeads.length,
      new: allLeads.filter(lead => lead.status === 'new').length,
      read: allLeads.filter(lead => lead.status === 'read').length,
      archived: allLeads.filter(lead => lead.status === 'archived').length
    }

    return { success: true, leads, settings, counts }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[getContactLeadsAction]', error)

    return { success: false, error: 'Failed to load leads.' }
  }
}

export async function updateContactSettingsAction(
  input: TenantContactSettingsInput
): Promise<SettingsResult> {
  try {
    const session = await requireLeadManager()

    await tenantSettingsService.updateContactSettings(session.user.tenantId!, input)
    const settings = await contactService.getContactSettings(session.user.tenantId!)

    return { success: true, settings }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[updateContactSettingsAction]', error)

    return { success: false, error: 'Failed to update contact settings.' }
  }
}

export async function updateLeadStatusAction(input: UpdateLeadStatusInput): Promise<LeadStatusResult> {
  try {
    const session = await requireLeadManager()
    const parsed = updateLeadStatusSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' }
    }

    const lead = await contactService.updateLeadStatus(
      session.user.tenantId!,
      parsed.data.leadId,
      parsed.data.status
    )

    return { success: true, lead }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[updateLeadStatusAction]', error)

    return { success: false, error: 'Failed to update lead.' }
  }
}

export async function exportContactLeadsAction(filter: ContactLeadFilterInput = 'all'): Promise<ExportResult> {
  try {
    const session = await requireLeadManager()
    const leads = await contactService.listSubmissions(session.user.tenantId!, filter as ContactLeadFilter)
    const csv = contactService.exportSubmissionsCsv(leads)
    const slug = session.user.tenantSlug ?? 'leads'
    const date = new Date().toISOString().slice(0, 10)

    return {
      success: true,
      csv,
      filename: `${slug}-contact-leads-${date}.csv`
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[exportContactLeadsAction]', error)

    return { success: false, error: 'Failed to export leads.' }
  }
}
