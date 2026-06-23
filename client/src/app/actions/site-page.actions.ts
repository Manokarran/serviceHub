'use server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import type { PublishedVersionSummary, SitePageSummary } from '@/models/site-page'
import { sitePageService } from '@/services/site-page'

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

export async function listSitePagesAction(): Promise<PagesResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to view pages.' }
    }

    const pages = await sitePageService.listPages(session.user.tenantId)

    return { success: true, pages }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load pages.' }
  }
}

export async function getSitePageAction(pageSlug: string): Promise<PageDataResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to view this page.' }
    }

    const page = await sitePageService.getPage(session.user.tenantId, pageSlug)

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
        draftUpdatedAt: page.draftUpdatedAt.toISOString(),
        publishedAt: page.publishedAt?.toISOString() ?? null
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load page.' }
  }
}

export async function saveSitePageDraftAction(
  pageSlug: string,
  blocks: Block[],
  siteStyles?: SiteStyles
): Promise<SaveDraftResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to save your page.' }
    }

    const page = await sitePageService.saveDraft(session.user.tenantId, pageSlug, blocks, siteStyles)
    const savedAt = (page.draftUpdatedAt ?? page.updatedAt).toISOString()

    return { success: true, savedAt }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to save draft. Please try again.' }
  }
}

export async function publishSitePageAction(
  pageSlug: string,
  blocks: Block[],
  siteStyles?: SiteStyles
): Promise<PublishResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !session.user.id) {
      return { success: false, error: 'You must be signed in to publish your page.' }
    }

    const page = await sitePageService.publish(session.user.tenantId, session.user.id, pageSlug, blocks, siteStyles)
    const versions = await sitePageService.listPublishedVersions(session.user.tenantId, pageSlug)

    return {
      success: true,
      publishedAt: (page.publishedAt ?? page.updatedAt).toISOString(),
      versions
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to publish page. Please try again.' }
  }
}

export async function listSitePageVersionsAction(pageSlug: string): Promise<VersionsResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to view versions.' }
    }

    const versions = await sitePageService.listPublishedVersions(session.user.tenantId, pageSlug)

    return { success: true, versions }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load versions.' }
  }
}

export async function restoreSitePageVersionAction(
  pageSlug: string,
  versionId: string
): Promise<RestoreVersionResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to restore a version.' }
    }

    const result = await sitePageService.restoreVersionToDraft(session.user.tenantId, pageSlug, versionId)

    return {
      success: true,
      blocks: toPlainJson(result.blocks) as Block[],
      savedAt: result.draftUpdatedAt.toISOString()
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to restore version.' }
  }
}

export async function createSitePageAction(input: {
  title: string
  slug?: string
}): Promise<CreatePageResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to create a page.' }
    }

    const page = await sitePageService.createPage(session.user.tenantId, input)

    return { success: true, page }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to create page.' }
  }
}

export async function updateSitePageMetaAction(
  pageSlug: string,
  input: { title?: string; description?: string }
): Promise<CreatePageResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to update this page.' }
    }

    const page = await sitePageService.updatePageMeta(session.user.tenantId, pageSlug, input)

    return { success: true, page }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to update page.' }
  }
}

export async function deleteSitePageAction(pageSlug: string): Promise<SimpleResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to delete this page.' }
    }

    await sitePageService.deletePage(session.user.tenantId, pageSlug)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to delete page.' }
  }
}

export async function reorderSitePagesAction(orderedSlugs: string[]): Promise<SimpleResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to reorder pages.' }
    }

    await sitePageService.reorderPages(session.user.tenantId, orderedSlugs)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to reorder pages.' }
  }
}

/** @deprecated Use saveSitePageDraftAction(pageSlug, blocks) */
export async function saveSitePageAction(blocks: Block[]): Promise<SaveDraftResult> {
  return saveSitePageDraftAction('home', blocks)
}
