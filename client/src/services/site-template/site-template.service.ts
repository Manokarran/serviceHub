import type { Block } from '@/features/your-space/types'
import mongoose from 'mongoose'
import { STARTER_BLOCKS } from '@/features/your-space/constants'
import { cloneBlockWithNewIds } from '@/features/your-space/utils/blockFactory'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import type { SiteTemplateCategory } from '@/lib/constants/site-template'
import { AppError } from '@/lib/errors'
import { ensureUniqueSlug, isHomePageSlug, slugifyPageTitle } from '@/lib/utils/page-slug'
import { toPlainJson } from '@/lib/utils/plain-json'
import { slugify } from '@/lib/utils/slug'
import { generateTemplatePreviewThumbnail } from '@/lib/site-template/generate-template-preview'
import {
  createSiteTemplateSchema,
  updateSiteTemplateSchema,
  type CreateSiteTemplateInput,
  type UpdateSiteTemplateInput
} from '@/lib/validators/site-template.validator'
import type {
  ISiteTemplateDocument,
  ISiteTemplatePageSnapshot,
  SiteTemplateDetail,
  SiteTemplateHomePreview,
  SiteTemplateSummary
} from '@/models/site-template'
import type { ISitePageBlock, SitePageSummary } from '@/models/site-page'
import { sitePageRepository } from '@/repositories/site-page.repository'
import { siteTemplateRepository } from '@/repositories/site-template.repository'
import { tenantRepository } from '@/repositories/tenant.repository'
import { sitePageService } from '@/services/site-page'
import { siteWorkspaceService } from '@/services/site-workspace'

function extractHomePreview(doc: ISiteTemplateDocument): SiteTemplateHomePreview | null {
  const homePage =
    doc.pages?.find(page => isHomePageSlug(page.slug)) ?? doc.pages?.[0]

  if (!homePage?.blocks?.length) {
    return null
  }

  return {
    blocks: toPlainJson(homePage.blocks) as Block[],
    siteStyles: homePage.siteStyles ? (toPlainJson(homePage.siteStyles) as SiteStyles) : null
  }
}

function mapTemplateSummary(doc: ISiteTemplateDocument): SiteTemplateSummary {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    thumbnailUrl: doc.thumbnailUrl?.trim() || null,
    generatedThumbnailUrl: doc.generatedThumbnailUrl?.trim() || null,
    category: doc.category,
    tags: doc.tags ?? [],
    status: doc.status,
    sortOrder: doc.sortOrder ?? 0,
    pageCount: doc.pages?.length ?? 0,
    usageCount: doc.usageCount ?? 0,
    publishedAt: doc.publishedAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt.toISOString(),
    homePreview: extractHomePreview(doc)
  }
}

function mapTemplateDetail(doc: ISiteTemplateDocument): SiteTemplateDetail {
  return {
    ...mapTemplateSummary(doc),
    pages: toPlainJson(doc.pages ?? []) as ISiteTemplatePageSnapshot[],
    tenantSettings: doc.tenantSettings ? toPlainJson(doc.tenantSettings) : null
  }
}

function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(block => cloneBlockWithNewIds(block))
}

function createStarterPages(): ISiteTemplatePageSnapshot[] {
  return [
    {
      slug: 'home',
      title: 'Home',
      description: '',
      sortOrder: 0,
      blocks: cloneBlocks(STARTER_BLOCKS),
      siteStyles: null
    }
  ]
}

