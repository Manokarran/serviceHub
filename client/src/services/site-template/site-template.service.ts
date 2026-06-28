import type { Block } from '@/features/your-space/types'
import mongoose from 'mongoose'
import { STARTER_BLOCKS } from '@/features/your-space/constants'
import { cloneBlockWithNewIds } from '@/features/your-space/utils/blockFactory'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import type { SiteTemplateCategory } from '@/lib/constants/site-template'
import { AppError } from '@/lib/errors'
import { isHomePageSlug } from '@/lib/utils/page-slug'
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
  SiteTemplateSummary
} from '@/models/site-template'
import type { ISitePageBlock } from '@/models/site-page'
import { sitePageRepository } from '@/repositories/site-page.repository'
import { siteTemplateRepository } from '@/repositories/site-template.repository'
import { tenantRepository } from '@/repositories/tenant.repository'
import { sitePageService } from '@/services/site-page'
import { siteWorkspaceService } from '@/services/site-workspace'

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
    updatedAt: doc.updatedAt.toISOString()
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
}

function assertTenantId(tenantId: string) {
  if (!tenantId) {
    throw new AppError('Tenant is required', 400, 'TENANT_REQUIRED')
  }
}

export const siteTemplateService = new SiteTemplateService()
