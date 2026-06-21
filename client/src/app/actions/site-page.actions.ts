'use server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import type { PublishedVersionSummary } from '@/models/site-page'
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

export async function saveSitePageDraftAction(blocks: Block[], siteStyles?: SiteStyles): Promise<SaveDraftResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to save your page.' }
    }

    const page = await sitePageService.saveDraft(session.user.tenantId, blocks, siteStyles)
    const savedAt = (page.draftUpdatedAt ?? page.updatedAt).toISOString()

    return { success: true, savedAt }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to save draft. Please try again.' }
  }
}

export async function publishSitePageAction(blocks: Block[], siteStyles?: SiteStyles): Promise<PublishResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !session.user.id) {
      return { success: false, error: 'You must be signed in to publish your page.' }
    }

    const page = await sitePageService.publish(session.user.tenantId, session.user.id, blocks, siteStyles)
    const versions = await sitePageService.listPublishedVersions(session.user.tenantId)

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

export async function listSitePageVersionsAction(): Promise<VersionsResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to view versions.' }
    }

    const versions = await sitePageService.listPublishedVersions(session.user.tenantId)

    return { success: true, versions }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load versions.' }
  }
}

export async function restoreSitePageVersionAction(versionId: string): Promise<RestoreVersionResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in to restore a version.' }
    }

    const result = await sitePageService.restoreVersionToDraft(session.user.tenantId, versionId)

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

/** @deprecated Use saveSitePageDraftAction */
export async function saveSitePageAction(blocks: Block[]): Promise<SaveDraftResult> {
  return saveSitePageDraftAction(blocks)
}
