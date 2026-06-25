import { AppError } from '@/lib/errors'
import {
  DEFAULT_CONTACT_AUTO_REPLY_MESSAGE,
  DEFAULT_CONTACT_AUTO_REPLY_SUBJECT,
  renderContactAutoReplyTemplate
} from '@/lib/constants/contact'
import type { ContactFormSubmitInput, TenantContactSettingsInput } from '@/lib/validators/contact.validator'
import type { ContactLeadFilter, ContactSubmissionStatus, ContactSubmissionSummary } from '@/models/contact-submission'
import { contactSubmissionRepository, tenantRepository, userRepository } from '@/repositories'
import { emailService } from '@/services/email/email.service'

export type ContactSettingsView = {
  contactNotificationEmail: string
  defaultOwnerEmail: string
  contactAutoReplyEnabled: boolean
  contactAutoReplySubject: string
  contactAutoReplyMessage: string
}

export class ContactService {
  async resolveNotificationEmail(tenantId: string): Promise<string | null> {
    const tenant = await tenantRepository.findById(tenantId)

    if (!tenant) {
      return null
    }

    const override = tenant.settings?.contactNotificationEmail?.trim()

    if (override) {
      return override.toLowerCase()
    }

    const owner = await userRepository.findOwnerByTenantId(tenantId)

    return owner?.email?.toLowerCase() ?? null
  }

  async submitPublicContactForm(input: ContactFormSubmitInput) {
    if (input.website) {
      throw new AppError('Invalid submission', 400, 'SPAM_DETECTED')
    }

    const tenant = await tenantRepository.findBySlug(input.tenantSlug)

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    const notificationEmail = await this.resolveNotificationEmail(tenant._id.toString())

    if (!notificationEmail) {
      throw new AppError('Contact form is not configured for this organization', 503, 'NO_RECIPIENT')
    }

    const submission = await contactSubmissionRepository.create({
      tenantId: tenant._id,
      blockId: input.blockId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email.toLowerCase(),
      phone: input.phone?.trim() || undefined,
      description: input.description,
      wantsSignup: input.wantsSignup,
      notificationEmail,
      emailSent: false,
      autoReplySent: false,
      status: 'new'
    })

    let emailSent = false
    let autoReplySent = false

    try {
      emailSent = await emailService.sendContactNotification(notificationEmail, {
        tenantName: tenant.name,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        description: input.description,
        wantsSignup: input.wantsSignup
      })

      if (emailSent) {
        await contactSubmissionRepository.markEmailSent(submission._id.toString())
      }
    } catch (error) {
      console.error('[ContactService] Failed to send notification email', error)
    }

    if (tenant.settings?.contactAutoReplyEnabled) {
      try {
        const subject =
          tenant.settings.contactAutoReplySubject?.trim() || DEFAULT_CONTACT_AUTO_REPLY_SUBJECT
        const messageTemplate =
          tenant.settings.contactAutoReplyMessage?.trim() || DEFAULT_CONTACT_AUTO_REPLY_MESSAGE

        autoReplySent = await emailService.sendContactAutoReply(input.email, {
          subject,
          message: renderContactAutoReplyTemplate(messageTemplate, {
            firstName: input.firstName,
            tenantName: tenant.name
          }),
          tenantName: tenant.name
        })

        if (autoReplySent) {
          await contactSubmissionRepository.markAutoReplySent(submission._id.toString())
        }
      } catch (error) {
        console.error('[ContactService] Failed to send auto-reply email', error)
      }
    }

    return {
      submissionId: submission._id.toString(),
      emailSent,
      autoReplySent
    }
  }

  async listSubmissions(tenantId: string, filter: ContactLeadFilter = 'all'): Promise<ContactSubmissionSummary[]> {
    return contactSubmissionRepository.listByTenantId(tenantId, { filter })
  }

  async updateLeadStatus(tenantId: string, leadId: string, status: ContactSubmissionStatus) {
    const updated = await contactSubmissionRepository.updateStatus(tenantId, leadId, status)

    if (!updated) {
      throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND')
    }

    return updated
  }

  async getContactSettings(tenantId: string): Promise<ContactSettingsView> {
    const tenant = await tenantRepository.findById(tenantId)

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    const owner = await userRepository.findOwnerByTenantId(tenantId)
    const override = tenant.settings?.contactNotificationEmail?.trim()

    return {
      contactNotificationEmail: override ?? '',
      defaultOwnerEmail: owner?.email ?? '',
      contactAutoReplyEnabled: tenant.settings?.contactAutoReplyEnabled ?? false,
      contactAutoReplySubject:
        tenant.settings?.contactAutoReplySubject?.trim() || DEFAULT_CONTACT_AUTO_REPLY_SUBJECT,
      contactAutoReplyMessage:
        tenant.settings?.contactAutoReplyMessage?.trim() || DEFAULT_CONTACT_AUTO_REPLY_MESSAGE
    }
  }

  exportSubmissionsCsv(submissions: ContactSubmissionSummary[]): string {
    const header = [
      'Date',
      'Status',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Wants Signup',
      'Description',
      'Admin Notified',
      'Auto Reply Sent'
    ]
    const rows = submissions.map(item => [
      item.createdAt,
      item.status,
      item.firstName,
      item.lastName,
      item.email,
      item.phone ?? '',
      item.wantsSignup ? 'Yes' : 'No',
      item.description.replace(/"/g, '""'),
      item.emailSent ? 'Yes' : 'No',
      item.autoReplySent ? 'Yes' : 'No'
    ])

    return [header, ...rows]
      .map(columns => columns.map(value => `"${value}"`).join(','))
      .join('\n')
  }
}

export const contactService = new ContactService()
