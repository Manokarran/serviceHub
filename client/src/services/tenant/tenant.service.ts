import { serverEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { getSuperAdminEmails } from '@/lib/auth/super-admin'
import { DEFAULT_SIGNUP_CREDITS } from '@/lib/constants/credits'
import { completeRegistrationSchema, type CompleteRegistrationInput } from '@/lib/validators'
import { slugify } from '@/lib/utils/slug'
import { isReservedTenantSlug } from '@/lib/utils/tenant-slug'
import { creditLedgerRepository, platformSettingsRepository, tenantRepository, userRepository } from '@/repositories'
import { emailService } from '@/services/email/email.service'
import { sitePageService } from '@/services/site-page'
import { siteTemplateService } from '@/services/site-template'

export class TenantService {
  async completeRegistration(userId: string, input: CompleteRegistrationInput) {
    const parsed = completeRegistrationSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid registration data', 400, 'VALIDATION_ERROR')
    }

    const user = await userRepository.findById(userId)

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    if (user.tenantId) {
      throw new AppError('Registration is already complete', 409, 'ALREADY_REGISTERED')
    }

    const { companyName } = parsed.data
    const slug = parsed.data.slug || slugify(companyName)
    const templateId = parsed.data.templateId

    if (!slug) {
      throw new AppError('Enter a valid workspace slug', 400, 'INVALID_SLUG')
    }

    if (isReservedTenantSlug(slug)) {
      throw new AppError('This workspace slug is reserved', 409, 'SLUG_RESERVED')
    }

    const existingTenant = await tenantRepository.findBySlug(slug)

    if (existingTenant) {
      throw new AppError('This workspace slug is already taken', 409, 'SLUG_EXISTS')
    }

    let signupCredits = DEFAULT_SIGNUP_CREDITS

    try {
      const settings = await platformSettingsRepository.getCreditSettings()

      signupCredits = settings.defaultSignupCredits
    } catch (error) {
      console.error('[TenantService] Failed to load credit settings — using default signup credits', error)
    }

    const tenant = await tenantRepository.create({
      name: companyName,
      slug,
      approvalStatus: 'pending',
      creditsBalance: signupCredits
    })

    try {
      const updatedUser = await userRepository.assignTenant(userId, tenant._id)

      if (!updatedUser) {
        throw new AppError('Failed to link organization to your account', 500, 'REGISTRATION_FAILED')
      }

      if (signupCredits > 0) {
        try {
          await creditLedgerRepository.create({
            tenantId: tenant._id.toString(),
            delta: signupCredits,
            balanceAfter: signupCredits,
            reason: 'signup_grant',
            description: `Welcome pack — ${signupCredits} credits`
          })
        } catch (error) {
          console.error('[TenantService] Failed to write signup credit ledger', error)
        }
      }

      try {
        await sitePageService.ensureBaseWebsitePages(tenant._id.toString())
      } catch (error) {
        console.error('[TenantService] Failed to create default website pages', error)
      }

      if (templateId) {
        try {
          await siteTemplateService.applyTemplateToTenant(templateId, tenant._id.toString())
        } catch (error) {
          console.error('[TenantService] Failed to apply site template', error)
        }
      }

      await this.notifySuperAdminsOfRegistration({
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        ownerName: user.name,
        ownerEmail: user.email
      })

      return { tenantId: tenant._id.toString(), slug: tenant.slug }
    } catch (error) {
      await userRepository.clearTenant(userId)
      await tenantRepository.deleteById(tenant._id.toString())
      throw error
    }
  }

  private async notifySuperAdminsOfRegistration(payload: {
    tenantName: string
    tenantSlug: string
    ownerName: string
    ownerEmail: string
  }) {
    const recipients = getSuperAdminEmails()

    if (recipients.length === 0) {
      console.warn('[TenantService] No SUPER_ADMIN emails configured — skipping registration notification')

      return
    }

    const reviewUrl = `${serverEnv.appUrl.replace(/\/$/, '')}/super-admin/requests`

    await Promise.all(
      recipients.map(async email => {
        try {
          await emailService.sendRegistrationRequestNotification(email, {
            ...payload,
            reviewUrl
          })
        } catch (error) {
          console.error(`[TenantService] Failed to email super admin ${email}`, error)
        }
      })
    )
  }
}

export const tenantService = new TenantService()
