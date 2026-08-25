import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { createAboutPageBlocks, createContactPageBlocks } from '@/features/your-space/constants/pageTemplates'
import { AppError } from '@/lib/errors'
import { ensureUniqueSlug, isHomePageSlug, isReservedPageSlug, slugifyPageTitle } from '@/lib/utils/page-slug'
import { toPlainJson } from '@/lib/utils/plain-json'
import { createPageSchema, saveSitePageSchema, updatePageMetaSchema } from '@/lib/validators/site-page.validator'
import type { PublishedVersionSummary, SitePageSummary, ISitePageBlock } from '@/models/site-page'
import { sitePageRepository, sitePageVersionRepository } from '@/repositories/site-page.repository'
import { tenantRepository } from '@/repositories/tenant.repository'
import { siteWorkspaceService } from '@/services/site-workspace'

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

function mapPageToSummary(page: {
  slug: string
  title?: string
  description?: string
  sortOrder?: number
  draftBlocks?: unknown[]
  publishedBlocks?: unknown[]
  publishedAt?: Date | null
}): SitePageSummary {
  const draftBlocks = page.draftBlocks ?? []
  const publishedBlocks = page.publishedBlocks ?? []

  return {
    slug: page.slug,
    title: page.title ?? (isHomePageSlug(page.slug) ? 'Home' : page.slug),
    description: page.description ?? '',
    sortOrder: page.sortOrder ?? 0,
    isHome: isHomePageSlug(page.slug),
    publishedAt: page.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: JSON.stringify(draftBlocks) !== JSON.stringify(publishedBlocks),
    blockCount: draftBlocks.length
  }
}

function formatPageData(page: NonNullable<Awaited<ReturnType<typeof sitePageRepository.findByTenantAndSlug>>>) {
  return {
    slug: page.slug,
    title: page.title ?? (isHomePageSlug(page.slug) ? 'Home' : page.slug),
    description: page.description ?? '',
    sortOrder: page.sortOrder ?? 0,
    isHome: isHomePageSlug(page.slug),
    draftBlocks: (page.draftBlocks ?? []) as unknown as Block[],
    publishedBlocks: (page.publishedBlocks ?? []) as unknown as Block[],
    draftSiteStyles: (page.draftSiteStyles ?? null) as SiteStyles | null,
    publishedSiteStyles: (page.publishedSiteStyles ?? null) as SiteStyles | null,
    draftUpdatedAt: page.draftUpdatedAt ?? page.updatedAt,
    publishedAt: page.publishedAt ?? null,
    updatedAt: page.updatedAt
  }
}

export class SitePageService {
  async ensureHomePage(tenantId: string) {
    assertTenantId(tenantId)

    const existing = await sitePageRepository.findByTenantAndSlug(tenantId, 'home')

    if (existing) {
      return existing
    }

    return sitePageRepository.createPage(tenantId, 'home', 'Home', 0)
  }

  async listPages(tenantId: string): Promise<SitePageSummary[]> {
    assertTenantId(tenantId)

    await this.ensureHomePage(tenantId)

    const pages = await sitePageRepository.listByTenant(tenantId)

    return pages.map(mapPageToSummary)
  }

  async getPage(tenantId: string, slug = 'home') {
    assertTenantId(tenantId)

    if (isHomePageSlug(slug)) {
      await this.ensureHomePage(tenantId)
    }

    const page = await sitePageRepository.findByTenantAndSlug(tenantId, slug)

    if (!page) {
      return null
    }

    return formatPageData(page)
  }

  /** @deprecated Use getPage(tenantId, 'home') */
  async getHomePage(tenantId: string) {
    return this.getPage(tenantId, 'home')
  }

  async getGlobalSiteStyles(tenantId: string): Promise<SiteStyles | null> {
    const home = await this.getPage(tenantId, 'home')

    return home?.draftSiteStyles ?? home?.publishedSiteStyles ?? null
  }

