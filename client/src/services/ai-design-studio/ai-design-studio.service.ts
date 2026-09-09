import 'server-only'

import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { findBlockInTree } from '@/features/your-space/utils/blockTreeUtils'
import { inferDesignProfile } from '@/lib/ai-design-studio/brief-inference'
import {
  applyAnimatedBackgroundToBlocks,
  polishLeafControls
} from '@/lib/ai-design-studio/control-polish'
import { restyleControlBlocks } from '@/lib/ai-design-studio/restyle-control'
import type { DesignProposal, DesignScope, RewordResult } from '@/lib/ai-design-studio/types'
import { applyDesignBriefToBlocks } from '@/lib/ai-site-wizard/block-layout'
import {
  applyMediaFills,
  collectBlockMediaSlots,
  collectForceBackgroundPaths,
  collectProposalPhotoPreviews
} from '@/lib/ai-site-wizard/block-media'
import { applyThemeHarmonyToBlocks } from '@/lib/ai-site-wizard/block-theme'
import { applyBlockTextPatches, collectBlockTextFields, type BlockTextField } from '@/lib/ai-site-wizard/block-text'
import {
  type AiDesignBrief,
  type RawDesignBrief,
  DESIGN_SYSTEM_PROMPT,
  buildDesignUserPayload,
  normalizeDesignBrief
} from '@/lib/ai-site-wizard/design-brief'
import {
  buildFallbackDesignBrief,
  buildSiteStylesFromBrief,
  getFontLabel,
  resolveAllowedMotion
} from '@/lib/ai-site-wizard/style-mapper'
import { fillMediaSlotsFromUnsplash, resolveUnsplashColorFilter } from '@/lib/ai-site-wizard/unsplash-fill'
import { AppError } from '@/lib/errors'
import { createJsonCompletion, getOpenAiDesignModel, isOpenAiConfigured } from '@/lib/openai/client'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'
import { tenantRepository } from '@/repositories/tenant.repository'

const REWORD_SYSTEM_PROMPT = `You are a senior website copywriter improving copy that is already live. Rewrite each field in place.

Return JSON only, no prose:
{"r":[{"p":"path","f":"field","v":"new text"}]}

Craft:
- Read every field first. The rewrite must stay consistent across the whole set — one voice, one story, no contradictions.
- Keep each field in the role it already plays: a headline stays a headline, an eyebrow stays a short label, a button stays an action.
- Keep roughly the same length as the original. Never turn a 6-word headline into a paragraph.
- Say something specific. Cut filler like "Welcome to our website", "Your trusted partner", "Excellence delivered", "Learn more" repeated everywhere.
- Lead with the benefit to the reader, then the proof.

Hard limits:
- Preserve every fact: names, places, offerings, and anything that reads as a commitment.
- Never invent a phone number, email, street address, price, statistic, award, or year founded.
- Never repeat the same sentence across two fields.
- Only return paths present in the input catalog. Skip a field instead of padding it.
- Max 40 items in r.`

const ANIMATED_BACKGROUND_REQUEST =
  /\b(animated?|motion|moving|gradient)\s+(background|backdrop|fill)|\b(background|backdrop)\s+(animated?|moving|gradient)\b/i
const PHOTO_BACKGROUND_REQUEST =
  /\b(photo|photographic|image|picture|photography)\s+(background|backdrop|fill)|\b(background|backdrop)\s+(photo|photographic|image|picture)\b/i

type ScopeInput = {
  scope: DesignScope
  pageSlug: string
  blocks: Block[]
  targetBlockId: string | null
  instruction: string
  tenantId: string
}

type ResolvedScope = {

  /** The blocks the engine transforms: one control, or the whole page. */
  scopeBlocks: Block[]
  targetLabel: string
  targetBlockId: string | null
}

