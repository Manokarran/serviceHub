'use server'

import { auth } from '@/lib/auth'
import { requireSuperAdminSession } from '@/lib/auth/require-super-admin'
import { formatActionError, resolveSessionUserId } from '@/lib/auth/resolve-session-user-id'
import { hasUnlimitedCredits } from '@/lib/credits/has-unlimited-credits'
import { AppError } from '@/lib/errors'
import { pickBestTemplate } from '@/lib/ai-site-wizard/template-matcher'
import type { AiSiteGenerationPreview, AiTemplateRecommendation } from '@/lib/ai-site-wizard/types'
import {
  aiSiteWizardProfileSchema,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'
import { aiSiteWizardService } from '@/services/ai-site-wizard/ai-site-wizard.service'
import { getOrCreateBaseTemplateTenantId } from '@/lib/site-template/base-template-tenant'
import { sitePageService } from '@/services/site-page'
import { siteTemplateService } from '@/services/site-template'
import { serializeForClient } from '@/lib/utils/plain-json'

type RecommendResult =
  | { success: true; recommendations: AiTemplateRecommendation[] }
  | { success: false; error: string }

type GenerateResult =
  | { success: true; preview: AiSiteGenerationPreview }
  | { success: false; error: string }

type ApplyResult = { success: true } | { success: false; error: string }

/** Local layout preview only — no OpenAI tokens. */
export async function recommendAiSiteTemplatesAction(
  profileInput: AiSiteWizardProfile
): Promise<RecommendResult> {
  try {
    const profile = aiSiteWizardProfileSchema.parse(profileInput)
    const templates = await siteTemplateService.listPublishedTemplates()
    const pick = pickBestTemplate(profile, templates)

    if (!pick) {
      return { success: true, recommendations: [] }
    }

    return {
      success: true,
      recommendations: [
        {
          templateId: pick.templateId,
          headline: pick.templateName,
          reason: pick.reason,
          matchScore: pick.matchScore
        }
      ]
    }
  } catch (error) {
    console.error('[recommendAiSiteTemplatesAction]', error)

    return { success: false, error: formatActionError(error, 'Failed to analyze templates.') }
  }
}

export async function generateAiSitePreviewAction(
  profileInput: AiSiteWizardProfile
): Promise<GenerateResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    const { creditsService } = await import('@/services/credits')
    const unlimited = hasUnlimitedCredits(session.user)

    await creditsService.assertCanAfford(session.user.tenantId, 'major_redesign', { unlimited })

    const profile = aiSiteWizardProfileSchema.parse(profileInput)
    const baseTenantId = await getOrCreateBaseTemplateTenantId()
    const preview = await aiSiteWizardService.generateFromWorkspace(profile, baseTenantId)

    return { success: true, preview: serializeForClient(preview) }
  } catch (error) {
    console.error('[generateAiSitePreviewAction]', error)

    return { success: false, error: formatActionError(error, 'Failed to generate your website.') }
  }
}

export async function applyAiGeneratedSiteAction(
  templateId: string,
  preview: AiSiteGenerationPreview
): Promise<ApplyResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !session.user.id) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    const { creditsService } = await import('@/services/credits')
    const unlimited = hasUnlimitedCredits(session.user)

    await creditsService.assertCanAfford(session.user.tenantId, 'major_redesign', { unlimited })
    await aiSiteWizardService.applyGeneratedSite(session.user.tenantId, templateId, preview)
    await creditsService.spend({
      tenantId: session.user.tenantId,
      feature: 'major_redesign',
      actorUserId: session.user.id,
      description: 'Applied AI-generated website',
      unlimited
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[applyAiGeneratedSiteAction]', error)

    return { success: false, error: 'Failed to create your website.' }
  }
}

export async function generateAiSiteFromWorkspaceAction(
  profileInput: AiSiteWizardProfile
): Promise<GenerateResult> {
  try {
    await requireSuperAdminSession()

    const profile = aiSiteWizardProfileSchema.parse(profileInput)
    const tenantId = await getOrCreateBaseTemplateTenantId()
    const preview = await aiSiteWizardService.generateFromWorkspace(profile, tenantId)

    return { success: true, preview: serializeForClient(preview) }
  } catch (error) {
    console.error('[generateAiSiteFromWorkspaceAction]', error)

    return { success: false, error: formatActionError(error, 'Failed to generate a website from your design.') }
  }
}

export async function saveAiGeneratedSiteToLibraryAction(
  preview: AiSiteGenerationPreview,
  input: { name: string; description?: string; category?: AiSiteWizardProfile['category']; logoUrl?: string }
): Promise<{ success: true; templateId: string } | { success: false; error: string }> {
  try {
    const session = await requireSuperAdminSession()
    const userId = await resolveSessionUserId(session)
    const template = await aiSiteWizardService.saveGeneratedSiteToLibrary(userId, preview, input)

    return { success: true, templateId: template.id }
  } catch (error) {
    console.error('[saveAiGeneratedSiteToLibraryAction]', error)

    return { success: false, error: formatActionError(error, 'Failed to save this website to the library.') }
  }
}

export async function ensureBaseWebsitePagesAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    await requireSuperAdminSession()
    const tenantId = await getOrCreateBaseTemplateTenantId()
    await sitePageService.ensureBaseWebsitePages(tenantId)

    return { success: true }
  } catch (error) {
    return { success: false, error: formatActionError(error, 'Failed to prepare Home, About, and Contact pages.') }
  }
}