async function ensureUniqueTemplateSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let suffix = 1

  while (await siteTemplateRepository.findBySlug(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

export class SiteTemplateService {
  async listPublishedTemplates(): Promise<SiteTemplateSummary[]> {
    const templates = await siteTemplateRepository.listPublished()

    return templates.map(mapTemplateSummary)
  }

  async listAllTemplates(): Promise<SiteTemplateSummary[]> {
    const templates = await siteTemplateRepository.listAll()

    return templates.map(mapTemplateSummary)
  }

  async getTemplate(id: string): Promise<SiteTemplateDetail | null> {
    const doc = await siteTemplateRepository.findById(id)

    if (!doc) {
      return null
    }

    return mapTemplateDetail(doc)
  }

  async createTemplate(userId: string, input: CreateSiteTemplateInput): Promise<SiteTemplateDetail> {
    const parsed = createSiteTemplateSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid template data', 400, 'VALIDATION_ERROR')
    }

    const baseSlug = parsed.data.slug ?? slugify(parsed.data.name)

    if (!baseSlug) {
      throw new AppError('Enter a valid template slug', 400, 'INVALID_SLUG')
    }

    const slug = await ensureUniqueTemplateSlug(baseSlug)
    const templates = await siteTemplateRepository.listAll()
    const sortOrder = templates.length > 0 ? Math.max(...templates.map(t => t.sortOrder ?? 0)) + 1 : 0

    const doc = await siteTemplateRepository.create({
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? '',
      thumbnailUrl: parsed.data.thumbnailUrl?.trim() ?? '',
      category: (parsed.data.category ?? 'business') as SiteTemplateCategory,
      tags: parsed.data.tags ?? [],
      status: 'draft',
      sortOrder,
      pages: createStarterPages(),
      createdBy: new mongoose.Types.ObjectId(userId),
      usageCount: 0
    })

    return mapTemplateDetail(doc)
  }

  async createTemplateFromGeneratedSite(
    userId: string,
    input: {
      name: string
      description?: string
      category?: SiteTemplateCategory
      preview: import('@/lib/ai-site-wizard/types').AiSiteGenerationPreview
      logoUrl?: string
    }
  ): Promise<SiteTemplateDetail> {
    const template = await this.createTemplate(userId, {
      name: input.name,
      description: input.description ?? input.preview.pages[0]?.description ?? '',
      category: input.category
    })

    const pages: ISiteTemplatePageSnapshot[] = input.preview.pages.map((page, index) => ({
      slug: page.slug,
      title: page.title,
      description: page.description,
      sortOrder: index,
      blocks: toPlainJson(page.blocks) as Block[],
      siteStyles: page.siteStyles ? (toPlainJson(page.siteStyles) as SiteStyles) : null
    }))

    const homePage = pages.find(page => isHomePageSlug(page.slug)) ?? pages[0]
    let generatedThumbnailUrl: string | null = null

    if (homePage?.blocks?.length) {
      generatedThumbnailUrl = await generateTemplatePreviewThumbnail({
        templateName: template.name,
        homeBlocks: homePage.blocks as Block[],
        siteStyles: homePage.siteStyles
      })
    }

    const accent = homePage?.siteStyles?.colors?.accent

    const doc = await siteTemplateRepository.updateById(template.id, {
      pages,
      tenantSettings: {
        ...(accent ? { primaryColor: accent } : {}),
        ...(input.logoUrl ? { logoUrl: input.logoUrl } : {})
      },
      ...(generatedThumbnailUrl ? { generatedThumbnailUrl } : {})
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return mapTemplateDetail(doc)
  }

  async updateTemplate(id: string, input: UpdateSiteTemplateInput): Promise<SiteTemplateDetail> {
    const parsed = updateSiteTemplateSchema.safeParse(input)

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? 'Invalid template data', 400, 'VALIDATION_ERROR')
    }

    const existing = await siteTemplateRepository.findById(id)

    if (!existing || existing.status === 'archived') {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    const doc = await siteTemplateRepository.updateById(id, parsed.data)

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return mapTemplateDetail(doc)
  }

  async publishTemplate(id: string): Promise<SiteTemplateDetail> {
    const existing = await siteTemplateRepository.findById(id)

    if (!existing || existing.status === 'archived') {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    if (!existing.pages?.length) {
      throw new AppError('Add at least one page before publishing', 400, 'TEMPLATE_EMPTY')
    }

    const doc = await siteTemplateRepository.updateById(id, {
      status: 'published',
      publishedAt: new Date()
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return mapTemplateDetail(doc)
  }

  async unpublishTemplate(id: string): Promise<SiteTemplateDetail> {
    const doc = await siteTemplateRepository.updateById(id, {
      status: 'draft',
      publishedAt: null
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return mapTemplateDetail(doc)
  }

  async archiveTemplate(id: string): Promise<void> {
    const doc = await siteTemplateRepository.archive(id)

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }
  }

  async captureFromTenant(templateId: string, sourceTenantId: string): Promise<SiteTemplateDetail> {
    const template = await siteTemplateRepository.findById(templateId)

    if (!template || template.status === 'archived') {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    const tenant = await tenantRepository.findById(sourceTenantId)

    if (!tenant) {
      throw new AppError('Source workspace not found', 404, 'TENANT_NOT_FOUND')
    }

    const pages = await sitePageRepository.listByTenant(sourceTenantId)

    if (!pages.length) {
      throw new AppError('Source workspace has no pages to capture', 400, 'NO_PAGES')
    }

    const snapshots: ISiteTemplatePageSnapshot[] = pages.map(page => {
      const isHome = isHomePageSlug(page.slug)
      const usePublished = Boolean(page.publishedAt && page.publishedBlocks?.length)
      const draftBlocks = (page.draftBlocks?.length ? page.draftBlocks : page.blocks ?? []) as unknown as Block[]
      const publishedBlocks = (page.publishedBlocks ?? []) as unknown as Block[]
      const blocks = usePublished ? publishedBlocks : draftBlocks
      const siteStyles = isHome
        ? (((usePublished
            ? page.publishedSiteStyles ?? page.draftSiteStyles
            : page.draftSiteStyles ?? page.publishedSiteStyles) ?? null) as SiteStyles | null)
        : null

      return {
        slug: page.slug,
        title: page.title ?? (isHome ? 'Home' : page.slug),
        description: page.description ?? '',
        sortOrder: page.sortOrder ?? 0,
        blocks: toPlainJson(blocks) as Block[],
        siteStyles: siteStyles ? (toPlainJson(siteStyles) as SiteStyles) : null
      }
    })

    const homeSnapshot = snapshots.find(snapshot => isHomePageSlug(snapshot.slug))
    let generatedThumbnailUrl: string | null = null

    if (homeSnapshot?.blocks?.length) {
      generatedThumbnailUrl = await generateTemplatePreviewThumbnail({
        templateName: template.name,
        homeBlocks: homeSnapshot.blocks as Block[],
        siteStyles: homeSnapshot.siteStyles
      })
    }

    const tenantSettings = tenant.settings?.primaryColor || tenant.settings?.logoUrl
      ? {
          primaryColor: tenant.settings.primaryColor,
          logoUrl: tenant.settings.logoUrl
        }
      : null

    const doc = await siteTemplateRepository.updateById(templateId, {
      pages: snapshots,
      tenantSettings,
      ...(generatedThumbnailUrl ? { generatedThumbnailUrl } : {})
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return mapTemplateDetail(doc)
  }

  async applyTemplateToTenant(templateId: string, tenantId: string): Promise<void> {
    const template = await siteTemplateRepository.findById(templateId)

    if (!template || template.status !== 'published') {
      throw new AppError('Template not found or unavailable', 404, 'TEMPLATE_NOT_FOUND')
    }

    if (!template.pages?.length) {
      throw new AppError('This template has no pages', 400, 'TEMPLATE_EMPTY')
    }

    assertTenantId(tenantId)

    await sitePageService.ensureHomePage(tenantId)

    const existingPages = await sitePageRepository.listByTenant(tenantId)
    const existingBySlug = new Map(existingPages.map(page => [page.slug, page]))

    for (const snapshot of [...template.pages].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const blocks = cloneBlocks(snapshot.blocks as Block[])
      const isHome = isHomePageSlug(snapshot.slug)
      const siteStyles = isHome ? (snapshot.siteStyles ?? undefined) : undefined
      const siteStylesPayload = siteStyles
        ? (toPlainJson(siteStyles) as unknown as Record<string, unknown>)
        : null

      if (existingBySlug.has(snapshot.slug)) {
        await sitePageRepository.saveDraft(
          tenantId,
          blocks as unknown as ISitePageBlock[],
          snapshot.slug,
          siteStylesPayload
        )

        if (snapshot.title || snapshot.description) {
          await sitePageRepository.updateMeta(tenantId, snapshot.slug, {
            title: snapshot.title,
            description: snapshot.description
          })
        }
      } else {
        await sitePageService.createPage(tenantId, {
          title: snapshot.title,
          slug: snapshot.slug,
          draftBlocks: blocks as unknown as ISitePageBlock[]
        })

        if (siteStylesPayload) {
          await sitePageRepository.saveDraft(
            tenantId,
            blocks as unknown as ISitePageBlock[],
            snapshot.slug,
            siteStylesPayload
          )
        }
      }
    }

    if (template.tenantSettings?.primaryColor || template.tenantSettings?.logoUrl) {
      await tenantRepository.updateSettings(tenantId, {
        primaryColor: template.tenantSettings.primaryColor,
        logoUrl: template.tenantSettings.logoUrl
      })
    }

    await siteTemplateRepository.incrementUsageCount(templateId)
    await siteWorkspaceService.markSiteStarted(tenantId, { appliedTemplateId: templateId })
  }

  private async requireEditableTemplate(templateId: string): Promise<ISiteTemplateDocument> {
    const template = await siteTemplateRepository.findById(templateId)

    if (!template || template.status === 'archived') {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return template
  }

  private mapTemplatePageSummary(page: ISiteTemplatePageSnapshot): SitePageSummary {
    return {
      slug: page.slug,
      title: page.title,
      description: page.description ?? '',
      sortOrder: page.sortOrder ?? 0,
      isHome: isHomePageSlug(page.slug),
      publishedAt: null,
      hasUnpublishedChanges: false,
      blockCount: page.blocks?.length ?? 0
    }
  }

  async listTemplatePages(templateId: string): Promise<SitePageSummary[]> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = [...(template.pages ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

    return pages.map(page => this.mapTemplatePageSummary(page))
  }

  async getTemplatePage(templateId: string, pageSlug: string) {
    const template = await this.requireEditableTemplate(templateId)
    const page = (template.pages ?? []).find(item => item.slug === pageSlug)

    if (!page) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND')
    }

    const blocks = toPlainJson(page.blocks ?? []) as Block[]
    const siteStyles = page.siteStyles ? (toPlainJson(page.siteStyles) as SiteStyles) : null
    const updatedAt = template.updatedAt.toISOString()

    return {
      slug: page.slug,
      title: page.title,
      description: page.description ?? '',
      isHome: isHomePageSlug(page.slug),
      draftBlocks: blocks,
      publishedBlocks: blocks,
      draftSiteStyles: siteStyles,
      publishedSiteStyles: siteStyles,
      draftUpdatedAt: updatedAt,
      publishedAt: null as string | null
    }
  }

  async saveTemplatePageDraft(
    templateId: string,
    pageSlug: string,
    blocks: Block[],
    siteStyles?: SiteStyles
  ): Promise<{ savedAt: string }> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = toPlainJson(template.pages ?? []) as ISiteTemplatePageSnapshot[]
    const index = pages.findIndex(page => page.slug === pageSlug)

    if (index < 0) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND')
    }

    const nextPages = [...pages]
    const current = nextPages[index]
    const nextStyles = isHomePageSlug(pageSlug)
      ? siteStyles !== undefined
        ? siteStyles
        : current.siteStyles ?? null
      : null

    nextPages[index] = {
      ...current,
      blocks: toPlainJson(blocks) as Block[],
      siteStyles: nextStyles
    }

    const home = nextPages.find(page => isHomePageSlug(page.slug))
    let generatedThumbnailUrl: string | null | undefined

    if (home?.blocks?.length) {
      generatedThumbnailUrl = await generateTemplatePreviewThumbnail({
        templateName: template.name,
        homeBlocks: home.blocks as Block[],
        siteStyles: home.siteStyles
      })
    }

    const doc = await siteTemplateRepository.updateById(templateId, {
      pages: nextPages,
      ...(generatedThumbnailUrl ? { generatedThumbnailUrl } : {})
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return { savedAt: doc.updatedAt.toISOString() }
  }

  async createTemplatePage(
    templateId: string,
    input: { title: string; slug?: string }
  ): Promise<SitePageSummary> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = toPlainJson(template.pages ?? []) as ISiteTemplatePageSnapshot[]
    const baseSlug = input.slug?.trim() || slugifyPageTitle(input.title)

    if (!baseSlug) {
      throw new AppError('Enter a valid page title or slug', 400, 'INVALID_SLUG')
    }

    const wantsHome = isHomePageSlug(baseSlug)
    const hasHome = pages.some(page => isHomePageSlug(page.slug))
    const slug =
      wantsHome && !hasHome
        ? 'home'
        : ensureUniqueSlug(wantsHome ? 'page' : baseSlug, pages.map(page => page.slug))
    const sortOrder = pages.reduce((max, page) => Math.max(max, page.sortOrder ?? 0), 0) + 1
    const nextPage: ISiteTemplatePageSnapshot = {
      slug,
      title: input.title.trim() || slug,
      description: '',
      sortOrder,
      blocks: [],
      siteStyles: null
    }

    const doc = await siteTemplateRepository.updateById(templateId, {
      pages: [...pages, nextPage]
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return this.mapTemplatePageSummary(nextPage)
  }

  async updateTemplatePageMeta(
    templateId: string,
    pageSlug: string,
    input: { title?: string; description?: string }
  ): Promise<SitePageSummary> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = toPlainJson(template.pages ?? []) as ISiteTemplatePageSnapshot[]
    const index = pages.findIndex(page => page.slug === pageSlug)

    if (index < 0) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND')
    }

    const nextPages = [...pages]
    nextPages[index] = {
      ...nextPages[index],
      ...(input.title !== undefined ? { title: input.title.trim() || nextPages[index].title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {})
    }

    const doc = await siteTemplateRepository.updateById(templateId, { pages: nextPages })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return this.mapTemplatePageSummary(nextPages[index])
  }

  async deleteTemplatePage(templateId: string, pageSlug: string): Promise<void> {
    if (isHomePageSlug(pageSlug)) {
      throw new AppError('The home page cannot be deleted', 400, 'HOME_PAGE_PROTECTED')
    }

    const template = await this.requireEditableTemplate(templateId)
    const pages = (template.pages ?? []).filter(page => page.slug !== pageSlug)

    if (pages.length === (template.pages ?? []).length) {
      throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND')
    }

    const doc = await siteTemplateRepository.updateById(templateId, { pages: toPlainJson(pages) })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }
  }

  async duplicateTemplatePage(templateId: string, sourceSlug: string, newTitle: string): Promise<SitePageSummary> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = toPlainJson(template.pages ?? []) as ISiteTemplatePageSnapshot[]
    const source = pages.find(page => page.slug === sourceSlug)

    if (!source) {
      throw new AppError('Source page not found', 404, 'PAGE_NOT_FOUND')
    }

    const created = await this.createTemplatePage(templateId, { title: newTitle })
    await this.saveTemplatePageDraft(
      templateId,
      created.slug,
      cloneBlocks(source.blocks as Block[]),
      isHomePageSlug(created.slug) ? (source.siteStyles ?? undefined) : undefined
    )

    return (await this.listTemplatePages(templateId)).find(page => page.slug === created.slug) ?? created
  }

  async reorderTemplatePages(templateId: string, orderedSlugs: string[]): Promise<void> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = toPlainJson(template.pages ?? []) as ISiteTemplatePageSnapshot[]

    if (!orderedSlugs.includes('home')) {
      throw new AppError('Home page must be included in page order', 400, 'HOME_PAGE_REQUIRED')
    }

    const bySlug = new Map(pages.map(page => [page.slug, page]))
    const nextPages = orderedSlugs
      .map((slug, index) => {
        const page = bySlug.get(slug)

        if (!page) {
          return null
        }

        return { ...page, sortOrder: index }
      })
      .filter((page): page is ISiteTemplatePageSnapshot => Boolean(page))

    const leftovers = pages.filter(page => !orderedSlugs.includes(page.slug))

    for (const page of leftovers) {
      nextPages.push({ ...page, sortOrder: nextPages.length })
    }

    const doc = await siteTemplateRepository.updateById(templateId, { pages: nextPages })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }
  }

  async finalizeTemplateEdits(templateId: string): Promise<{ publishedAt: string }> {
    const template = await this.requireEditableTemplate(templateId)
    const pages = toPlainJson(template.pages ?? []) as ISiteTemplatePageSnapshot[]
    const home = pages.find(page => isHomePageSlug(page.slug))

    let generatedThumbnailUrl: string | null | undefined

    if (home?.blocks?.length) {
      generatedThumbnailUrl = await generateTemplatePreviewThumbnail({
        templateName: template.name,
        homeBlocks: home.blocks as Block[],
        siteStyles: home.siteStyles
      })
    }

    const doc = await siteTemplateRepository.updateById(templateId, {
      ...(generatedThumbnailUrl ? { generatedThumbnailUrl } : {})
    })

    if (!doc) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND')
    }

    return { publishedAt: doc.updatedAt.toISOString() }
  }
}

function assertTenantId(tenantId: string) {
  if (!tenantId) {
    throw new AppError('Tenant is required', 400, 'TENANT_REQUIRED')
  }
}

export const siteTemplateService = new SiteTemplateService()
