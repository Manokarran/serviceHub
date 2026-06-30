import 'server-only'

import type { Block } from '@/features/your-space/types'
import { cloneBlockWithNewIds } from '@/features/your-space/utils/blockFactory'
import { applyBlockTextPatches, collectBlockTextFields } from '@/lib/ai-site-wizard/block-text'
import { buildCompactProfileSummary, buildCompactTextCatalog } from '@/lib/ai-site-wizard/prompt-compact'
import { applyAiStyleChoice, buildStyleChoiceFromProfile } from '@/lib/ai-site-wizard/style-mapper'
import { pickBestTemplate } from '@/lib/ai-site-wizard/template-matcher'
import type { AiCustomizedPage, AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'
import { AppError } from '@/lib/errors'
import { createJsonCompletion } from '@/lib/openai/client'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { ISitePageBlock } from '@/models/site-page'
import type { ISiteTemplatePageSnapshot, SiteTemplateSummary } from '@/models/site-template'
import { sitePageRepository } from '@/repositories/site-page.repository'
import { siteTemplateRepository } from '@/repositories/site-template.repository'
import { tenantRepository } from '@/repositories/tenant.repository'
import { sitePageService } from '@/services/site-page'
import { siteWorkspaceService } from '@/services/site-workspace'

const COPY_SYSTEM_PROMPT = `Rewrite website placeholder copy for a business. Return JSON only:
{"r":[{"p":"path","f":"field","v":"new text"}],"m":[{"s":"page-slug","t":"title","d":"description"}]}
Rules: concise professional copy; use company name naturally; no fake phone/email/address; only return paths from the input catalog; max 36 items in r.`

function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(block => cloneBlockWithNewIds(block))
}

export class AiSiteWizardService {
  /**
   * One OpenAI call total: layout is chosen locally, styles applied locally, AI only rewrites copy.
   */
  async generateCustomizedSite(
    profile: AiSiteWizardProfile,
    templates: SiteTemplateSummary[]
  ): Promise<AiSiteGenerationPreview> {
    const pick = pickBestTemplate(profile, templates)

    if (!pick) {
      throw new AppError('No published templates are available', 404, 'TEMPLATE_NOT_FOUND')
    }

    const template = await siteTemplateRepository.findById(pick.templateId)

    if (!template || template.status !== 'published' || !template.pages?.length) {
      throw new AppError('Template not found or unavailable', 404, 'TEMPLATE_NOT_FOUND')
    }

    const detailPages = toPlainJson(template.pages) as ISiteTemplatePageSnapshot[]
    const allFields = detailPages.flatMap(page => collectBlockTextFields(page.slug, page.blocks as Block[]))
    const catalog = buildCompactTextCatalog(allFields)

    let replacements: Array<{ path: string; field: string; value: string }> = []
    let pageMeta: Array<{ slug: string; title?: string; description?: string }> = []

    if (catalog.length > 0) {
      const contentResponse = await createJsonCompletion<{
        r?: Array<{ p: string; f: string; v: string }>
        m?: Array<{ s: string; t?: string; d?: string }>
      }>({
        system: COPY_SYSTEM_PROMPT,
        user: JSON.stringify({
          business: buildCompactProfileSummary(profile),
          fields: catalog
        }),
        temperature: 0.55
      })

      const allowed = new Set(catalog.map(item => `${item.p}:${item.f}`))

      replacements = (contentResponse.r ?? [])
        .filter(item => allowed.has(`${item.p}:${item.f}`) && item.v?.trim())
        .map(item => ({
          path: item.p,
          field: item.f,
          value: item.v.trim()
        }))

      pageMeta = (contentResponse.m ?? []).map(item => ({
        slug: item.s,
        title: item.t?.trim(),
        description: item.d?.trim()
      }))
    }

    const styleChoice = buildStyleChoiceFromProfile(profile)
    const homeStyles = applyAiStyleChoice(profile)

    const customizedPages: AiCustomizedPage[] = detailPages.map(page => {
      const blocks = cloneBlocks(page.blocks as Block[])
      const patchedBlocks = applyBlockTextPatches(page.slug, blocks, replacements)
      const meta = pageMeta.find(entry => entry.slug === page.slug)

      return {
        slug: page.slug,
        title: meta?.title || page.title,
        description: meta?.description || page.description,
        blocks: patchedBlocks,
        siteStyles: isHomePageSlug(page.slug) ? homeStyles : null
      }
    })

    return {
      templateId: pick.templateId,
      templateName: pick.templateName,
      layoutReason: pick.reason,
      layoutMatchScore: pick.matchScore,
      styleThemeId: styleChoice.themeId,
      stylePageAnimation: styleChoice.pageBackgroundAnimation,
      styleGradientId: styleChoice.gradientPresetId,
      pages: customizedPages,
      usedOpenAi: catalog.length > 0
    }
  }

  async applyGeneratedSite(tenantId: string, templateId: string, preview: AiSiteGenerationPreview): Promise<void> {
    if (!tenantId) {
      throw new AppError('Tenant is required', 400, 'TENANT_REQUIRED')
    }

    await sitePageService.ensureHomePage(tenantId)

    const existingPages = await sitePageRepository.listByTenant(tenantId)
    const existingBySlug = new Map(existingPages.map(page => [page.slug, page]))

    for (const page of preview.pages) {
      const siteStylesPayload = page.siteStyles
        ? (toPlainJson(page.siteStyles) as unknown as Record<string, unknown>)
        : null

      if (existingBySlug.has(page.slug)) {
        await sitePageRepository.saveDraft(
          tenantId,
          page.blocks as unknown as ISitePageBlock[],
          page.slug,
          siteStylesPayload
        )
      } else {
        await sitePageService.createPage(tenantId, {
          title: page.title,
          slug: page.slug,
          draftBlocks: page.blocks as unknown as ISitePageBlock[]
        })

        if (siteStylesPayload) {
          await sitePageRepository.saveDraft(
            tenantId,
            page.blocks as unknown as ISitePageBlock[],
            page.slug,
            siteStylesPayload
          )
        }
      }

      if (page.title || page.description) {
        await sitePageRepository.updateMeta(tenantId, page.slug, {
          title: page.title,
          description: page.description
        })
      }
    }

    const template = await siteTemplateRepository.findById(templateId)

    if (template?.tenantSettings?.primaryColor || template?.tenantSettings?.logoUrl) {
      await tenantRepository.updateSettings(tenantId, {
        primaryColor: template.tenantSettings.primaryColor,
        logoUrl: template.tenantSettings.logoUrl
      })
    }

    await siteTemplateRepository.incrementUsageCount(templateId)
    await siteWorkspaceService.markSiteStarted(tenantId, { appliedTemplateId: templateId })
  }
}

export const aiSiteWizardService = new AiSiteWizardService()
