'use server'

import { auth } from '@/lib/auth'
import { formatActionError } from '@/lib/auth/resolve-session-user-id'
import { AppError } from '@/lib/errors'
import { pickBestTemplate } from '@/lib/ai-site-wizard/template-matcher'
import type { AiSiteGenerationPreview, AiTemplateRecommendation } from '@/lib/ai-site-wizard/types'
import {
  aiSiteWizardProfileSchema,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'
import { aiSiteWizardService } from '@/services/ai-site-wizard/ai-site-wizard.service'
import { siteTemplateService } from '@/services/site-template'

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
    const profile = aiSiteWizardProfileSchema.parse(profileInput)
    const templates = await siteTemplateService.listPublishedTemplates()
    const preview = await aiSiteWizardService.generateCustomizedSite(profile, templates)

    return { success: true, preview }
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

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in with an organization.' }
    }

    await aiSiteWizardService.applyGeneratedSite(session.user.tenantId, templateId, preview)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[applyAiGeneratedSiteAction]', error)

    return { success: false, error: 'Failed to create your website.' }
  }
}
