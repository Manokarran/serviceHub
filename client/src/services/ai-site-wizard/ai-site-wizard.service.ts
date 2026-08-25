import 'server-only'

import type { Block } from '@/features/your-space/types'
import { STARTER_BLOCKS } from '@/features/your-space/constants'
import { createAboutPageBlocks, createContactPageBlocks, createPricingPageBlocks } from '@/features/your-space/constants/pageTemplates'
import { cloneBlockWithNewIds } from '@/features/your-space/utils/blockFactory'
import {
  applyBrandToBlocks,
  applyMediaFills,
  collectBlockMediaSlots,
  collectForceBackgroundPaths
} from '@/lib/ai-site-wizard/block-media'
import { applyDesignBriefToBlocks } from '@/lib/ai-site-wizard/block-layout'
import { collectBlockTextFields, applyBlockTextPatches } from '@/lib/ai-site-wizard/block-text'
import { applyThemeHarmonyToBlocks, describeThemeHarmony } from '@/lib/ai-site-wizard/block-theme'
import {
  type AiDesignBrief,
  type RawDesignBrief,
  DESIGN_SYSTEM_PROMPT,
  buildDesignUserPayload,
  normalizeDesignBrief
} from '@/lib/ai-site-wizard/design-brief'
import { buildCompactTextCatalog, buildCopyBrief } from '@/lib/ai-site-wizard/prompt-compact'
import {
  buildFallbackDesignBrief,
  buildSiteStylesFromBrief,
  getFontLabel,
  resolveAllowedMotion
} from '@/lib/ai-site-wizard/style-mapper'
import { pickBestTemplate } from '@/lib/ai-site-wizard/template-matcher'
import type { AiCustomizedPage, AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'
import { fillMediaSlotsFromUnsplash, resolveUnsplashColorFilter } from '@/lib/ai-site-wizard/unsplash-fill'
import { buildProfileVarietySeed } from '@/lib/ai-site-wizard/variety'
import { AppError } from '@/lib/errors'
import { createJsonCompletion, getOpenAiDesignModel, isOpenAiConfigured } from '@/lib/openai/client'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'
import type { ISitePageBlock } from '@/models/site-page'
import type { ISiteTemplatePageSnapshot, SiteTemplateSummary } from '@/models/site-template'
import { sitePageRepository } from '@/repositories/site-page.repository'
import { siteTemplateRepository } from '@/repositories/site-template.repository'
import { tenantRepository } from '@/repositories/tenant.repository'
import { sitePageService } from '@/services/site-page'
import { siteTemplateService } from '@/services/site-template'
import { siteWorkspaceService } from '@/services/site-workspace'

type BasePage = {
  slug: string
  title: string
  description: string
  blocks: Block[]
}

const COPY_SYSTEM_PROMPT = `You are a senior website copywriter. Rewrite every placeholder into original, specific copy for one business.

Return JSON only:
{"r":[{"p":"path","f":"field","v":"new text"}],"m":[{"s":"page-slug","t":"page title","d":"meta description 140-180 chars"}]}

Voice and craft:
- Write in the requested brand voice. If none is given, choose one that fits the industry and stay in it for every field.
- Speak to the stated audience about the stated offerings. Use their words, not marketing filler.
- Lead with the benefit, then the proof. Concrete beats clever.

Field rules:
- Headlines (title): 4-10 words. Specific to this business. Never "Welcome to our website", "Your trusted partner", "Excellence delivered", or any phrase that would fit a different company.
- Eyebrow: 1-4 words, sets context above the headline.
- Subtitle: one sentence, max 20 words, expands the headline without repeating it.
- Body and about copy: 2-3 sentences, vivid and grounded in the description. Vary sentence length.
- Buttons: 2-4 words, an action the visitor takes. Vary them; do not repeat "Learn more" everywhere.
- Meta descriptions: 140-180 characters, written for search results, include the business name once.

Hard limits:
- Never invent a phone number, email, street address, price, statistic, award, or year founded.
- Never repeat the same sentence or headline across two fields.
- Use the company name naturally, roughly two or three times across the whole site.
- Only return paths present in the input catalog. Max 48 items in r.`

function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(block => cloneBlockWithNewIds(block))
}

