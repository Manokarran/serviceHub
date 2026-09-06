import type { SiteTemplateCategory } from '@/lib/constants/site-template'
import {
  AI_COLOR_MOODS,
  AI_FONT_CHOICE_LABELS,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'

type Industry = AiSiteWizardProfile['industry']
type Personality = AiSiteWizardProfile['stylePersonality']

/**
 * Everything the design engine needs about the site, gathered from what already
 * exists rather than from a wizard the user has to fill in again.
 */
export type DesignContextInput = {
  businessName: string
  logoUrl?: string

  /** Headlines and body copy already on the page, in reading order. */
  pageCopy: string[]

  /** The user's own words, e.g. "make it feel luxurious and dark". May be empty. */
  instruction: string

  /** Differs per request so repeat asks explore a new direction instead of repeating. */
  nonce: string
}

/**
 * Matched in order, so the more specific phrase wins. Every entry is a whole-word
 * match to stop "art" firing inside "start" or "party".
 */
const INDUSTRY_KEYWORDS: Array<[Industry, string[]]> = [
  ['healthcare', ['dental', 'dentist', 'clinic', 'medical', 'doctor', 'therapy', 'therapist', 'healthcare', 'wellness', 'physio']],
  ['food_hospitality', ['restaurant', 'cafe', 'coffee', 'bakery', 'catering', 'menu', 'bistro', 'kitchen', 'brewery', 'hotel']],
  ['real_estate', ['real estate', 'realtor', 'property', 'properties', 'listings', 'lettings', 'mortgage']],
  ['creative_agency', ['agency', 'studio', 'portfolio', 'branding', 'design studio', 'photographer', 'photography', 'filmmaker']],
  ['retail', ['shop', 'store', 'boutique', 'products', 'ecommerce', 'e-commerce', 'merch']],
  ['education', ['school', 'course', 'courses', 'tutor', 'tutoring', 'academy', 'training', 'workshop', 'coaching']],
  ['fitness', ['gym', 'fitness', 'yoga', 'pilates', 'crossfit', 'trainer', 'workout']],
  ['finance', ['finance', 'financial', 'accounting', 'accountant', 'bookkeeping', 'insurance', 'consulting', 'advisory']],
  ['nonprofit', ['nonprofit', 'non-profit', 'charity', 'donate', 'donation', 'volunteer', 'foundation']],
  ['beauty', ['salon', 'beauty', 'spa', 'barber', 'nails', 'skincare', 'cosmetic', 'makeup']],
  ['construction', ['construction', 'builder', 'building', 'roofing', 'plumbing', 'electrician', 'renovation', 'contractor']],
  ['legal', ['law', 'lawyer', 'legal', 'attorney', 'solicitor', 'conveyancing', 'notary']],
  ['travel', ['travel', 'tour', 'tours', 'tourism', 'holiday', 'vacation', 'resort', 'safari']],
  ['automotive', ['automotive', 'car', 'cars', 'garage', 'mechanic', 'detailing', 'dealership']],
  ['events', ['event', 'events', 'wedding', 'weddings', 'party', 'conference', 'festival']],
  ['home_services', ['cleaning', 'landscaping', 'gardening', 'handyman', 'pest control', 'removals', 'home services']],
  ['pets', ['pet', 'pets', 'vet', 'veterinary', 'grooming', 'kennel', 'dog', 'cat']],
  ['arts_music', ['gallery', 'artist', 'music', 'band', 'theatre', 'theater', 'exhibition', 'museum']],
  ['technology', ['software', 'saas', 'platform', 'api', 'developer', 'technology', 'app', 'startup', 'data', 'cloud', 'ai']]
]

const INDUSTRY_CATEGORY: Record<Industry, SiteTemplateCategory> = {
  technology: 'business',
  healthcare: 'health',
  food_hospitality: 'restaurant',
  real_estate: 'realestate',
  creative_agency: 'creative',
  retail: 'ecommerce',
  education: 'education',
  fitness: 'fitness',
  finance: 'business',
  nonprofit: 'nonprofit',
  beauty: 'beauty',
  construction: 'services',
  legal: 'services',
  travel: 'business',
  automotive: 'services',
  events: 'events',
  home_services: 'services',
  pets: 'services',
  arts_music: 'portfolio',
  other: 'business'
}

const PERSONALITY_KEYWORDS: Array<[Personality, string[]]> = [
  ['luxury', ['luxury', 'luxurious', 'premium', 'high end', 'high-end', 'upmarket', 'exclusive', 'opulent']],
  ['minimal', ['minimal', 'minimalist', 'spacious', 'understated', 'stripped back', 'pared back']],
  ['editorial', ['editorial', 'magazine', 'journal', 'typographic', 'newspaper']],
  [
    'splashy',
    [
      'splashy',
      'fancy',
      'glamorous',
      'glamour',
      'neon',
      'aurora',
      'glow',
      'glowing',
      'disco',
      'eye candy',
      'eye-candy',
      'razzle',
      'razzle dazzle',
      'showy',
      'sparkly',
      'sparkling',
      'iridescent',
      'holographic'
    ]
  ],
  ['flashy', ['flashy', 'wow', 'striking', 'eye catching', 'eye-catching', 'showstopper', 'dramatic entrance', 'vibrant']],
  ['bold', ['bold', 'dramatic', 'punchy', 'loud', 'high contrast', 'high-contrast', 'confident']],
  ['elegant', ['elegant', 'refined', 'sophisticated', 'graceful', 'classy', 'timeless']],
  ['playful', ['playful', 'fun', 'friendly', 'quirky', 'cheerful', 'lively']],
  ['techy', ['technical', 'precise', 'engineered', 'developer', 'techy']],
  ['organic', ['organic', 'natural', 'earthy', 'eco', 'sustainable', 'botanical']],
  ['warm', ['warm', 'welcoming', 'cosy', 'cozy', 'homely', 'inviting']],
  ['professional', ['professional', 'corporate', 'trustworthy', 'credible', 'serious']],
  ['simple', ['simple', 'clean', 'plain', 'straightforward']]
]

function matches(text: string, needles: string[]): boolean {
  return needles.some(needle => new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text))
}

