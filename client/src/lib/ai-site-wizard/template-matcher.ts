import { SITE_TEMPLATE_CATEGORY_LABELS } from '@/lib/constants/site-template'
import {
  AI_INDUSTRY_LABELS,
  AI_SITE_PURPOSE_LABELS,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'
import type { SiteTemplateSummary } from '@/models/site-template'

import { buildProfileVarietySeed, hashSeed } from './variety'

export type LocalTemplatePick = {
  templateId: string
  templateName: string
  reason: string
  matchScore: number
}

const INDUSTRY_CATEGORY_HINTS: Partial<Record<AiSiteWizardProfile['industry'], string[]>> = {
  food_hospitality: ['restaurant'],
  creative_agency: ['creative', 'portfolio'],
  technology: ['business', 'landing', 'creative'],
  healthcare: ['business', 'landing'],
  fitness: ['business', 'landing'],
  retail: ['business', 'landing'],
  education: ['business', 'landing'],
  finance: ['business', 'landing'],
  real_estate: ['business', 'landing'],
  nonprofit: ['business', 'other', 'landing']
}

const PURPOSE_CATEGORY_HINTS: Partial<Record<AiSiteWizardProfile['purpose'], string[]>> = {
  showcase_work: ['portfolio', 'creative'],
  sell_online: ['landing', 'business'],
  book_appointments: ['business', 'landing'],
  get_leads: ['landing', 'business'],
  inform: ['business', 'other'],
  build_community: ['creative', 'business']
}

const INDUSTRY_TAG_HINTS: Partial<Record<AiSiteWizardProfile['industry'], string[]>> = {
  food_hospitality: ['food', 'restaurant', 'cafe', 'menu', 'dining'],
  creative_agency: ['agency', 'creative', 'design', 'portfolio'],
  technology: ['tech', 'saas', 'software', 'startup', 'app'],
  healthcare: ['health', 'medical', 'wellness', 'clinic'],
  fitness: ['fitness', 'gym', 'sport', 'training'],
  retail: ['shop', 'store', 'retail', 'ecommerce'],
  education: ['education', 'course', 'school', 'learning'],
  finance: ['finance', 'consulting', 'accounting'],
  real_estate: ['real estate', 'property', 'homes'],
  nonprofit: ['nonprofit', 'charity', 'community']
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length > 2)
}

function countTokenOverlap(left: Set<string>, right: string[]): number {
  let overlap = 0

  for (const token of right) {
    if (left.has(token)) {
      overlap += 1
    }
  }

  return overlap
}

function scoreTemplate(profile: AiSiteWizardProfile, template: SiteTemplateSummary): number {
  let score = 0

  if (template.category === profile.category) {
    score += 60
  }

  const industryHints = INDUSTRY_CATEGORY_HINTS[profile.industry] ?? []
  const purposeHints = PURPOSE_CATEGORY_HINTS[profile.purpose] ?? []

  if (industryHints.includes(template.category)) {
    score += 22
  }

  if (purposeHints.includes(template.category)) {
    score += 16
  }

  const profileTokens = new Set([
    ...tokenize(profile.companyName),
    ...tokenize(profile.slogan),
    ...tokenize(profile.description),
    ...tokenize(AI_INDUSTRY_LABELS[profile.industry]),
    ...tokenize(AI_SITE_PURPOSE_LABELS[profile.purpose]),
    ...tokenize(SITE_TEMPLATE_CATEGORY_LABELS[profile.category]),
    profile.industry.replace(/_/g, ' '),
    profile.purpose.replace(/_/g, ' ')
  ])

  const templateTokens = [
    ...tokenize(template.name),
    ...tokenize(template.description),
    ...template.tags.flatMap(tag => tokenize(tag))
  ]

  score += countTokenOverlap(profileTokens, templateTokens) * 9

  const industryTags = INDUSTRY_TAG_HINTS[profile.industry] ?? []

  for (const tag of template.tags) {
    const normalized = tag.toLowerCase()

    if (industryTags.some(hint => normalized.includes(hint) || hint.includes(normalized))) {
      score += 12
    }
  }

  // Prefer templates that have captured home content to preview/customize.
  if (template.homePreview?.blocks.length) {
    score += 6
  }

  // Slight preference for less-used templates when scores are otherwise close.
  score -= Math.min(template.usageCount, 20) * 0.35

  return score
}

function buildReason(profile: AiSiteWizardProfile, template: SiteTemplateSummary, score: number): string {
  if (template.category === profile.category) {
    return `${template.name} matches your ${SITE_TEMPLATE_CATEGORY_LABELS[profile.category].toLowerCase()} site type.`
  }

  if (score >= 45) {
    return `${template.name} fits your industry and site goals.`
  }

  return `${template.name} is a strong layout match for your answers.`
}

function pickFromCandidatePool(
  profile: AiSiteWizardProfile,
  ranked: Array<{ template: SiteTemplateSummary; score: number }>
): { template: SiteTemplateSummary; score: number } {
  const topScore = ranked[0].score
  const closeMatches = ranked.filter(entry => entry.score >= topScore - 14)

  const pool =
    closeMatches.length > 1
      ? closeMatches
      : ranked.slice(0, Math.min(3, ranked.length))

  const seed = buildProfileVarietySeed(profile)
  const orderedPool = [...pool].sort((left, right) => {
    const usageDelta = left.template.usageCount - right.template.usageCount

    if (usageDelta !== 0) {
      return usageDelta
    }

    const scoreDelta = right.score - left.score

    if (scoreDelta !== 0) {
      return scoreDelta
    }

    return hashSeed(`${seed}:tpl:${left.template.id}`) - hashSeed(`${seed}:tpl:${right.template.id}`)
  })

  const index = hashSeed(`${seed}:pick`) % orderedPool.length

  return orderedPool[index]
}

/** Pick the best published template locally — no OpenAI tokens spent. */
export function pickBestTemplate(
  profile: AiSiteWizardProfile,
  templates: SiteTemplateSummary[]
): LocalTemplatePick | null {
  if (!templates.length) {
    return null
  }

  if (templates.length === 1) {
    const [only] = templates

    return {
      templateId: only.id,
      templateName: only.name,
      reason: `Using ${only.name} — the available starter layout for your site.`,
      matchScore: 100
    }
  }

  const ranked = [...templates]
    .map(template => ({
      template,
      score: scoreTemplate(profile, template)
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.template.usageCount - right.template.usageCount
    })

  const chosen = pickFromCandidatePool(profile, ranked)
  const normalizedScore = Math.min(98, Math.max(64, Math.round(chosen.score)))

  return {
    templateId: chosen.template.id,
    templateName: chosen.template.name,
    reason: buildReason(profile, chosen.template, chosen.score),
    matchScore: normalizedScore
  }
}
