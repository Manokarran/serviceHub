import type { BlockTextField } from './block-text'

const FIELD_PRIORITY: Record<string, number> = {
  title: 100,
  subtitle: 95,
  eyebrow: 90,
  text: 85,
  buttonText: 80,
  secondaryButtonText: 78,
  logoText: 75,
  label: 70,
  submitLabel: 68,
  successMessage: 65,
  signupLabel: 63,
  copyrightText: 40,
  alt: 10
}

const BLOCK_PRIORITY: Record<string, number> = {
  hero: 100,
  heading: 90,
  text: 85,
  button: 80,
  contactForm: 75,
  header: 70,
  footer: 50,
  tabs: 45,
  image: 20,
  logo: 20
}

const MAX_FIELDS_FOR_AI = 36
const MAX_VALUE_CHARS = 72

function fieldScore(field: BlockTextField): number {
  const blockWeight = BLOCK_PRIORITY[field.blockType] ?? 30
  const fieldWeight = FIELD_PRIORITY[field.field] ?? 35
  const homeBoost = field.path.startsWith('home/') ? 12 : 0

  return blockWeight + fieldWeight + homeBoost
}

function compactValue(value: string): string {
  const trimmed = value.trim()

  if (trimmed.length <= MAX_VALUE_CHARS) {
    return trimmed
  }

  return `${trimmed.slice(0, MAX_VALUE_CHARS)}…`
}

/** Smallest useful payload for the copywriting prompt. */
export function buildCompactTextCatalog(fields: BlockTextField[]): Array<{ p: string; f: string; v: string }> {
  return [...fields]
    .sort((a, b) => fieldScore(b) - fieldScore(a))
    .slice(0, MAX_FIELDS_FOR_AI)
    .map(field => ({
      p: field.path,
      f: field.field,
      v: compactValue(field.currentValue)
    }))
}

export function buildCompactProfileSummary(profile: {
  companyName: string
  slogan?: string
  description?: string
  category: string
  industry: string
  purpose: string
  stylePersonality: string
}): string {
  const parts = [
    profile.companyName,
    profile.slogan?.trim(),
    profile.description?.trim(),
    profile.category,
    profile.industry,
    profile.purpose,
    profile.stylePersonality
  ].filter(Boolean)

  return parts.join(' | ')
}