function buildStarterBasePages(): BasePage[] {
  return [
    { slug: 'home', title: 'Home', description: '', blocks: cloneBlocks(STARTER_BLOCKS) },
    { slug: 'about', title: 'About', description: '', blocks: createAboutPageBlocks() },
    { slug: 'pricing', title: 'Pricing', description: '', blocks: createPricingPageBlocks() },
    { slug: 'contact', title: 'Contact', description: '', blocks: createContactPageBlocks() }
  ]
}

export class AiSiteWizardService {
  async generateCustomizedSite(
    profile: AiSiteWizardProfile,
    templates: SiteTemplateSummary[]
  ): Promise<AiSiteGenerationPreview> {
    const pick = pickBestTemplate(profile, templates)

    if (pick) {
      const template = await siteTemplateRepository.findById(pick.templateId)

      if (template?.status === 'published' && template.pages?.length) {
        const pages = (toPlainJson(template.pages) as ISiteTemplatePageSnapshot[]).map(page => ({
          slug: page.slug,
          title: page.title,
          description: page.description,
          blocks: cloneBlocks(page.blocks as Block[])
        }))

        return this.customizeBasePages(profile, pages, {
          templateId: pick.templateId,
          templateName: pick.templateName,
          layoutReason: pick.reason,
          layoutMatchScore: pick.matchScore,
          source: 'library'
        })
      }
    }

    return this.customizeBasePages(profile, buildStarterBasePages(), {
      templateId: 'starter',
      templateName: 'Base website',
      layoutReason: 'Using the Home, About, and Contact starter layout as the design base.',
      layoutMatchScore: 70,
      source: 'starter'
    })
  }

  async generateFromWorkspace(profile: AiSiteWizardProfile, tenantId: string): Promise<AiSiteGenerationPreview> {
    if (!tenantId) {
      throw new AppError('Workspace is required', 400, 'TENANT_REQUIRED')
    }

    await sitePageService.ensureBaseWebsitePages(tenantId)

    const pages = await sitePageRepository.listByTenant(tenantId)

    const basePages: BasePage[] = pages.map(page => {
      const rawBlocks = page.draftBlocks?.length ? page.draftBlocks : page.blocks ?? []
      const draftBlocks = toPlainJson(rawBlocks) as unknown as Block[]

      return {
        slug: page.slug,
        title: page.title ?? page.slug,
        description: page.description ?? '',
        blocks: cloneBlocks(draftBlocks)
      }
    })

    const baseSlugs = new Set(['home', 'about', 'contact'])
    const usable = basePages.filter(page => page.blocks.length > 0 && baseSlugs.has(page.slug.toLowerCase()))

    return this.customizeBasePages(profile, usable.length ? usable : buildStarterBasePages(), {
      templateId: 'base_template',
      templateName: 'Master base template',
      layoutReason: usable.length
        ? 'Using the latest master base template (Home, About, Contact) as the design base.'
        : 'The base template was empty, so the starter Home, About, and Contact layout was used.',
      layoutMatchScore: usable.length ? 100 : 70,
      source: 'workspace'
    })
  }

