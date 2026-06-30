import { DEFAULT_SITE_STYLES, SITE_THEME_PRESETS } from '@/features/your-space/constants/siteStylePresets'
import { HERO_VISUAL_GRADIENT_PRESETS } from '@/features/your-space/constants/heroVisual'
import type { HeroSplitVisualAnimation } from '@/features/your-space/types'
import type { SiteAnimation, SiteStyles } from '@/features/your-space/types/siteStyles'
import { mergeSiteStyles } from '@/features/your-space/utils/siteStylesHelpers'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

import { buildProfileVarietySeed, pickFromPool } from './variety'

type AiStyleChoice = {
  themeId: string
  pageBackgroundAnimation: HeroSplitVisualAnimation
  gradientPresetId: string
  contentAnimation: SiteAnimation
}

const PERSONALITY_THEME_POOLS: Record<AiSiteWizardProfile['stylePersonality'], string[]> = {
  simple: ['minimal', 'plain', 'professional'],
  bold: ['bold', 'modern', 'startup'],
  elegant: ['elegant', 'editorial', 'luxury'],
  playful: ['playful', 'creative', 'startup'],
  professional: ['professional', 'corporate', 'modern'],
  flashy: ['startup', 'bold', 'creative']
}

const CATEGORY_THEME_POOLS: Partial<Record<AiSiteWizardProfile['category'], string[]>> = {
  business: ['professional', 'corporate', 'modern', 'minimal'],
  portfolio: ['creative', 'editorial', 'minimal', 'elegant'],
  restaurant: ['classic', 'elegant'],
  creative: ['creative', 'bold', 'playful', 'startup'],
  landing: ['startup', 'modern', 'bold'],
  other: ['professional', 'modern', 'plain']
}

const COLOR_GRADIENT_POOLS: Record<Exclude<AiSiteWizardProfile['colorMood'], 'ai_pick'>, string[]> = {
  blue: ['ocean', 'cyan', 'midnight', 'violet'],
  orange: ['sunset', 'amber', 'rose'],
  green: ['forest', 'teal'],
  dark: ['midnight', 'slate', 'crimson'],
  light: ['slate', 'lavender', 'cyan'],
  violet: ['violet', 'lavender', 'midnight']
}

const AI_PICK_GRADIENT_POOL = ['ocean', 'violet', 'sunset', 'forest', 'midnight', 'cyan', 'amber', 'teal']

const PAGE_ANIMATION_POOLS: Record<AiSiteWizardProfile['animationLevel'], HeroSplitVisualAnimation[]> = {
  none: ['static'],
  subtle: ['gradient-shift', 'floating-circles', 'dot-grid', 'pulse-rings'],
  moderate: ['aurora', 'mesh-gradient', 'wave-lines', 'morphing-blobs', 'orbiting-dots'],
  energetic: ['shimmer', 'mesh-gradient', 'particles-rise', 'constellation', 'geometric', 'aurora']
}

const CONTENT_ANIMATION_POOLS: Record<AiSiteWizardProfile['animationLevel'], SiteAnimation[]> = {
  none: ['none'],
  subtle: ['fade'],
  moderate: ['fade', 'slide-up'],
  energetic: ['slide-up', 'scale']
}

const COLOR_ACCENT_MAP: Record<Exclude<AiSiteWizardProfile['colorMood'], 'ai_pick'>, Partial<SiteStyles['colors']>> = {
  blue: { accent: '#2563eb', swatch5: '#1d4ed8', swatch3: '#93c5fd' },
  orange: { accent: '#f97316', swatch5: '#ea580c', swatch3: '#fdba74' },
  green: { accent: '#059669', swatch5: '#047857', swatch3: '#6ee7b7' },
  dark: {
    accent: '#6366f1',
    swatch5: '#0f172a',
    background: '#0f172a',
    text: '#f8fafc',
    swatch1: '#1e293b',
    swatch2: '#334155',
    swatch4: '#cbd5e1'
  },
  light: { accent: '#18181b', swatch5: '#18181b', swatch3: '#d4d4d8', background: '#ffffff', text: '#18181b' },
  violet: { accent: '#7c3aed', swatch5: '#6d28d9', swatch3: '#c4b5fd' }
}