function pickIndustry(text: string): Industry {
  for (const [industry, keywords] of INDUSTRY_KEYWORDS) {
    if (matches(text, keywords)) {
      return industry
    }
  }

  return 'other'
}

function pickPersonality(instruction: string, fallbackText: string): Personality {
  for (const [personality, keywords] of PERSONALITY_KEYWORDS) {
    if (matches(instruction, keywords)) {
      return personality
    }
  }

  for (const [personality, keywords] of PERSONALITY_KEYWORDS) {
    if (matches(fallbackText, keywords)) {
      return personality
    }
  }

  return 'professional'
}

function pickColorMode(instruction: string): AiSiteWizardProfile['colorMode'] {
  if (matches(instruction, ['dark', 'darker', 'black', 'night', 'midnight', 'moody'])) {
    return 'dark'
  }

  if (matches(instruction, ['light', 'lighter', 'bright', 'brighter', 'white', 'airy', 'daylight'])) {
    return 'light'
  }

  return 'ai_pick'
}

function pickColorMood(instruction: string): AiSiteWizardProfile['colorMood'] {
  const named = AI_COLOR_MOODS.find(mood => mood !== 'ai_pick' && matches(instruction, [mood]))

  if (named) {
    return named
  }

  if (matches(instruction, ['monochrome', 'greyscale', 'grayscale', 'black and white'])) {
    return 'mono'
  }

  if (matches(instruction, ['purple'])) {
    return 'violet'
  }

  if (matches(instruction, ['red'])) {
    return 'crimson'
  }

  if (matches(instruction, ['pink'])) {
    return 'rose'
  }

  if (matches(instruction, ['yellow'])) {
    return 'amber'
  }

  return 'ai_pick'
}

function pickAnimationLevel(instruction: string): AiSiteWizardProfile['animationLevel'] {
  if (matches(instruction, ['no animation', 'no motion', 'static', 'still', 'remove animation'])) {
    return 'none'
  }

  if (
    matches(instruction, [
      'energetic',
      'dynamic',
      'animated',
      'lively',
      'wow',
      'motion heavy',
      'splashy',
      'fancy',
      'neon',
      'glow',
      'aurora'
    ])
  ) {
    return 'energetic'
  }

  if (matches(instruction, ['subtle', 'gentle', 'quiet', 'restrained', 'calm'])) {
    return 'subtle'
  }

  return 'moderate'
}

function pickDensity(instruction: string): AiSiteWizardProfile['layoutDensity'] {
  if (matches(instruction, ['compact', 'dense', 'tighter', 'tight', 'condensed'])) {
    return 'compact'
  }

  if (
    matches(instruction, [
      'airy',
      'spacious',
      'roomy',
      'breathing room',
      'more space',
      'lots of space',
      'plenty of space',
      'generous',
      'open'
    ])
  ) {
    return 'airy'
  }

  return 'ai_pick'
}

function pickCorners(instruction: string): AiSiteWizardProfile['cornerStyle'] {
  if (matches(instruction, ['sharp', 'square', 'squared', 'hard edges'])) {
    return 'sharp'
  }

  if (matches(instruction, ['round', 'rounded', 'pill', 'soft edges', 'bubbly'])) {
    return 'round'
  }

  return 'ai_pick'
}

