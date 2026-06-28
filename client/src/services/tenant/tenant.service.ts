import { AppError } from '@/lib/errors'
import { completeRegistrationSchema, type CompleteRegistrationInput } from '@/lib/validators'
import { slugify } from '@/lib/utils/slug'
import { tenantRepository, userRepository } from '@/repositories'
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

    const existingTenant = await tenantRepository.findBySlug(slug)

    if (existingTenant) {
      throw new AppError('This workspace slug is already taken', 409, 'SLUG_EXISTS')
    }

    const tenant = await tenantRepository.create({
      name: companyName,
      slug
    })

    try {
      const updatedUser = await userRepository.assignTenant(userId, tenant._id)

      if (!updatedUser) {
        throw new AppError('Failed to link organization to your account', 500, 'REGISTRATION_FAILED')
      }

      try {
        await sitePageService.ensureContactPage(tenant._id.toString())
      } catch (error) {
        console.error('[TenantService] Failed to create default contact page', error)
      }

      if (templateId) {
        try {
          await siteTemplateService.applyTemplateToTenant(templateId, tenant._id.toString())
        } catch (error) {
          console.error('[TenantService] Failed to apply site template', error)
        }
      }

      return { tenantId: tenant._id.toString(), slug: tenant.slug }
    } catch (error) {
      await tenantRepository.deleteById(tenant._id.toString())
      throw error
    }
  }
}

export const tenantService = new TenantService()