  async getPublicPageByTenantSlug(tenantSlug: string, pageSlug = 'home') {
    const tenant = await tenantRepository.findBySlug(tenantSlug)

    if (!tenant) {
      return null
    }

    const page = await sitePageRepository.findByTenantAndSlug(tenant._id.toString(), pageSlug)

    if (!page) {
      return null
    }

    const homePage = isHomePageSlug(pageSlug)
      ? page
      : await sitePageRepository.findByTenantAndSlug(tenant._id.toString(), 'home')

    return {
      tenant: {
        name: tenant.name,
        slug: tenant.slug
      },
      page: {
        slug: page.slug,
        title: page.title ?? (isHomePageSlug(page.slug) ? 'Home' : page.slug),
        description: page.description ?? '',
        isHome: isHomePageSlug(page.slug)
      },
      blocks: (page.publishedBlocks ?? []) as unknown as Block[],
      siteStyles: (homePage?.publishedSiteStyles ?? page.publishedSiteStyles ?? null) as SiteStyles | null
    }
  }

  /** @deprecated Use getPublicPageByTenantSlug(tenantSlug, 'home') */
  async getPublicHomePageByTenantSlug(tenantSlug: string) {
    return this.getPublicPageByTenantSlug(tenantSlug, 'home')
  }

  async saveDraft(tenantId: string, slug: string, blocks: Block[], siteStyles?: SiteStyles) {
    assertTenantId(tenantId)

    const payload = parsePagePayload(blocks, siteStyles)
    const isHome = isHomePageSlug(slug)

    if (isHome) {
      return sitePageRepository.saveDraft(tenantId, payload.blocks, slug, payload.siteStyles ?? null)
    }

    return sitePageRepository.saveDraft(tenantId, payload.blocks, slug)
  }

  async publish(tenantId: string, userId: string, slug: string, blocks: Block[], siteStyles?: SiteStyles) {
    assertTenantId(tenantId)

    const payload = parsePagePayload(blocks, siteStyles)
    const isHome = isHomePageSlug(slug)

    if (isHome) {
      await sitePageRepository.publishDraft(tenantId, payload.blocks, slug, payload.siteStyles ?? null)
    } else {
      await sitePageRepository.publishDraft(tenantId, payload.blocks, slug)
    }

    await sitePageVersionRepository.createVersion(tenantId, slug, payload.blocks, userId)

    const page = await sitePageRepository.findByTenantAndSlug(tenantId, slug)

    if (!page) {
      throw new AppError('Failed to publish page', 500, 'PUBLISH_FAILED')
    }

    await siteWorkspaceService.markSiteStarted(tenantId)

    return page
  }

  async publishAll(tenantId: string, userId: string) {
    assertTenantId(tenantId)

    await this.ensureHomePage(tenantId)

    const pageDocs = await sitePageRepository.listByTenant(tenantId)
    let publishedAt = new Date()

    for (const pageDoc of pageDocs) {
      const slug = pageDoc.slug
      const draftBlocks = (pageDoc.draftBlocks?.length ? pageDoc.draftBlocks : pageDoc.blocks ?? []) as unknown as Block[]
      const isHome = isHomePageSlug(slug)
      const siteStyles = isHome
        ? ((pageDoc.draftSiteStyles ?? pageDoc.publishedSiteStyles ?? null) as SiteStyles | null)
        : undefined

      const page = await this.publish(
        tenantId,
        userId,
        slug,
        draftBlocks,
        siteStyles ?? undefined
      )

      publishedAt = page.publishedAt ?? page.updatedAt ?? publishedAt
    }

    return { publishedAt: publishedAt.toISOString() }
  }

  async listPublishedVersions(tenantId: string, pageSlug = 'home'): Promise<PublishedVersionSummary[]> {
    assertTenantId(tenantId)

    const versions = await sitePageVersionRepository.listVersions(tenantId, pageSlug)

    return versions.map(version => ({
      id: version._id.toString(),
      publishedAt: version.publishedAt.toISOString(),
      blockCount: version.blocks.length
    }))
  }

  async getPublishedVersion(tenantId: string, pageSlug: string, versionId: string) {
    const version = await this.findPublishedVersion(tenantId, pageSlug, versionId)

    return {
      blocks: toPlainJson(version.blocks) as unknown as Block[],
      publishedAt: version.publishedAt.toISOString()
    }
  }

  async restoreVersionToDraft(tenantId: string, pageSlug: string, versionId: string) {
    const version = await this.findPublishedVersion(tenantId, pageSlug, versionId)
    const page = await sitePageRepository.restoreDraft(tenantId, version.blocks, pageSlug)

    return {
      blocks: toPlainJson(version.blocks) as unknown as Block[],
      draftUpdatedAt: page.draftUpdatedAt ?? page.updatedAt
    }
  }

