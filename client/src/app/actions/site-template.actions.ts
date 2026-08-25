'use server'

import { auth } from '@/lib/auth'
import { requireSuperAdminSession } from '@/lib/auth/require-super-admin'
import { formatActionError, resolveSessionUserId } from '@/lib/auth/resolve-session-user-id'
import { AppError } from '@/lib/errors'
import type { CreateSiteTemplateInput, UpdateSiteTemplateInput } from '@/lib/validators/site-template.validator'
import type { SiteTemplateDetail, SiteTemplateSummary } from '@/models/site-template'
import { siteTemplateService } from '@/services/site-template'
import { getOrCreateBaseTemplateTenantId } from '@/lib/site-template/base-template-tenant'

type TemplatesResult =
  | { success: true; templates: SiteTemplateSummary[] }
  | { success: false; error: string }

type TemplateResult = { success: true; template: SiteTemplateDetail } | { success: false; error: string }

type SimpleResult = { success: true } | { success: false; error: string }

export async function listPublishedSiteTemplatesAction(): Promise<TemplatesResult> {
  try {
    const templates = await siteTemplateService.listPublishedTemplates()

    return { success: true, templates }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load templates.' }
  }
}

export async function listAllSiteTemplatesAction(): Promise<TemplatesResult> {
  try {
    await requireSuperAdminSession()
    const templates = await siteTemplateService.listAllTemplates()

    return { success: true, templates }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load templates.' }
  }
}

export async function getSiteTemplateAction(id: string): Promise<TemplateResult> {
  try {
    await requireSuperAdminSession()
    const template = await siteTemplateService.getTemplate(id)

    if (!template) {
      return { success: false, error: 'Template not found.' }
    }

    return { success: true, template }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load template.' }
  }
}

/** Signed-in users can preview published templates before applying them. */
export async function getPublishedSiteTemplateAction(id: string): Promise<TemplateResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to preview templates.' }
    }

    const template = await siteTemplateService.getTemplate(id)

    if (!template || template.status !== 'published') {
      return { success: false, error: 'Template not found.' }
    }

    return { success: true, template }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load template.' }
  }
}

export async function createSiteTemplateAction(input: CreateSiteTemplateInput): Promise<TemplateResult> {
  try {
    const session = await requireSuperAdminSession()
    const userId = await resolveSessionUserId(session)
    const template = await siteTemplateService.createTemplate(userId, input)

    return { success: true, template }
  } catch (error) {
    console.error('[createSiteTemplateAction]', error)

    return { success: false, error: formatActionError(error, 'Failed to create template.') }
  }
}

export async function updateSiteTemplateAction(
  id: string,
  input: UpdateSiteTemplateInput
): Promise<TemplateResult> {
  try {
    await requireSuperAdminSession()
    const template = await siteTemplateService.updateTemplate(id, input)

    return { success: true, template }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to update template.' }
  }
}

export async function publishSiteTemplateAction(id: string): Promise<TemplateResult> {
  try {
    await requireSuperAdminSession()
    const template = await siteTemplateService.publishTemplate(id)

    return { success: true, template }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to publish template.' }
  }
}

export async function unpublishSiteTemplateAction(id: string): Promise<TemplateResult> {
  try {
    await requireSuperAdminSession()
    const template = await siteTemplateService.unpublishTemplate(id)

    return { success: true, template }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to unpublish template.' }
  }
}

export async function archiveSiteTemplateAction(id: string): Promise<SimpleResult> {
  try {
    await requireSuperAdminSession()
    await siteTemplateService.archiveTemplate(id)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to archive template.' }
  }
}

export async function captureSiteTemplateFromWorkspaceAction(id: string): Promise<TemplateResult> {
  try {
    await requireSuperAdminSession()
    const tenantId = await getOrCreateBaseTemplateTenantId()
    const template = await siteTemplateService.captureFromTenant(id, tenantId)

    return { success: true, template }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to capture site from workspace.' }
  }
}

export async function applySiteTemplateAction(templateId: string): Promise<SimpleResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    await siteTemplateService.applyTemplateToTenant(templateId, session.user.tenantId)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to apply template.' }
  }
}
