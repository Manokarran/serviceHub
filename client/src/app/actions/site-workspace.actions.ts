'use server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import type { ResetSiteDraftsMode, SiteWorkspaceStatus } from '@/services/site-workspace'
import { siteWorkspaceService } from '@/services/site-workspace'

type StatusResult = { success: true; status: SiteWorkspaceStatus } | { success: false; error: string }

type SimpleResult = { success: true } | { success: false; error: string }

export async function getSiteWorkspaceStatusAction(): Promise<StatusResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    const status = await siteWorkspaceService.getStatus(session.user.tenantId)

    return { success: true, status }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load workspace status.' }
  }
}

export async function markSiteStartedAction(): Promise<SimpleResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    await siteWorkspaceService.markSiteStarted(session.user.tenantId)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to update workspace status.' }
  }
}

export async function resetSiteDraftsAction(
  mode: ResetSiteDraftsMode,
  removeExtraPages: boolean
): Promise<SimpleResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    await siteWorkspaceService.resetSiteDrafts(session.user.tenantId, { mode, removeExtraPages })

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to reset site drafts.' }
  }
}