  private async findPublishedVersion(tenantId: string, pageSlug: string, versionId: string) {
    assertTenantId(tenantId)

    const version = await sitePageVersionRepository.findVersionById(tenantId, versionId)

    if (!version) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND')
    }

    if (version.pageSlug !== pageSlug) {
      throw new AppError('Version does not belong to this page', 400, 'VERSION_MISMATCH')
    }

    return version
  }

  async createPage(
    tenantId: string,
    input: { title: string; slug?: string; draftBlocks?: ISitePageBlock[] },
    options?: { markSiteStarted?: boolean }
  ) {
    assertTenantId(tenantId)

    const parsed = createPageSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid page data', 400, 'VALIDATION_ERROR')
    }

    const existingPages = await sitePageRepository.listByTenant(tenantId)
    const baseSlug = parsed.data.slug ?? slugifyPageTitle(parsed.data.title)

    if (isReservedPageSlug(baseSlug) && !isHomePageSlug(baseSlug)) {
      throw new AppError('This page URL is reserved', 400, 'RESERVED_SLUG')
    }

    const slug = ensureUniqueSlug(
      baseSlug,
      existingPages.map(page => page.slug)
    )

    const sortOrder = existingPages.length > 0 ? Math.max(...existingPages.map(p => p.sortOrder ?? 0)) + 1 : 1
    const draftBlocks = input.draftBlocks ?? []

    const page = await sitePageRepository.createPage(
      tenantId,
      slug,
      parsed.data.title,
      sortOrder,
      draftBlocks
    )

    const existingCount = existingPages.length

    if (options?.markSiteStarted !== false && existingCount > 0) {
      await siteWorkspaceService.markSiteStarted(tenantId)
    }

    return mapPageToSummary(page)
  }

  async ensureContactPage(tenantId: string): Promise<SitePageSummary> {
    assertTenantId(tenantId)

    await this.ensureHomePage(tenantId)

    const existing = await sitePageRepository.findByTenantAndSlug(tenantId, 'contact')

    if (existing) {
      return mapPageToSummary(existing)
    }

    return this.createPage(tenantId, {
      title: 'Contact',
      slug: 'contact',
      draftBlocks: createContactPageBlocks() as unknown as ISitePageBlock[]
    }, { markSiteStarted: false })
  }

  async ensureAboutPage(tenantId: string): Promise<SitePageSummary> {
    assertTenantId(tenantId)

    await this.ensureHomePage(tenantId)

    const existing = await sitePageRepository.findByTenantAndSlug(tenantId, 'about')

    if (existing) {
      return mapPageToSummary(existing)
    }

    return this.createPage(tenantId, {
      title: 'About',
      slug: 'about',
      draftBlocks: createAboutPageBlocks() as unknown as ISitePageBlock[]
    }, { markSiteStarted: false })
  }

  async ensureBaseWebsitePages(tenantId: string) {
    await this.ensureHomePage(tenantId)
    await this.ensureAboutPage(tenantId)
    await this.ensureContactPage(tenantId)
  }

  async updatePageMeta(
    tenantId: string,
    slug: string,
    input: { title?: string; description?: string; sortOrder?: number }
  ) {
    assertTenantId(tenantId)

    const parsed = updatePageMetaSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid page data', 400, 'VALIDATION_ERROR')
    }

    const page = await sitePageRepository.updateMeta(tenantId, slug, parsed.data)

    if (!page) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND')
    }

    return mapPageToSummary(page)
  }

  async deletePage(tenantId: string, slug: string) {
    assertTenantId(tenantId)

    if (isHomePageSlug(slug)) {
      throw new AppError('The home page cannot be deleted', 400, 'HOME_PAGE_PROTECTED')
    }

    const deleted = await sitePageRepository.deletePage(tenantId, slug)

    if (!deleted) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND')
    }
  }

  async reorderPages(tenantId: string, orderedSlugs: string[]) {
    assertTenantId(tenantId)

    if (!orderedSlugs.includes('home')) {
      throw new AppError('Home page must be included in page order', 400, 'HOME_PAGE_REQUIRED')
    }

    await sitePageRepository.reorderPages(tenantId, orderedSlugs)
  }
}

export const sitePageService = new SitePageService()