function newNonce(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function humanize(value: string): string {
  return value.replace(/[-_]/g, ' ')
}

function pageLabel(pageSlug: string): string {
  return `the ${pageSlug === 'home' ? 'Home' : humanize(pageSlug).replace(/^./, char => char.toUpperCase())} page`
}

export class AiDesignStudioService {
  private resolveScope(input: ScopeInput): ResolvedScope {
    if (input.scope === 'page') {
      return { scopeBlocks: input.blocks, targetLabel: pageLabel(input.pageSlug), targetBlockId: null }
    }

    if (!input.targetBlockId) {
      throw new AppError('Select a control first.', 400, 'CONTROL_REQUIRED')
    }

    const block = findBlockInTree(input.blocks, input.targetBlockId)

    if (!block) {
      throw new AppError('That control is no longer on the page.', 404, 'CONTROL_NOT_FOUND')
    }

    return { scopeBlocks: [block], targetLabel: `the ${block.type} control`, targetBlockId: block.id }
  }

  private async resolveBusinessName(tenantId: string, pageCopy: string[]): Promise<{ name: string; logoUrl?: string }> {
    try {
      const tenant = await tenantRepository.findById(tenantId)

      if (tenant?.name) {
        return { name: tenant.name, logoUrl: tenant.settings?.logoUrl }
      }
    } catch (error) {
      console.error('[AiDesignStudioService] tenant lookup failed', error)
    }

    return { name: pageCopy[0]?.slice(0, 80) ?? 'This business' }
  }

  private async buildBrief(profile: AiSiteWizardProfile): Promise<{ brief: AiDesignBrief; usedOpenAi: boolean }> {
    const fallback = buildFallbackDesignBrief(profile)

    if (!isOpenAiConfigured()) {
      return { brief: fallback, usedOpenAi: false }
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

      return { brief: normalizeDesignBrief(raw, profile, fallback, allowedMotion), usedOpenAi: true }
    } catch (error) {
      console.error('[AiDesignStudioService] design brief failed', error)

      return { brief: fallback, usedOpenAi: false }
    }
  }

  /**
   * A control redesign must still look like it belongs to the site, so the palette stays
   * pinned to the live theme. Structure, motion, density, and corners stay free so each
   * redesign can visibly try a different layout and style.
   */
  private pinBriefToTheme(
    brief: AiDesignBrief,
    siteStyles: SiteStyles,
    _profile: AiSiteWizardProfile
  ): AiDesignBrief {
    return {
      ...brief,
      accent: siteStyles.colors.accent,
      background: siteStyles.colors.background,
      text: siteStyles.colors.text,
      surface: siteStyles.colors.swatch1,
      gradientStart: siteStyles.misc.pageSplitVisualColorStart?.trim() || siteStyles.colors.accent,
      gradientEnd: siteStyles.misc.pageSplitVisualColorEnd?.trim() || siteStyles.colors.swatch5,
      themeId: siteStyles.themeId
    }
  }

  private async requestCopy(
    fields: BlockTextField[],
    profile: AiSiteWizardProfile,
    instruction: string
  ): Promise<Array<{ path: string; field: string; value: string }>> {
    if (!fields.length || !isOpenAiConfigured()) {
      return []
    }

    const catalog = fields.slice(0, 40).map(field => ({ p: field.path, f: field.field, v: field.currentValue }))

    try {
      const response = await createJsonCompletion<{ r?: Array<{ p: string; f: string; v: string }> }>({
        system: REWORD_SYSTEM_PROMPT,
        user: JSON.stringify({
          business: {
            name: profile.companyName,
            industry: profile.industry,
            audience: profile.audience || undefined,
            offerings: profile.keyOfferings || undefined,
            voice: profile.brandVoice === 'ai_pick' ? undefined : profile.brandVoice
          },
          instruction: instruction.trim() || 'Sharpen this copy without changing what it promises.',
          nonce: profile.generationNonce,
          fields: catalog
        }),
        temperature: 0.85
      })

      const allowed = new Set(catalog.map(item => `${item.p}:${item.f}`))

      return (response.r ?? [])
        .filter(item => allowed.has(`${item.p}:${item.f}`) && item.v?.trim())
        .map(item => ({ path: item.p, field: item.f, value: item.v.trim() }))
    } catch (error) {
      console.error('[AiDesignStudioService] reword failed', error)

      return []
    }
  }

  /**
   * Build a redesign without touching the draft. The caller shows it for confirmation and
   * only then applies the returned blocks and tokens.
   */
  async proposeRestyle(input: ScopeInput & { siteStyles: SiteStyles; rewriteCopy: boolean }): Promise<DesignProposal> {
    const { scopeBlocks, targetLabel, targetBlockId } = this.resolveScope(input)

    if (!scopeBlocks.length) {
      throw new AppError('There is nothing on this page to redesign yet.', 400, 'EMPTY_SCOPE')
    }

    const pageCopy = collectBlockTextFields(input.pageSlug, input.blocks).map(field => field.currentValue)
    const brand = await this.resolveBusinessName(input.tenantId, pageCopy)
    const nonce = newNonce()

    const profile = inferDesignProfile({
      businessName: brand.name,
      logoUrl: brand.logoUrl,
      pageCopy,
      instruction: input.instruction,
      nonce
    })

    const briefResult = await this.buildBrief(profile)
    const isPageScope = input.scope === 'page'

    const brief = isPageScope
      ? briefResult.brief
      : this.pinBriefToTheme(briefResult.brief, input.siteStyles, profile)

    const nextStyles = isPageScope ? buildSiteStylesFromBrief(brief, profile) : input.siteStyles
    const wantsPhotoBackground = PHOTO_BACKGROUND_REQUEST.test(input.instruction)
    const wantsAnimatedBackground = ANIMATED_BACKGROUND_REQUEST.test(input.instruction)

    const contentMediaSlots = collectBlockMediaSlots(
      input.pageSlug,
      scopeBlocks,
      `${profile.industry} ${profile.category}`
    )

    // Animated backdrop must cycle panel motion/colors — never swap section photos.
    // Photo backgrounds are only fetched when the user explicitly asks for photography.
    const mediaSlots = (
      wantsAnimatedBackground
        ? contentMediaSlots.filter(slot => slot.kind !== 'background')
        : [
            ...contentMediaSlots,
            ...collectForceBackgroundPaths(input.pageSlug, scopeBlocks, wantsPhotoBackground).map(path => ({
              path,
              kind: 'background' as const,
              currentUrl: '',
              queryHint: profile.industry
            }))
          ]
    ).slice(0, isPageScope ? 12 : 4)

    const { fills, used } = await fillMediaSlotsFromUnsplash(profile, mediaSlots, nonce, {
      color: resolveUnsplashColorFilter(brief.paletteId),
      accentHex: brief.accent,
      keywords: brief.photoKeywords
    })

    let blocks = polishLeafControls(
      input.pageSlug,
      applyDesignBriefToBlocks(
        input.pageSlug,
        applyThemeHarmonyToBlocks(
          input.pageSlug,
          applyMediaFills(input.pageSlug, scopeBlocks, fills, wantsPhotoBackground),
          nextStyles
        ),
        brief,
        profile
      ),
      brief,
      profile
    )

    if (!isPageScope) {
      // Control redesigns need an explicit layout/style shuffle — brief density alone often
      // left the selected block looking unchanged. Keep palette on-theme via pinBriefToTheme.
      blocks = restyleControlBlocks(blocks, input.siteStyles, brief, profile, nonce)
    }

    if (wantsAnimatedBackground) {
      blocks = applyAnimatedBackgroundToBlocks(input.pageSlug, blocks, brief, nonce)
    }

    let rewordedFields = 0

    if (input.rewriteCopy) {
      const replacements = await this.requestCopy(
        collectBlockTextFields(input.pageSlug, blocks),
        profile,
        input.instruction
      )

      if (replacements.length) {
        blocks = applyBlockTextPatches(input.pageSlug, blocks, replacements)
        rewordedFields = replacements.length
      }
    }

    const animatedSample = wantsAnimatedBackground
      ? (blocks[0]?.props as { splitVisualAnimation?: string; splitVisualColorStart?: string } | undefined)
      : undefined

    const highlights = [
      `Palette: ${brief.accent} accent on ${brief.background} in ${brief.colorMode} mode`,
      `Typography: ${getFontLabel(brief)}`,
      `Rhythm: ${brief.density} spacing with ${brief.corners} corners`,
      wantsAnimatedBackground
        ? `Animated backdrop: ${humanize(animatedSample?.splitVisualAnimation ?? brief.motion)} with fresh gradient colors`
        : `Motion: ${humanize(brief.motion)}`,
      ...(wantsPhotoBackground && used > 0
        ? [`Photography: ${used} image${used === 1 ? '' : 's'} for "${brief.photoKeywords.join('", "')}"`]
        : !wantsAnimatedBackground && used > 0
          ? [`Photography: ${used} image${used === 1 ? '' : 's'} for "${brief.photoKeywords.join('", "')}"`]
          : []),
      ...(rewordedFields > 0 ? [`Copy: ${rewordedFields} field${rewordedFields === 1 ? '' : 's'} rewritten`] : []),
      ...(isPageScope && !wantsAnimatedBackground
        ? [`Hero framing: ${humanize(brief.heroLayout)} with a ${brief.heroOverlay} overlay`]
        : !isPageScope && !wantsAnimatedBackground
          ? [`Layout explore: ${brief.density} rhythm, ${brief.corners} corners, theme-matched colors`]
          : [])
    ]

    return toPlainJson({
      scope: input.scope,
      pageSlug: input.pageSlug,
      targetLabel,
      targetBlockId,
      concept: brief.concept,
      rationale: brief.rationale,
      palette: {
        accent: brief.accent,
        background: brief.background,
        text: brief.text,
        surface: brief.surface,
        gradientStart:
          (blocks[0]?.props as { splitVisualColorStart?: string } | undefined)?.splitVisualColorStart ||
          brief.gradientStart,
        gradientEnd:
          (blocks[0]?.props as { splitVisualColorEnd?: string } | undefined)?.splitVisualColorEnd || brief.gradientEnd
      },
      fontLabel: getFontLabel(brief),
      motionLabel: humanize(
        (blocks[0]?.props as { splitVisualAnimation?: string } | undefined)?.splitVisualAnimation || brief.motion
      ),
      highlights,
      blocks,
      siteStyles: isPageScope ? nextStyles : null,
      rewordedFields,
      photoCount: wantsAnimatedBackground ? 0 : used,
      photoPreviews: wantsAnimatedBackground ? [] : collectProposalPhotoPreviews(input.pageSlug, blocks),
      usedOpenAi: briefResult.usedOpenAi
    }) as DesignProposal
  }

  /** Rewrite the copy in scope, reading the whole page so the new wording stays in context. */
  async reword(input: ScopeInput): Promise<RewordResult> {
    const { scopeBlocks, targetLabel, targetBlockId } = this.resolveScope(input)
    const fields = collectBlockTextFields(input.pageSlug, scopeBlocks)

    if (!fields.length) {
      throw new AppError(`There is no editable text in ${targetLabel}.`, 400, 'NO_TEXT_IN_SCOPE')
    }

    if (!isOpenAiConfigured()) {
      throw new AppError('Copywriting is unavailable because OpenAI is not configured.', 503, 'OPENAI_UNAVAILABLE')
    }

    const pageCopy = collectBlockTextFields(input.pageSlug, input.blocks).map(field => field.currentValue)
    const brand = await this.resolveBusinessName(input.tenantId, pageCopy)

    const profile = inferDesignProfile({
      businessName: brand.name,
      logoUrl: brand.logoUrl,
      pageCopy,
      instruction: input.instruction,
      nonce: newNonce()
    })

    const replacements = await this.requestCopy(fields, profile, input.instruction)

    if (!replacements.length) {
      throw new AppError('I could not improve that copy. Try telling me what to change.', 422, 'NO_COPY_CHANGES')
    }

    return toPlainJson({
      blocks: applyBlockTextPatches(input.pageSlug, scopeBlocks, replacements),
      targetBlockId,
      changed: replacements.length,
      note: `Rewrote ${replacements.length} field${replacements.length === 1 ? '' : 's'} in ${targetLabel}.`
    }) as RewordResult
  }
}

export const aiDesignStudioService = new AiDesignStudioService()