const VALID_THEME_IDS = new Set(SITE_THEME_PRESETS.map(preset => preset.id))
const VALID_GRADIENT_IDS = new Set(HERO_VISUAL_GRADIENT_PRESETS.map(preset => preset.id))

function intersectPools(primary: string[], secondary: string[]): string[] {
  const secondarySet = new Set(secondary)
  const overlap = primary.filter(id => secondarySet.has(id))

  return overlap.length ? overlap : [...new Set([...primary, ...secondary])]
}

function resolveThemeId(profile: AiSiteWizardProfile, seed: string): string {
  const personalityPool = PERSONALITY_THEME_POOLS[profile.stylePersonality]
  const categoryPool = CATEGORY_THEME_POOLS[profile.category] ?? ['professional', 'modern']
  const pool = intersectPools(personalityPool, categoryPool).filter(id => VALID_THEME_IDS.has(id))

  return pickFromPool(pool.length ? pool : ['professional', 'modern', 'minimal'], seed, 'theme')
}

function resolveGradientPresetId(profile: AiSiteWizardProfile, seed: string): string {
  const pool =
    profile.colorMood === 'ai_pick'
      ? AI_PICK_GRADIENT_POOL
      : COLOR_GRADIENT_POOLS[profile.colorMood].filter(id => VALID_GRADIENT_IDS.has(id))

  return pickFromPool(pool, seed, 'gradient')
}

function resolvePageAnimation(profile: AiSiteWizardProfile, seed: string): HeroSplitVisualAnimation {
  return pickFromPool(PAGE_ANIMATION_POOLS[profile.animationLevel], seed, 'page-animation')
}

function resolveContentAnimation(profile: AiSiteWizardProfile, seed: string): SiteAnimation {
  return pickFromPool(CONTENT_ANIMATION_POOLS[profile.animationLevel], seed, 'content-animation')
}

export function buildStyleChoiceFromProfile(profile: AiSiteWizardProfile): AiStyleChoice {
  const seed = buildProfileVarietySeed(profile)

  return {
    themeId: resolveThemeId(profile, seed),
    pageBackgroundAnimation: resolvePageAnimation(profile, seed),
    gradientPresetId: resolveGradientPresetId(profile, seed),
    contentAnimation: resolveContentAnimation(profile, seed)
  }
}

/** Apply wizard style from builder presets — ignores captured template styles so each run can vary. */
export function applyAiStyleChoice(profile: AiSiteWizardProfile): SiteStyles {
  const choice = buildStyleChoiceFromProfile(profile)
  const preset = SITE_THEME_PRESETS.find(entry => entry.id === choice.themeId) ?? SITE_THEME_PRESETS[0]
  const gradient =
    HERO_VISUAL_GRADIENT_PRESETS.find(entry => entry.id === choice.gradientPresetId) ??
    HERO_VISUAL_GRADIENT_PRESETS[0]

  let styles = mergeSiteStyles(preset.styles, DEFAULT_SITE_STYLES)

  if (profile.colorMood !== 'ai_pick') {
    styles = mergeSiteStyles({ colors: { ...styles.colors, ...COLOR_ACCENT_MAP[profile.colorMood] } }, styles)
  }

  return mergeSiteStyles(
    {
      themeId: choice.themeId,
      colors: {
        ...styles.colors,
        accent: gradient.start,
        swatch5: gradient.end
      },
      misc: {
        ...styles.misc,
        animation: choice.contentAnimation,
        pageSplitVisualAnimation: choice.pageBackgroundAnimation,
        pageSplitVisualColorStart: gradient.start,
        pageSplitVisualColorEnd: gradient.end
      }
    },
    styles
  )
}

export function getAvailableThemeIds(): string[] {
  return SITE_THEME_PRESETS.map(preset => preset.id)
}

export function getAvailableAnimations(): HeroSplitVisualAnimation[] {
  return [
    'static',
    'floating-circles',
    'gradient-shift',
    'aurora',
    'mesh-gradient',
    'shimmer',
    'morphing-blobs',
    'wave-lines',
    'particles-rise',
    'constellation'
  ]
}

export function getAvailableGradientIds(): string[] {
  return HERO_VISUAL_GRADIENT_PRESETS.map(preset => preset.id)
}
