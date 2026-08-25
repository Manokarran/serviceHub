import type { TenantPlan, TenantStatus } from '@/lib/constants/tenant'
import { AppError } from '@/lib/errors'
import { isReservedTenantSlug } from '@/lib/utils/tenant-slug'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { UpdateTenantProfileInput } from '@/lib/validators/tenant-profile.validator'
import { checkTenantSlugSchema, updateTenantProfileSchema } from '@/lib/validators/tenant-profile.validator'
import { sitePageRepository, tenantRepository } from '@/repositories'
import {
  applyCompanyBrandToBlocks,
  blocksJsonEqual,
  rewritePublicSiteSlugInBlocks
} from '@/services/tenant/tenant-brand'

export type TenantSlugAvailability = {
  available: boolean
  slug: string
  reason?: 'invalid' | 'reserved' | 'taken' | 'current'
}

export type TenantProfileView = {
  companyName: string
  slug: string
  plan: TenantPlan
  status: TenantStatus
  logoUrl: string
  createdAt: string
  isSystemTenant: boolean
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === 11000)
}

function toProfileView(tenant: NonNullable<Awaited<ReturnType<typeof tenantRepository.findById>>>): TenantProfileView {
  return {
    companyName: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    status: tenant.status,
    logoUrl: tenant.settings?.logoUrl ?? '',
    createdAt: tenant.createdAt.toISOString(),
    isSystemTenant: tenant.settings?.kind === 'base_template'
  }
}

export class TenantProfileService {
  async getProfile(tenantId: string): Promise<TenantProfileView> {
    const tenant = await tenantRepository.findById(tenantId)

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    return toProfileView(tenant)
  }

  async checkSlugAvailability(tenantId: string, slugInput: string): Promise<TenantSlugAvailability> {
    const parsed = checkTenantSlugSchema.safeParse({ slug: slugInput })

    if (!parsed.success) {
      return {
        available: false,
        slug: slugInput,
        reason: 'invalid'
      }
    }

    const slug = parsed.data.slug

    if (isReservedTenantSlug(slug)) {
      return { available: false, slug, reason: 'reserved' }
    }

    const tenant = await tenantRepository.findById(tenantId)

    if (tenant && tenant.slug === slug) {
      return { available: true, slug, reason: 'current' }
    }

    const taken = await tenantRepository.isSlugTaken(slug, tenantId)

    if (taken) {
      return { available: false, slug, reason: 'taken' }
    }

    return { available: true, slug }
  }

  async updateProfile(tenantId: string, input: UpdateTenantProfileInput): Promise<TenantProfileView> {
    const parsed = updateTenantProfileSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid profile data', 400, 'VALIDATION_ERROR')
    }

    const tenant = await tenantRepository.findById(tenantId)

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    const nextName = parsed.data.companyName
    const nextSlug = parsed.data.slug
    const nextLogoUrl = parsed.data.logoUrl
    const previousName = tenant.name
    const previousSlug = tenant.slug
    const previousLogoUrl = tenant.settings?.logoUrl ?? ''
    const isSystemTenant = tenant.settings?.kind === 'base_template'

    if (isSystemTenant && nextSlug !== previousSlug) {
      throw new AppError('This workspace URL cannot be changed', 403, 'SLUG_LOCKED')
    }

    if (isReservedTenantSlug(nextSlug)) {
      throw new AppError('This site URL is reserved', 409, 'SLUG_RESERVED')
    }

    if (nextSlug !== previousSlug) {
      const taken = await tenantRepository.isSlugTaken(nextSlug, tenantId)

      if (taken) {
        throw new AppError('This site URL is already taken', 409, 'SLUG_EXISTS')
      }
    }

    const nameOrSlugChanged = nextName !== previousName || nextSlug !== previousSlug

    if (nameOrSlugChanged) {
      try {
        const updated = await tenantRepository.updateNameAndSlug(tenantId, {
          name: nextName,
          slug: nextSlug
        })

        if (!updated) {
          throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
        }
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new AppError('This site URL is already taken', 409, 'SLUG_EXISTS')
        }

        throw error
      }
    }

    if (nextLogoUrl !== undefined && nextLogoUrl !== previousLogoUrl) {
      const updated = await tenantRepository.updateSettings(tenantId, { logoUrl: nextLogoUrl })

      if (!updated) {
        throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
      }
    }

    const slugChanged = nextSlug !== previousSlug
    const logoChanged = nextLogoUrl !== undefined && nextLogoUrl !== previousLogoUrl
    const brandChanged = nextName !== previousName || logoChanged

    if (slugChanged || brandChanged) {
      await this.syncWebsiteBlocks(tenantId, {
        previousName,
        nextName,
        previousSlug,
        nextSlug,
        previousLogoUrl,
        nextLogoUrl: logoChanged ? nextLogoUrl : undefined,
        slugChanged,
        brandChanged
      })
    }

    return this.getProfile(tenantId)
  }

  private async syncWebsiteBlocks(
    tenantId: string,
    options: {
      previousName: string
      nextName: string
      previousSlug: string
      nextSlug: string
      previousLogoUrl: string
      nextLogoUrl?: string
      slugChanged: boolean
      brandChanged: boolean
    }
  ) {
    const pages = await sitePageRepository.listByTenant(tenantId)

    for (const page of pages) {
      let draftBlocks = toPlainJson(page.draftBlocks ?? page.blocks ?? [])
      let publishedBlocks = toPlainJson(page.publishedBlocks ?? [])

      if (options.slugChanged) {
        draftBlocks = rewritePublicSiteSlugInBlocks(draftBlocks, options.previousSlug, options.nextSlug)
        publishedBlocks = rewritePublicSiteSlugInBlocks(publishedBlocks, options.previousSlug, options.nextSlug)
      }

      if (options.brandChanged) {
        const brand = {
          previousName: options.previousName,
          nextName: options.nextName,
          previousLogoUrl: options.previousLogoUrl,
          nextLogoUrl: options.nextLogoUrl
        }

        draftBlocks = applyCompanyBrandToBlocks(draftBlocks, brand)
        publishedBlocks = applyCompanyBrandToBlocks(publishedBlocks, brand)
      }

      const originalDraft = toPlainJson(page.draftBlocks ?? page.blocks ?? [])
      const originalPublished = toPlainJson(page.publishedBlocks ?? [])

      if (blocksJsonEqual(draftBlocks, originalDraft) && blocksJsonEqual(publishedBlocks, originalPublished)) {
        continue
      }

      await sitePageRepository.replaceBlockSets(tenantId, page.slug, draftBlocks, publishedBlocks)
    }
  }
}

export const tenantProfileService = new TenantProfileService()