function pickFont(instruction: string): AiSiteWizardProfile['fontChoice'] {
  const entries = Object.entries(AI_FONT_CHOICE_LABELS) as Array<[AiSiteWizardProfile['fontChoice'], string]>

  for (const [id, label] of entries) {
    if (id !== 'ai_pick' && instruction.toLowerCase().includes(label.toLowerCase())) {
      return id
    }
  }

  if (matches(instruction, ['serif'])) {
    return 'playfair'
  }

  if (matches(instruction, ['mono', 'monospace'])) {
    return 'space_grotesk'
  }

  return 'ai_pick'
}

function pickHeroStyle(instruction: string): AiSiteWizardProfile['heroStyle'] {
  if (matches(instruction, ['centered', 'centred', 'center', 'centre'])) {
    return 'centered'
  }

  if (matches(instruction, ['split', 'side by side', 'two column', 'two-column'])) {
    return 'split-left'
  }

  return 'ai_pick'
}

function pickVoice(instruction: string): AiSiteWizardProfile['brandVoice'] {
  if (matches(instruction, ['friendly', 'approachable', 'warm'])) {
    return 'friendly'
  }

  if (matches(instruction, ['confident', 'direct', 'punchy'])) {
    return 'confident'
  }

  if (matches(instruction, ['expert', 'authoritative', 'technical'])) {
    return 'expert'
  }

  if (matches(instruction, ['luxurious', 'refined', 'premium'])) {
    return 'luxurious'
  }

  if (matches(instruction, ['playful', 'witty', 'fun'])) {
    return 'playful'
  }

  if (matches(instruction, ['inspirational', 'uplifting', 'aspirational'])) {
    return 'inspirational'
  }

  if (matches(instruction, ['plain', 'simple', 'straightforward', 'no fluff'])) {
    return 'straightforward'
  }

  return 'ai_pick'
}

function pickPurpose(text: string): AiSiteWizardProfile['purpose'] {
  if (matches(text, ['book', 'booking', 'appointment', 'appointments', 'reserve', 'schedule'])) {
    return 'book_appointments'
  }

  if (matches(text, ['buy', 'sell', 'shop', 'store', 'cart', 'checkout', 'pricing', 'plans'])) {
    return 'sell_online'
  }

  if (matches(text, ['portfolio', 'gallery', 'projects', 'case studies', 'work'])) {
    return 'showcase_work'
  }

  if (matches(text, ['donate', 'donation', 'supporters', 'fundraise'])) {
    return 'attract_donors'
  }

  if (matches(text, ['event', 'wedding', 'conference', 'festival'])) {
    return 'promote_event'
  }

  if (matches(text, ['subscribe', 'newsletter', 'mailing list'])) {
    return 'grow_subscribers'
  }

  if (matches(text, ['hiring', 'careers', 'join our team', 'recruit'])) {
    return 'recruit_talent'
  }

  return 'get_leads'
}

/**
 * Read the site's own content and the user's phrasing into a design profile. Anything
 * the user named explicitly is locked; everything else is left as ai_pick so the art
 * director is free to make the interesting choices.
 */
export function inferDesignProfile(input: DesignContextInput): AiSiteWizardProfile {
  const copy = input.pageCopy.join(' ').slice(0, 2000)
  const instruction = input.instruction.trim()
  const combined = `${instruction} ${copy}`
  const industry = pickIndustry(combined)
  const stylePersonality = pickPersonality(instruction, copy)
  let colorMood = pickColorMood(instruction)
  let colorMode = pickColorMode(instruction)
  let animationLevel = pickAnimationLevel(instruction)
  let cornerStyle = pickCorners(instruction)

  // Splashy locks the register-page vibe unless the user explicitly overrides a knob.
  if (stylePersonality === 'splashy') {
    if (colorMood === 'ai_pick') colorMood = 'violet'
    if (colorMode === 'ai_pick') colorMode = 'dark'
    if (animationLevel === 'moderate') animationLevel = 'energetic'
    if (cornerStyle === 'ai_pick') cornerStyle = 'round'
  }

  return {
    companyName: input.businessName.trim() || 'This business',
    slogan: input.pageCopy[1]?.slice(0, 200) ?? '',
    description: copy.slice(0, 1200),
    logoUrl: input.logoUrl ?? '',
    siteTitle: input.businessName.trim().slice(0, 120),
    audience: '',
    keyOfferings: input.pageCopy.slice(0, 8).join(' · ').slice(0, 400),
    differentiators: instruction.slice(0, 400),
    category: INDUSTRY_CATEGORY[industry],
    industry,
    purpose: pickPurpose(combined),
    stylePersonality,
    colorMood,
    colorMode,
    animationLevel,
    fontChoice: pickFont(instruction),
    layoutDensity: pickDensity(instruction),
    cornerStyle,
    brandVoice: pickVoice(instruction),
    heroStyle: pickHeroStyle(instruction),
    generationNonce: input.nonce
  }
}
