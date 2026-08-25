import { DEFAULT_SITE_STYLES, SITE_THEME_PRESETS } from '@/features/your-space/constants/siteStylePresets'
import type { HeroSplitVisualAnimation } from '@/features/your-space/types'
import type { SiteAnimation, SiteStyles } from '@/features/your-space/types/siteStyles'
import { mergeSiteStyles } from '@/features/your-space/utils/siteStylesHelpers'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'

import { mixHex } from './color-harmony'
import type { AiDesignBrief } from './design-brief'
import {
  CORNER_TOKENS,
  DENSITY_TOKENS,
  FONT_PAIRINGS,
  getFontPairing,
  getPalette,
  resolvePaletteColors
} from './design-catalog'
import { buildProfileVarietySeed, pickFromPool } from './variety'

type Personality = AiSiteWizardProfile['stylePersonality']

const PERSONALITY_FONT_POOLS: Record<Personality, string[]> = {
  simple: ['inter', 'dm_sans', 'manrope'],
  bold: ['montserrat', 'sora', 'syne'],
  elegant: ['cormorant', 'playfair', 'libre_baskerville'],
  playful: ['poppins', 'outfit', 'dm_sans'],
  professional: ['inter', 'plus_jakarta', 'lexend'],
  flashy: ['sora', 'syne', 'space_grotesk'],
  minimal: ['inter', 'manrope', 'lexend'],
  luxury: ['cormorant', 'instrument_serif', 'fraunces'],
  warm: ['fraunces', 'poppins', 'merriweather'],
  editorial: ['instrument_serif', 'crimson', 'playfair'],
  techy: ['space_grotesk', 'manrope', 'plus_jakarta'],
  organic: ['fraunces', 'manrope', 'outfit']
}

const PERSONALITY_THEME_POOLS: Record<Personality, string[]> = {
  simple: ['minimal', 'plain', 'professional'],
  bold: ['bold', 'modern', 'startup'],
  elegant: ['elegant', 'editorial', 'luxury'],
  playful: ['playful', 'creative', 'startup'],
  professional: ['professional', 'corporate', 'modern'],
  flashy: ['startup', 'bold', 'creative'],
  minimal: ['minimal', 'plain'],
  luxury: ['luxury', 'elegant', 'editorial'],
  warm: ['classic', 'playful', 'wellness'],
  editorial: ['editorial', 'elegant', 'classic'],
  techy: ['modern', 'startup', 'professional'],
  organic: ['wellness', 'classic', 'minimal']
}

const PERSONALITY_PALETTE_POOLS: Record<Personality, string[]> = {
  simple: ['slate', 'blue', 'mono', 'teal'],
  bold: ['crimson', 'indigo', 'orange', 'mono'],
  elegant: ['gold', 'plum', 'mono', 'slate'],
  playful: ['coral', 'amber', 'violet', 'teal'],
  professional: ['blue', 'indigo', 'slate', 'emerald'],
  flashy: ['violet', 'coral', 'indigo', 'crimson'],
  minimal: ['mono', 'slate'],
  luxury: ['gold', 'mono', 'plum'],
  warm: ['amber', 'sand', 'orange', 'rose'],
  editorial: ['mono', 'crimson', 'slate'],
  techy: ['indigo', 'slate', 'teal', 'blue'],
  organic: ['sand', 'green', 'emerald', 'teal']
}

const INDUSTRY_PALETTE_HINTS: Partial<Record<AiSiteWizardProfile['industry'], string[]>> = {
  healthcare: ['teal', 'blue', 'emerald'],
  food_hospitality: ['amber', 'sand', 'crimson'],
  beauty: ['rose', 'plum', 'gold'],
  legal: ['slate', 'indigo', 'mono'],
  finance: ['emerald', 'indigo', 'slate'],
  nonprofit: ['green', 'teal', 'amber'],
  arts_music: ['plum', 'violet', 'mono'],
  construction: ['amber', 'slate', 'orange'],
  automotive: ['slate', 'crimson', 'mono'],
  travel: ['teal', 'blue', 'sand'],
  pets: ['amber', 'teal', 'coral']
}

