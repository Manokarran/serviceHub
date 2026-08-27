'use server'

import { toPlainJson, requireIsoString, toIsoString } from '@/lib/utils/plain-json'
import { AppError } from '@/lib/errors'
import {
  requireLibraryTemplateEditor,
  resolveBuilderTenant,
  type BuilderScope
} from '@/lib/site-template/resolve-builder-tenant'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import type { PublishedVersionSummary, SitePageSummary } from '@/models/site-page'
import { sitePageService } from '@/services/site-page'
import { siteTemplateService } from '@/services/site-template'

type SaveDraftResult = { success: true; savedAt: string } | { success: false; error: string }

type PublishResult =
  | { success: true; publishedAt: string; versions: PublishedVersionSummary[] }
  | { success: false; error: string }

type VersionsResult =
  | { success: true; versions: PublishedVersionSummary[] }
  | { success: false; error: string }

type RestoreVersionResult =
  | { success: true; blocks: Block[]; savedAt: string }
  | { success: false; error: string }

type GetVersionResult =
  | { success: true; blocks: Block[]; publishedAt: string }
  | { success: false; error: string }

type PagesResult = { success: true; pages: SitePageSummary[] } | { success: false; error: string }

type PageDataResult =
  | {
      success: true
      page: {
        slug: string
        title: string
        description: string
        isHome: boolean
        draftBlocks: Block[]
        publishedBlocks: Block[]
        draftSiteStyles: SiteStyles | null
        publishedSiteStyles: SiteStyles | null
        draftUpdatedAt: string
        publishedAt: string | null
      }
    }
  | { success: false; error: string }

type CreatePageResult = { success: true; page: SitePageSummary } | { success: false; error: string }

type SimpleResult = { success: true } | { success: false; error: string }

function formatScopeError(error: unknown, fallback: string) {
  if (error instanceof AppError) {
    return { success: false as const, error: error.message }
  }

  return { success: false as const, error: fallback }
}

function requireTemplateId(libraryTemplateId?: string) {
  if (!libraryTemplateId) {
    throw new AppError('Template id is required.', 400, 'TEMPLATE_REQUIRED')
  }

  return libraryTemplateId
}

export async function listSitePagesAction(
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<PagesResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const pages = await siteTemplateService.listTemplatePages(requireTemplateId(libraryTemplateId))

      return { success: true, pages }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const pages = await sitePageService.listPages(tenantId)

    return { success: true, pages }
  } catch (error) {
    return formatScopeError(error, 'Failed to load pages.')
  }
}

export async function getSitePageAction(
  pageSlug: string,
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<PageDataResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const page = await siteTemplateService.getTemplatePage(requireTemplateId(libraryTemplateId), pageSlug)

      return { success: true, page }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const page = await sitePageService.getPage(tenantId, pageSlug)

    if (!page) {
      return { success: false, error: 'Page not found.' }
    }

    return {
      success: true,
      page: {
        slug: page.slug,
        title: page.title,
        description: page.description,
        isHome: page.isHome,
        draftBlocks: toPlainJson(page.draftBlocks) as Block[],
        publishedBlocks: toPlainJson(page.publishedBlocks) as Block[],
        draftSiteStyles: page.draftSiteStyles ? (toPlainJson(page.draftSiteStyles) as SiteStyles) : null,
        publishedSiteStyles: page.publishedSiteStyles
          ? (toPlainJson(page.publishedSiteStyles) as SiteStyles)
          : null,
        draftUpdatedAt: requireIsoString(page.draftUpdatedAt),
        publishedAt: toIsoString(page.publishedAt)
      }
    }
  } catch (error) {
    return formatScopeError(error, 'Failed to load page.')
  }
}

export async function saveSitePageDraftAction(
  pageSlug: string,
  blocks: Block[],
  siteStyles?: SiteStyles,
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<SaveDraftResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const result = await siteTemplateService.saveTemplatePageDraft(
        requireTemplateId(libraryTemplateId),
        pageSlug,
        blocks,
        siteStyles
      )

      return { success: true, savedAt: result.savedAt }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const page = await sitePageService.saveDraft(tenantId, pageSlug, blocks, siteStyles)
    const savedAt = requireIsoString(page.draftUpdatedAt ?? page.updatedAt)

    return { success: true, savedAt }
  } catch (error) {
    return formatScopeError(error, 'Failed to save draft. Please try again.')
  }
}

export async function publishAllSitePagesAction(
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<PublishResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const { publishedAt } = await siteTemplateService.finalizeTemplateEdits(
        requireTemplateId(libraryTemplateId)
      )

      return { success: true, publishedAt, versions: [] }
    }

    const { tenantId, userId } = await resolveBuilderTenant(scope)
    const { publishedAt } = await sitePageService.publishAll(tenantId, userId)
    const versions = await sitePageService.listPublishedVersions(tenantId, 'home')

    return {
      success: true,
      publishedAt,
      versions
    }
  } catch (error) {
    return formatScopeError(error, 'Failed to publish site. Please try again.')
  }
}

