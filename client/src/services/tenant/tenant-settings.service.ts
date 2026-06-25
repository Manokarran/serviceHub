import { AppError } from '@/lib/errors'
import type { TenantContactSettingsInput } from '@/lib/validators/contact.validator'
import { tenantContactSettingsSchema } from '@/lib/validators/contact.validator'
import { tenantRepository } from '@/repositories'

export class TenantSettingsService {
  async updateContactSettings(tenantId: string, input: TenantContactSettingsInput) {
    const parsed = tenantContactSettingsSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid settings', 400, 'VALIDATION_ERROR')
    }

    const email = parsed.data.contactNotificationEmail?.trim()
    const subject = parsed.data.contactAutoReplySubject?.trim()
    const message = parsed.data.contactAutoReplyMessage?.trim()

    const tenant = await tenantRepository.updateSettings(tenantId, {
      contactNotificationEmail: email || '',
      ...(parsed.data.contactAutoReplyEnabled !== undefined
        ? { contactAutoReplyEnabled: parsed.data.contactAutoReplyEnabled }
        : {}),
      ...(subject !== undefined ? { contactAutoReplySubject: subject || '' } : {}),
      ...(message !== undefined ? { contactAutoReplyMessage: message || '' } : {})
    })

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    return {
      contactNotificationEmail: tenant.settings?.contactNotificationEmail ?? '',
      contactAutoReplyEnabled: tenant.settings?.contactAutoReplyEnabled ?? false,
      contactAutoReplySubject: tenant.settings?.contactAutoReplySubject ?? '',
      contactAutoReplyMessage: tenant.settings?.contactAutoReplyMessage ?? ''
    }
  }
}

export const tenantSettingsService = new TenantSettingsService()
