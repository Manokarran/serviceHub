import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { AppError } from '@/lib/errors'
import { toPlainJson } from '@/lib/utils/plain-json'
import { saveSitePageSchema } from '@/lib/validators/site-page.validator'
import type { PublishedVersionSummary } from '@/models/site-page'
import { sitePageRepository, sitePageVersionRepository } from '@/repositories/site-page.repository'
import { tenantRepository } from '@/repositories/tenant.repository'

function parsePagePayload(blocks: Block[], siteStyles?: SiteStyles) {
  const parsed = saveSitePageSchema.safeParse({ blocks, siteStyles })

  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid page data', 400, 'VALIDATION_ERROR')
  }

  return parsed.data
}

function assertTenantId(tenantId: string) {
  if (!tenantId) {
    throw new AppError('Tenant is required', 400, 'TENANT_REQUIRED')
  }
}

export class SitePageService {
  async getHomePage(tenantId: string) {
    assertTenantId(tenantId)

    const page = await sitePageRepository.findByTenantAndSlug(tenantId, 'home')

    if (!page) {
      return null
    }

    return {
      draftBlocks: (page.draftBlocks ?? []) as unknown as Block[],
      publishedBlocks: (page.publishedBlocks ?? []) as unknown as Block[],
      draftSiteStyles: (page.draftSiteStyles ?? null) as SiteStyles | null,
      publishedSiteStyles: (page.publishedSiteStyles ?? null) as SiteStyles | null,
      draftUpdatedAt: page.draftUpdatedAt ?? page.updatedAt,
      publishedAt: page.publishedAt ?? null,
      updatedAt: page.updatedAt
    }
  }

  async getPublicHomePageByTenantSlug(tenantSlug: string) {
    const tenant = await tenantRepository.findBySlug(tenantSlug)

    if (!tenant) {
      return null
    }

    const page = await sitePageRepository.findByTenantAndSlug(tenant._id.toString(), 'home')

    return {
      tenant: {
        name: tenant.name,
        slug: tenant.slug
      },
      blocks: (page?.publishedBlocks ?? []) as unknown as Block[],
      siteStyles: (page?.publishedSiteStyles ?? null) as SiteStyles | null
    }
  }

  async saveDraft(tenantId: string, blocks: Block[], siteStyles?: SiteStyles) {
    assertTenantId(tenantId)

    const payload = parsePagePayload(blocks, siteStyles)

    return sitePageRepository.saveDraft(tenantId, payload.blocks, 'home', payload.siteStyles ?? null)
  }

  async publish(tenantId: string, userId: string, blocks: Block[], siteStyles?: SiteStyles) {
    assertTenantId(tenantId)

    const payload = parsePagePayload(blocks, siteStyles)

    await sitePageRepository.publishDraft(tenantId, payload.blocks, 'home', payload.siteStyles ?? null)
    await sitePageVersionRepository.createVersion(tenantId, 'home', payload.blocks, userId)

    const page = await sitePageRepository.findByTenantAndSlug(tenantId, 'home')

    if (!page) {
      throw new AppError('Failed to publish page', 500, 'PUBLISH_FAILED')
    }

    return page
  }

  async listPublishedVersions(tenantId: string): Promise<PublishedVersionSummary[]> {
    assertTenantId(tenantId)

    const versions = await sitePageVersionRepository.listVersions(tenantId, 'home')

    return versions.map(version => ({
      id: version._id.toString(),
      publishedAt: version.publishedAt.toISOString(),
      blockCount: version.blocks.length
    }))
  }

  async restoreVersionToDraft(tenantId: string, versionId: string) {
    assertTenantId(tenantId)

    const version = await sitePageVersionRepository.findVersionById(tenantId, versionId)

    if (!version) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND')
    }

    const page = await sitePageRepository.restoreDraft(tenantId, version.blocks, 'home')

    return {
      blocks: toPlainJson(version.blocks) as unknown as Block[],
      draftUpdatedAt: page.draftUpdatedAt ?? page.updatedAt
    }
  }
}

export const sitePageService = new SitePageService()
