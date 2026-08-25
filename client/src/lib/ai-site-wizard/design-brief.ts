import { HERO_SPLIT_VISUAL_ANIMATION_OPTIONS } from '@/features/your-space/constants/heroVisual'
import { SITE_THEME_PRESETS } from '@/features/your-space/constants/siteStylePresets'
import type { HeroSplitVisualAnimation } from '@/features/your-space/types'
import {
  AI_COLOR_MOODS,
  AI_CORNER_STYLES,
  AI_FONT_CHOICES,
  AI_LAYOUT_DENSITIES,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'

import { contrastRatio, isLightColor } from './color-harmony'
import { COLOR_PALETTES, FONT_PAIRINGS, getPalette, resolvePaletteColors } from './design-catalog'

export type AiDesignBrief = {
  concept: string
  rationale: string
  paletteId: string
  colorMode: 'light' | 'dark'
  accent: string
  gradientStart: string
  gradientEnd: string
  background: string
  text: string
  surface: string
  fontPairingId: string
  themeId: string
  motion: HeroSplitVisualAnimation
  heroLayout: 'centered' | 'split-left' | 'split-right'
  heroOverlay: 'none' | 'subtle' | 'strong' | 'gradient'
  heroTitleStyle: 'solid' | 'gradient'
  heroSurface: 'none' | 'glass'
  density: 'compact' | 'balanced' | 'airy'
  corners: 'sharp' | 'soft' | 'round'
  sectionBorder: 'none' | 'subtle' | 'outline' | 'elevated'
  photoKeywords: string[]

  /** True when every field came from the deterministic engine rather than the model. */
  isFallback: boolean
}

const HEX = /^#[0-9a-fA-F]{6}$/

const THEME_IDS = SITE_THEME_PRESETS.map(preset => preset.id)
const MOTION_IDS = HERO_SPLIT_VISUAL_ANIMATION_OPTIONS.map(option => option.value)
const PALETTE_IDS = COLOR_PALETTES.map(entry => entry.id)
const FONT_IDS = FONT_PAIRINGS.map(entry => entry.id)

export const DESIGN_SYSTEM_PROMPT = `You are the art director for a website builder. Design a distinctive visual identity for one business.

Return JSON only, no prose:
{"concept":"","rationale":"","paletteId":"","colorMode":"light|dark","accent":"#rrggbb","gradientStart":"#rrggbb","gradientEnd":"#rrggbb","background":"#rrggbb","text":"#rrggbb","surface":"#rrggbb","fontPairingId":"","themeId":"","motion":"","heroLayout":"centered|split-left|split-right","heroOverlay":"none|subtle|strong|gradient","heroTitleStyle":"solid|gradient","heroSurface":"none|glass","density":"compact|balanced|airy","corners":"sharp|soft|round","sectionBorder":"none|subtle|outline|elevated","photoKeywords":["",""]}

Rules:
- concept: 2-3 words naming the visual direction, e.g. "Coastal Warehouse", "Quiet Harvest". Never reuse the business name.
- rationale: one sentence, max 22 words, explaining the direction to the business owner in plain language.
- Colors must be real 6-digit hex. text on background must reach WCAG AA (contrast ratio 4.5 or better).
- accent must be visible on background: never a near-white accent on a white background.
- surface is the card/panel fill sitting on background — keep it close to background, not the accent.
- gradientStart and gradientEnd should be related hues, not clashing complements.
- Honor every locked choice given in the input. Only invent what is marked "ai_pick".
- Do not pick "static" motion unless the requested motion level is none.
- photoKeywords: 2-3 short Unsplash search phrases for on-brand photography, specific to the industry, no brand names.
- Avoid the obvious cliché for the industry: do not default technology to blue, food to orange, or eco to green unless it genuinely fits the described business.`

export function buildDesignUserPayload(
  profile: AiSiteWizardProfile,
  allowed: { motion: string[] }
): string {
  const locked: Record<string, string> = {}

  if (profile.colorMood !== 'ai_pick') {
    const entry = getPalette(profile.colorMood)

    locked.paletteId = profile.colorMood
    locked.accentMustBeCloseTo = entry.accent
  }

  if (profile.colorMode !== 'ai_pick') {
    locked.colorMode = profile.colorMode
  }

  if (profile.fontChoice && profile.fontChoice !== 'ai_pick') {
    locked.fontPairingId = profile.fontChoice
  }

  if (profile.layoutDensity !== 'ai_pick') {
    locked.density = profile.layoutDensity
  }

  if (profile.cornerStyle !== 'ai_pick') {
    locked.corners = profile.cornerStyle
  }

  if (profile.heroStyle !== 'ai_pick') {
    locked.heroLayout = profile.heroStyle
  }

  return JSON.stringify({
    business: {
      name: profile.companyName,
      siteTitle: profile.siteTitle || undefined,
      slogan: profile.slogan || undefined,
      about: profile.description || undefined,
      audience: profile.audience || undefined,
      offerings: profile.keyOfferings || undefined,
      differentiators: profile.differentiators || undefined,
      category: profile.category,
      industry: profile.industry,
      goal: profile.purpose
    },
    direction: {
      personality: profile.stylePersonality,
      motionLevel: profile.animationLevel,
      brandVoice: profile.brandVoice
    },
    locked,
    choose: {
      paletteId: PALETTE_IDS,
      fontPairingId: FONT_IDS,
      themeId: THEME_IDS,
      motion: allowed.motion
    },
    variantSeed: profile.generationNonce
  })
}

function pickString<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
}

function pickHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX.test(value.trim()) ? value.trim().toLowerCase() : fallback
}

function cleanText(value: unknown, maxWords: number, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback
  }

  const words = value.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean)

  return words.length ? words.slice(0, maxWords).join(' ') : fallback
}

export type RawDesignBrief = Record<string, unknown>

/**
 * Coerce a model response into a usable brief. Anything invalid, unreadable, or
 * conflicting with a locked user choice is replaced by the deterministic fallback.
 */
export function normalizeDesignBrief(
  raw: RawDesignBrief | null,
  profile: AiSiteWizardProfile,
  fallback: AiDesignBrief,
  allowedMotion: readonly HeroSplitVisualAnimation[]
): AiDesignBrief {
  if (!raw) {
    return fallback
  }

  const paletteId =
    profile.colorMood !== 'ai_pick'
      ? profile.colorMood
      : pickString(raw.paletteId, PALETTE_IDS, fallback.paletteId)

  const colorMode =
    profile.colorMode !== 'ai_pick'
      ? profile.colorMode
      : pickString(raw.colorMode, ['light', 'dark'] as const, fallback.colorMode)

  const presetColors = resolvePaletteColors(paletteId, colorMode)

  let background = pickHex(raw.background, presetColors.background)
  let text = pickHex(raw.text, presetColors.text)
  let accent = pickHex(raw.accent, presetColors.accent)
  const surface = pickHex(raw.surface, presetColors.swatch1)

  // The model routinely proposes elegant-but-unreadable pairings. Preset wins over pretty.
  if (contrastRatio(background, text) < 4.5) {
    background = presetColors.background
    text = presetColors.text
  }

  if (contrastRatio(background, accent) < 2.2) {
    accent = presetColors.accent
  }

  // A dark-mode request that produced a light background is a misread, not a choice.
  if (colorMode === 'dark' && isLightColor(background)) {
    background = presetColors.background
    text = presetColors.text
    accent = presetColors.accent
  }

  const gradientStart = pickHex(raw.gradientStart, accent)
  const gradientEnd = pickHex(raw.gradientEnd, presetColors.swatch5)

  return {
    concept: cleanText(raw.concept, 4, fallback.concept),
    rationale: cleanText(raw.rationale, 26, fallback.rationale),
    paletteId,
    colorMode,
    accent,
    gradientStart,
    gradientEnd: contrastRatio(gradientStart, gradientEnd) > 12 ? accent : gradientEnd,
    background,
    text,
    surface,
    fontPairingId:
      profile.fontChoice && profile.fontChoice !== 'ai_pick'
        ? profile.fontChoice
        : pickString(raw.fontPairingId, FONT_IDS, fallback.fontPairingId),
    themeId: pickString(raw.themeId, THEME_IDS, fallback.themeId),
    motion:
      profile.animationLevel === 'none'
        ? 'static'
        : pickString(raw.motion, allowedMotion, fallback.motion),
    heroLayout:
      profile.heroStyle !== 'ai_pick'
        ? profile.heroStyle
        : pickString(raw.heroLayout, ['centered', 'split-left', 'split-right'] as const, fallback.heroLayout),
    heroOverlay: pickString(raw.heroOverlay, ['none', 'subtle', 'strong', 'gradient'] as const, fallback.heroOverlay),
    heroTitleStyle: pickString(raw.heroTitleStyle, ['solid', 'gradient'] as const, fallback.heroTitleStyle),
    heroSurface: pickString(raw.heroSurface, ['none', 'glass'] as const, fallback.heroSurface),
    density:
      profile.layoutDensity !== 'ai_pick'
        ? profile.layoutDensity
        : pickString(raw.density, ['compact', 'balanced', 'airy'] as const, fallback.density),
    corners:
      profile.cornerStyle !== 'ai_pick'
        ? profile.cornerStyle
        : pickString(raw.corners, ['sharp', 'soft', 'round'] as const, fallback.corners),
    sectionBorder: pickString(
      raw.sectionBorder,
      ['none', 'subtle', 'outline', 'elevated'] as const,
      fallback.sectionBorder
    ),
    photoKeywords: Array.isArray(raw.photoKeywords)
      ? raw.photoKeywords
          .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 2)
          .map(entry => entry.trim().slice(0, 60))
          .slice(0, 3)
      : fallback.photoKeywords,
    isFallback: false
  }
}

export const DESIGN_BRIEF_ENUMS = {
  paletteIds: PALETTE_IDS,
  fontIds: FONT_IDS,
  themeIds: THEME_IDS,
  motionIds: MOTION_IDS,
  colorMoods: AI_COLOR_MOODS,
  fontChoices: AI_FONT_CHOICES,
  densities: AI_LAYOUT_DENSITIES,
  corners: AI_CORNER_STYLES
}