  private async customizeBasePages(
    profile: AiSiteWizardProfile,
    basePages: BasePage[],
    meta: {
      templateId: string
      templateName: string
      layoutReason: string
      layoutMatchScore: number
      source: AiSiteGenerationPreview['source']
    }
  ): Promise<AiSiteGenerationPreview> {
    const notes: string[] = [
      `Using ${meta.templateName} as the layout base.`,
      `Writing copy for ${profile.companyName}.`
    ]

    const pageSlugs = basePages.map(page => page.slug)

    const brandedPages = basePages.map(page => ({
      ...page,
      blocks: applyBrandToBlocks(page.blocks, {
        companyName: profile.siteTitle?.trim() || profile.companyName,
        logoUrl: profile.logoUrl,
        pageSlugs
      })
    }))

    const allFields = brandedPages.flatMap(page => collectBlockTextFields(page.slug, page.blocks))
    const catalog = buildCompactTextCatalog(allFields)
    const fallbackBrief = buildFallbackDesignBrief(profile)
    const openAiReady = isOpenAiConfigured()

    const [copyResult, briefResult] = await Promise.all([
      this.generateCopy(profile, catalog, openAiReady),
      this.generateDesignBrief(profile, fallbackBrief, openAiReady)
    ])

    notes.push(copyResult.note)
    notes.push(briefResult.note)

    const brief = briefResult.brief
    const seed = buildProfileVarietySeed(profile)

    const copiedPages = brandedPages.map(page => ({
      ...page,
      blocks: applyBlockTextPatches(page.slug, page.blocks, copyResult.replacements)
    }))

    const homeStyles = buildSiteStylesFromBrief(brief, profile)
    const fontLabel = getFontLabel(brief)

    const mediaSlots = copiedPages
      .flatMap(page => [
        ...collectBlockMediaSlots(page.slug, page.blocks, `${profile.industry} ${profile.category}`),
        ...collectForceBackgroundPaths(page.slug, page.blocks).map(path => ({
          path,
          kind: 'background' as const,
          currentUrl: '',
          queryHint: profile.industry
        }))
      ])
      .slice(0, 12)

    const { fills, used } = await fillMediaSlotsFromUnsplash(profile, mediaSlots, seed, {
      color: resolveUnsplashColorFilter(brief.paletteId),
      accentHex: brief.accent,
      keywords: brief.photoKeywords
    })

    notes.push(
      used > 0
        ? `Selected ${used} photos for "${brief.photoKeywords.join('", "')}".`
        : 'Photography was left as in the base layout.'
    )
    notes.push(
      `Applied the ${brief.themeId} theme in ${brief.colorMode} mode with ${fontLabel}, ${brief.density} spacing, and ${brief.motion} motion.`
    )
    notes.push(describeThemeHarmony(homeStyles))

    const customizedPages: AiCustomizedPage[] = copiedPages.map(page => {
      const blocks = applyDesignBriefToBlocks(
        page.slug,
        applyThemeHarmonyToBlocks(
          page.slug,
          applyMediaFills(page.slug, page.blocks, fills, profile.animationLevel !== 'none'),
          homeStyles
        ),
        brief,
        profile
      )

      const metaEntry = copyResult.pageMeta.find(entry => entry.slug === page.slug)

      return {
        slug: page.slug,
        title: metaEntry?.title || page.title,
        description: metaEntry?.description || page.description,
        blocks,
        siteStyles: isHomePageSlug(page.slug) ? homeStyles : null
      }
    })

    return toPlainJson({
      templateId: meta.templateId,
      templateName: meta.templateName,
      layoutReason: meta.layoutReason,
      layoutMatchScore: meta.layoutMatchScore,
      styleThemeId: brief.themeId,
      stylePageAnimation: brief.motion,
      styleGradientId: brief.paletteId,
      styleFontFamily: fontLabel,
      photoCount: used,
      generationNotes: notes,
      source: meta.source,
      pages: customizedPages,
      usedOpenAi: copyResult.usedOpenAi,
      designConcept: brief.concept,
      designRationale: brief.rationale,
      designFontId: brief.fontPairingId,
      designPalette: {
        accent: brief.accent,
        background: brief.background,
        text: brief.text,
        surface: brief.surface,
        gradientStart: brief.gradientStart,
        gradientEnd: brief.gradientEnd
      },
      designColorMode: brief.colorMode,
      designDensity: brief.density,
      designCorners: brief.corners,
      designHeroLayout: brief.heroLayout,
      designByAi: !brief.isFallback
    })
  }

