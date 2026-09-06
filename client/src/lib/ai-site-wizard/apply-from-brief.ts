import {
  applyAiGeneratedSiteAction,
  generateAiSitePreviewAction
} from '@/app/actions/ai-site-wizard.actions'
import { getRequestedAiBuilderBlocks } from '@/lib/ai-builder/planner'
import { inferDesignProfile } from '@/lib/ai-design-studio/brief-inference'
import type { AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'
import { createBlock } from '@/features/your-space/utils/blockFactory'
import { flattenBlocks } from '@/features/your-space/utils/blockTreeUtils'

const COMPANY_PATTERN = /(?:for|called|named)\s+([a-z0-9][a-z0-9 &.'-]{1,80})/i

export function resolveBusinessNameFromBrief(prompt: string, businessName?: string) {
  return businessName?.trim() || prompt.match(COMPANY_PATTERN)?.[1]?.trim() || 'Your new brand'
}

/** Add explicit control requests from the brief (contact form, map, pricing, …) onto the draft. */
export function augmentGeneratedPreview(
  preview: AiSiteGenerationPreview,
  prompt: string
): { preview: AiSiteGenerationPreview; addedLabels: string[] } {
  const requests = getRequestedAiBuilderBlocks(prompt)
  const pages = preview.pages.map(page => ({ ...page, blocks: [...page.blocks] }))
  const sharedStyles = pages.find(page => page.slug === 'home')?.siteStyles ?? pages[0]?.siteStyles ?? null
  const addedLabels: string[] = []

  for (const request of requests) {
    const preferredSlug =
      request.type === 'contactForm' || request.type === 'location'
        ? 'contact'
        : request.type === 'pricing'
          ? 'pricing'
          : 'home'

    const pageIndex = pages.findIndex(page => page.slug === preferredSlug)
    const fallbackIndex = pageIndex === -1 ? pages.findIndex(page => page.slug === 'home') : pageIndex
    const targetPage = pages[fallbackIndex === -1 ? 0 : fallbackIndex]

    if (!targetPage || flattenBlocks(targetPage.blocks).some(block => block.type === request.type) || !sharedStyles) {
      continue
    }

    targetPage.blocks = [...targetPage.blocks, createBlock(request.type, sharedStyles, request.paletteId)]
    addedLabels.push(request.label)
  }

  if (addedLabels.length === 0) {
    return { preview, addedLabels }
  }

  return {
    preview: {
      ...preview,
      pages,
      generationNotes: [...preview.generationNotes, `Added requested controls: ${addedLabels.join(', ')}.`]
    },
    addedLabels
  }
}

export type ApplySiteFromBriefResult = {
  preview: AiSiteGenerationPreview
  addedLabels: string[]
  designConcept: string
}

/**
 * Generate + apply a full site from a free-text brief. Requires an authenticated tenant
 * session (call after registration `update()` so JWT includes tenantId).
 */
export async function applySiteFromBrief(
  prompt: string,
  businessName?: string
): Promise<ApplySiteFromBriefResult> {
  const trimmed = prompt.trim()

  if (!trimmed) {
    throw new Error('Describe the website you want to build.')
  }

  const profile = inferDesignProfile({
    businessName: resolveBusinessNameFromBrief(trimmed, businessName),
    pageCopy: [trimmed],
    instruction: trimmed,
    nonce: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  })

  const previewResult = await generateAiSitePreviewAction(profile)

  if (!previewResult.success) {
    throw new Error(previewResult.error)
  }

  const augmented = augmentGeneratedPreview(previewResult.preview, trimmed)
  const applyResult = await applyAiGeneratedSiteAction(augmented.preview.templateId, augmented.preview)

  if (!applyResult.success) {
    throw new Error(applyResult.error)
  }

  return {
    preview: augmented.preview,
    addedLabels: augmented.addedLabels,
    designConcept: previewResult.preview.designConcept
  }
}
