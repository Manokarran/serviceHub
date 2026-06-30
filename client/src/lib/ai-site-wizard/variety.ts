import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

/** Stable numeric hash for deterministic variety from wizard answers. */
export function hashSeed(seed: string): number {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export function buildProfileVarietySeed(profile: AiSiteWizardProfile): string {
  return [
    profile.companyName.trim().toLowerCase(),
    profile.slogan.trim().toLowerCase(),
    profile.description.trim().toLowerCase(),
    profile.category,
    profile.industry,
    profile.purpose,
    profile.stylePersonality,
    profile.colorMood,
    profile.animationLevel
  ].join('|')
}

export function pickFromPool<T>(items: readonly T[], seed: string, salt = ''): T {
  if (!items.length) {
    throw new Error('Cannot pick from an empty pool.')
  }

  const index = hashSeed(`${seed}:${salt}`) % items.length

  return items[index]
}