export async function publishSitePageAction(
  pageSlug: string,
  blocks: Block[],
  siteStyles?: SiteStyles,
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<PublishResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const templateId = requireTemplateId(libraryTemplateId)
      const saved = await siteTemplateService.saveTemplatePageDraft(templateId, pageSlug, blocks, siteStyles)
      const { publishedAt } = await siteTemplateService.finalizeTemplateEdits(templateId)

      return { success: true, publishedAt: publishedAt || saved.savedAt, versions: [] }
    }

    const { tenantId, userId } = await resolveBuilderTenant(scope)
    const page = await sitePageService.publish(tenantId, userId, pageSlug, blocks, siteStyles)
    const versions = await sitePageService.listPublishedVersions(tenantId, pageSlug)

    return {
      success: true,
      publishedAt: requireIsoString(page.publishedAt ?? page.updatedAt),
      versions
    }
  } catch (error) {
    return formatScopeError(error, 'Failed to publish page. Please try again.')
  }
}

export async function listSitePageVersionsAction(
  pageSlug: string,
  scope: BuilderScope = 'organization',
  _libraryTemplateId?: string
): Promise<VersionsResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()

      return { success: true, versions: [] }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const versions = await sitePageService.listPublishedVersions(tenantId, pageSlug)

    return { success: true, versions }
  } catch (error) {
    return formatScopeError(error, 'Failed to load versions.')
  }
}

export async function getSitePageVersionAction(
  pageSlug: string,
  versionId: string,
  scope: BuilderScope = 'organization',
  _libraryTemplateId?: string
): Promise<GetVersionResult> {
  try {
    if (scope === 'library_template') {
      return { success: false, error: 'Version history is not available while editing library templates.' }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const result = await sitePageService.getPublishedVersion(tenantId, pageSlug, versionId)

    return {
      success: true,
      blocks: toPlainJson(result.blocks) as Block[],
      publishedAt: result.publishedAt
    }
  } catch (error) {
    return formatScopeError(error, 'Failed to load version.')
  }
}

export async function restoreSitePageVersionAction(
  pageSlug: string,
  versionId: string,
  scope: BuilderScope = 'organization',
  _libraryTemplateId?: string
): Promise<RestoreVersionResult> {
  try {
    if (scope === 'library_template') {
      return { success: false, error: 'Version history is not available while editing library templates.' }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const result = await sitePageService.restoreVersionToDraft(tenantId, pageSlug, versionId)

    return {
      success: true,
      blocks: toPlainJson(result.blocks) as Block[],
      savedAt: requireIsoString(result.draftUpdatedAt)
    }
  } catch (error) {
    return formatScopeError(error, 'Failed to restore version.')
  }
}

export async function createSitePageAction(
  input: {
    title: string
    slug?: string
  },
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<CreatePageResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const page = await siteTemplateService.createTemplatePage(requireTemplateId(libraryTemplateId), input)

      return { success: true, page }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const page = await sitePageService.createPage(tenantId, input)

    return { success: true, page }
  } catch (error) {
    return formatScopeError(error, 'Failed to create page.')
  }
}

export async function updateSitePageMetaAction(
  pageSlug: string,
  input: { title?: string; description?: string },
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<CreatePageResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const page = await siteTemplateService.updateTemplatePageMeta(
        requireTemplateId(libraryTemplateId),
        pageSlug,
        input
      )

      return { success: true, page }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const page = await sitePageService.updatePageMeta(tenantId, pageSlug, input)

    return { success: true, page }
  } catch (error) {
    return formatScopeError(error, 'Failed to update page.')
  }
}

export async function deleteSitePageAction(
  pageSlug: string,
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<SimpleResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      await siteTemplateService.deleteTemplatePage(requireTemplateId(libraryTemplateId), pageSlug)

      return { success: true }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    await sitePageService.deletePage(tenantId, pageSlug)

    return { success: true }
  } catch (error) {
    return formatScopeError(error, 'Failed to delete page.')
  }
}

export async function reorderSitePagesAction(
  orderedSlugs: string[],
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<SimpleResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      await siteTemplateService.reorderTemplatePages(requireTemplateId(libraryTemplateId), orderedSlugs)

      return { success: true }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    await sitePageService.reorderPages(tenantId, orderedSlugs)

    return { success: true }
  } catch (error) {
    return formatScopeError(error, 'Failed to reorder pages.')
  }
}

type DuplicatePageResult = { success: true; page: SitePageSummary } | { success: false; error: string }

export async function duplicateSitePageAction(
  sourceSlug: string,
  newTitle: string,
  scope: BuilderScope = 'organization',
  libraryTemplateId?: string
): Promise<DuplicatePageResult> {
  try {
    if (scope === 'library_template') {
      await requireLibraryTemplateEditor()
      const page = await siteTemplateService.duplicateTemplatePage(
        requireTemplateId(libraryTemplateId),
        sourceSlug,
        newTitle
      )

      return { success: true, page }
    }

    const { tenantId } = await resolveBuilderTenant(scope)
    const sourcePage = await sitePageService.getPage(tenantId, sourceSlug)

    if (!sourcePage) {
      return { success: false, error: 'Source page not found.' }
    }

    const newPage = await sitePageService.createPage(tenantId, { title: newTitle })
    await sitePageService.saveDraft(
      tenantId,
      newPage.slug,
      toPlainJson(sourcePage.draftBlocks) as Block[],
      sourcePage.draftSiteStyles ?? undefined
    )

    return { success: true, page: newPage }
  } catch (error) {
    return formatScopeError(error, 'Failed to duplicate page.')
  }
}

/** @deprecated Use saveSitePageDraftAction(pageSlug, blocks) */
export async function saveSitePageAction(blocks: Block[]): Promise<SaveDraftResult> {
  return saveSitePageDraftAction('home', blocks)
}