  private async generateCopy(
    profile: AiSiteWizardProfile,
    catalog: Array<{ p: string; f: string; v: string }>,
    openAiReady: boolean
  ): Promise<{
    replacements: Array<{ path: string; field: string; value: string }>
    pageMeta: Array<{ slug: string; title?: string; description?: string }>
    usedOpenAi: boolean
    note: string
  }> {
    const empty = { replacements: [], pageMeta: [], usedOpenAi: false }

    if (!catalog.length) {
      return { ...empty, note: 'The base layout had no rewritable text.' }
    }

    if (!openAiReady) {
      return { ...empty, note: 'OpenAI is not configured, so the base layout copy was kept.' }
    }

    try {
      const response = await createJsonCompletion<{
        r?: Array<{ p: string; f: string; v: string }>
        m?: Array<{ s: string; t?: string; d?: string }>
      }>({
        system: COPY_SYSTEM_PROMPT,
        user: JSON.stringify({
          business: buildCopyBrief(profile),
          nonce: profile.generationNonce,
          fields: catalog
        }),
        temperature: 0.9
      })

      const allowed = new Set(catalog.map(item => `${item.p}:${item.f}`))

      const replacements = (response.r ?? [])
        .filter(item => allowed.has(`${item.p}:${item.f}`) && item.v?.trim())
        .map(item => ({ path: item.p, field: item.f, value: item.v.trim() }))

      const pageMeta = (response.m ?? []).map(item => ({
        slug: item.s,
        title: item.t?.trim(),
        description: item.d?.trim()
      }))

      return {
        replacements,
        pageMeta,
        usedOpenAi: replacements.length > 0,
        note: replacements.length
          ? `Wrote ${replacements.length} original headlines, stories, and page descriptions.`
          : 'Copy stayed close to the base layout.'
      }
    } catch (error) {
      console.error('[AiSiteWizardService] copy generation failed', error)

      return { ...empty, note: 'Copy generation was skipped, so placeholder text was kept.' }
    }
  }

  private async generateDesignBrief(
    profile: AiSiteWizardProfile,
    fallback: AiDesignBrief,
    openAiReady: boolean
  ): Promise<{ brief: AiDesignBrief; note: string }> {
    if (!openAiReady) {
      return { brief: fallback, note: `Used the built-in "${fallback.concept}" design direction.` }
    }

    const allowedMotion = resolveAllowedMotion(profile)

    try {
      const raw = await createJsonCompletion<RawDesignBrief>({
        system: DESIGN_SYSTEM_PROMPT,
        user: buildDesignUserPayload(profile, { motion: allowedMotion }),
        temperature: 1,
        model: getOpenAiDesignModel(),
        timeoutMs: 25_000
      })

      const brief = normalizeDesignBrief(raw, profile, fallback, allowedMotion)

      return { brief, note: `Art direction "${brief.concept}" — ${brief.rationale}` }
    } catch (error) {
      console.error('[AiSiteWizardService] design brief failed', error)

      return { brief: fallback, note: `Fell back to the built-in "${fallback.concept}" design direction.` }
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

    if (profileLogoOrColor(preview, templateId)) {
      const template = await siteTemplateRepository.findById(templateId)

      if (template?.tenantSettings?.primaryColor || template?.tenantSettings?.logoUrl) {
        await tenantRepository.updateSettings(tenantId, {
          primaryColor: template.tenantSettings.primaryColor,
          logoUrl: template.tenantSettings.logoUrl
        })
      }
    }

    if (templateId !== 'starter' && templateId !== 'workspace' && templateId !== 'base_template') {
      await siteTemplateRepository.incrementUsageCount(templateId)
    }

    await siteWorkspaceService.markSiteStarted(tenantId, {
      appliedTemplateId:
        templateId === 'starter' || templateId === 'workspace' || templateId === 'base_template'
          ? undefined
          : templateId
    })
  }

  async saveGeneratedSiteToLibrary(
    userId: string,
    preview: AiSiteGenerationPreview,
    input: { name: string; description?: string; category?: AiSiteWizardProfile['category']; logoUrl?: string }
  ) {
    return siteTemplateService.createTemplateFromGeneratedSite(userId, {
      name: input.name,
      description: input.description,
      category: input.category,
      preview,
      logoUrl: input.logoUrl
    })
  }
}

function profileLogoOrColor(preview: AiSiteGenerationPreview, templateId: string): boolean {
  return (
    Boolean(preview.pages[0]?.siteStyles?.colors?.accent) &&
    templateId !== 'starter' &&
    templateId !== 'workspace' &&
    templateId !== 'base_template'
  )
}

export const aiSiteWizardService = new AiSiteWizardService()