const PERSONALITY_DENSITY: Record<Personality, keyof typeof DENSITY_TOKENS> = {
  simple: 'balanced',
  bold: 'compact',
  elegant: 'airy',
  playful: 'balanced',
  professional: 'balanced',
  flashy: 'compact',
  minimal: 'airy',
  luxury: 'airy',
  warm: 'balanced',
  editorial: 'airy',
  techy: 'compact',
  organic: 'airy'
}

const PERSONALITY_CORNERS: Record<Personality, keyof typeof CORNER_TOKENS> = {
  simple: 'soft',
  bold: 'sharp',
  elegant: 'sharp',
  playful: 'round',
  professional: 'soft',
  flashy: 'round',
  minimal: 'sharp',
  luxury: 'sharp',
  warm: 'round',
  editorial: 'sharp',
  techy: 'soft',
  organic: 'round'
}

const PERSONALITY_PREFERS_DARK: Personality[] = ['flashy', 'techy', 'luxury', 'bold']

const MOTION_POOLS: Record<AiSiteWizardProfile['animationLevel'], HeroSplitVisualAnimation[]> = {
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

const INDUSTRY_PHOTO_KEYWORDS: Record<AiSiteWizardProfile['industry'], string[]> = {
  technology: ['modern tech workspace', 'abstract digital gradient'],
  healthcare: ['calm clinic interior', 'caring hands portrait'],
  food_hospitality: ['chef plating dish', 'warm cafe interior'],
  real_estate: ['modern home interior', 'architectural facade'],
  creative_agency: ['design studio workspace', 'creative team collaboration'],
  retail: ['boutique store interior', 'product lifestyle still life'],
  education: ['students collaborating', 'bright classroom light'],
  fitness: ['athletic motion training', 'minimal gym interior'],
  finance: ['modern office meeting', 'city skyline dusk'],
  nonprofit: ['community volunteers', 'hopeful outdoor portrait'],
  beauty: ['salon interior detail', 'soft beauty portrait'],
  construction: ['construction site craft', 'architectural steel detail'],
  legal: ['law office interior', 'considered professional portrait'],
  travel: ['scenic travel landscape', 'boutique hotel room'],
  automotive: ['car detail close up', 'workshop garage light'],
  events: ['elegant event table', 'celebration crowd light'],
  home_services: ['home renovation work', 'tidy modern interior'],
  pets: ['happy dog portrait', 'veterinary care moment'],
  arts_music: ['gallery wall art', 'live performance light'],
  other: ['professional lifestyle', 'natural light interior']
}

export function resolveAllowedMotion(profile: AiSiteWizardProfile): HeroSplitVisualAnimation[] {
  return MOTION_POOLS[profile.animationLevel]
}

function resolvePaletteId(profile: AiSiteWizardProfile, seed: string): string {
  if (profile.colorMood !== 'ai_pick') {
    return profile.colorMood
  }

  const personalityPool = PERSONALITY_PALETTE_POOLS[profile.stylePersonality]
  const industryPool = INDUSTRY_PALETTE_HINTS[profile.industry]

  if (!industryPool) {
    return pickFromPool(personalityPool, seed, 'palette')
  }

  const overlap = personalityPool.filter(id => industryPool.includes(id))

  return pickFromPool(overlap.length ? overlap : [...personalityPool, ...industryPool], seed, 'palette')
}

function resolveColorMode(profile: AiSiteWizardProfile, seed: string): 'light' | 'dark' {
  if (profile.colorMode !== 'ai_pick') {
    return profile.colorMode
  }

  if (!PERSONALITY_PREFERS_DARK.includes(profile.stylePersonality)) {
    return 'light'
  }

  return pickFromPool(['light', 'dark'] as const, seed, 'color-mode')
}

/** Deterministic brief used when OpenAI is unavailable, slow, or returns junk. */
export function buildFallbackDesignBrief(profile: AiSiteWizardProfile): AiDesignBrief {
  const seed = buildProfileVarietySeed(profile)
  const paletteId = resolvePaletteId(profile, seed)
  const colorMode = resolveColorMode(profile, seed)
  const palette = getPalette(paletteId)
  const colors = resolvePaletteColors(paletteId, colorMode)

  const fontPairingId =
    profile.fontChoice && profile.fontChoice !== 'ai_pick'
      ? profile.fontChoice
      : pickFromPool(PERSONALITY_FONT_POOLS[profile.stylePersonality], seed, 'font')

  return {
    concept: `${palette.label} ${profile.stylePersonality}`,
    rationale: `A ${palette.label.toLowerCase()} palette with ${profile.stylePersonality} typography, matched to ${profile.industry.replace(/_/g, ' ')}.`,
    paletteId,
    colorMode,
    accent: colors.accent,
    gradientStart: palette.gradientStart,
    gradientEnd: palette.gradientEnd,
    background: colors.background,
    text: colors.text,
    surface: colors.swatch1,
    fontPairingId,
    themeId: pickFromPool(PERSONALITY_THEME_POOLS[profile.stylePersonality], seed, 'theme'),
    motion: pickFromPool(MOTION_POOLS[profile.animationLevel], seed, 'motion'),
    heroLayout:
      profile.heroStyle !== 'ai_pick'
        ? profile.heroStyle
        : pickFromPool(['centered', 'split-left', 'split-right'] as const, seed, 'hero-layout'),
    heroOverlay: pickFromPool(['subtle', 'gradient', 'strong'] as const, seed, 'hero-overlay'),
    heroTitleStyle: profile.stylePersonality === 'flashy' ? 'gradient' : 'solid',
    heroSurface: 'none',
    density:
      profile.layoutDensity !== 'ai_pick' ? profile.layoutDensity : PERSONALITY_DENSITY[profile.stylePersonality],
    corners: profile.cornerStyle !== 'ai_pick' ? profile.cornerStyle : PERSONALITY_CORNERS[profile.stylePersonality],
    sectionBorder: 'none',
    photoKeywords: INDUSTRY_PHOTO_KEYWORDS[profile.industry],
    isFallback: true
  }
}

/** Turn a design brief into the full SiteStyles token set the builder renders from. */
export function buildSiteStylesFromBrief(brief: AiDesignBrief, profile: AiSiteWizardProfile): SiteStyles {
  const preset = SITE_THEME_PRESETS.find(entry => entry.id === brief.themeId) ?? SITE_THEME_PRESETS[0]
  const paletteColors = resolvePaletteColors(brief.paletteId, brief.colorMode)
  const fonts = getFontPairing(brief.fontPairingId)
  const corners = CORNER_TOKENS[brief.corners]
  const density = DENSITY_TOKENS[brief.density]
  const base = mergeSiteStyles(preset.styles, DEFAULT_SITE_STYLES)

  const isDark = brief.colorMode === 'dark'
  const fieldBorder = mixHex(brief.text, brief.background, isDark ? 0.7 : 0.82)

  return mergeSiteStyles(
    {
      themeId: brief.themeId,
      fonts: {
        ...base.fonts,
        headingFamily: fonts.headingFamily,
        bodyFamily: fonts.bodyFamily,
        headingWeight: fonts.headingWeight,
        headingLetterSpacing: fonts.headingLetterSpacing,
        headingScale: brief.density === 'airy' ? 1.1 : brief.density === 'compact' ? 0.96 : 1
      },
      colors: {
        ...paletteColors,
        accent: brief.accent,
        background: brief.background,
        text: brief.text,
        swatch1: brief.surface,
        swatch5: brief.gradientEnd
      },
      buttons: {
        primary: { ...base.buttons.primary, shape: corners.buttonShape },
        secondary: { ...base.buttons.secondary, shape: corners.buttonShape },
        tertiary: { ...base.buttons.tertiary, shape: corners.buttonShape === 'pill' ? 'pill' : 'rounded' }
      },
      forms: {
        ...base.forms,
        fieldShape: corners.buttonShape,
        fieldBorderColor: fieldBorder,
        fieldBackground: isDark ? brief.surface : '#ffffff'
      },
      misc: {
        ...base.misc,
        animation: pickFromPool(
          CONTENT_ANIMATION_POOLS[profile.animationLevel],
          buildProfileVarietySeed(profile),
          'content-animation'
        ),
        spacingScale: density.spacingScale,
        imageCornerRadius: corners.imageRadius,
        pageSplitVisualAnimation: brief.motion,
        pageSplitVisualColorStart: brief.gradientStart,
        pageSplitVisualColorEnd: brief.gradientEnd
      }
    },
    base
  )
}

export function getFontLabel(brief: AiDesignBrief): string {
  return getFontPairing(brief.fontPairingId).label
}

export function getAvailableFontPairingIds(): string[] {
  return FONT_PAIRINGS.map(entry => entry.id)
}
