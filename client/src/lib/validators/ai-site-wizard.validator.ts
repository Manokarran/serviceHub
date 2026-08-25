import { z } from 'zod'

import { SITE_TEMPLATE_CATEGORIES } from '@/lib/constants/site-template'

export const AI_SITE_PURPOSES = [
  'get_leads',
  'showcase_work',
  'sell_online',
  'inform',
  'book_appointments',
  'build_community',
  'launch_product',
  'promote_event',
  'grow_subscribers',
  'attract_donors',
  'recruit_talent'
] as const

export const AI_STYLE_PERSONALITIES = [
  'simple',
  'bold',
  'elegant',
  'playful',
  'professional',
  'flashy',
  'minimal',
  'luxury',
  'warm',
  'editorial',
  'techy',
  'organic'
] as const

export const AI_COLOR_MOODS = [
  'ai_pick',
  'blue',
  'indigo',
  'violet',
  'teal',
  'green',
  'emerald',
  'orange',
  'amber',
  'rose',
  'crimson',
  'coral',
  'plum',
  'gold',
  'sand',
  'slate',
  'mono'
] as const

export const AI_COLOR_MODES = ['ai_pick', 'light', 'dark'] as const

export const AI_ANIMATION_LEVELS = ['none', 'subtle', 'moderate', 'energetic'] as const

export const AI_FONT_CHOICES = [
  'ai_pick',
  'inter',
  'dm_sans',
  'poppins',
  'montserrat',
  'plus_jakarta',
  'manrope',
  'lexend',
  'space_grotesk',
  'sora',
  'syne',
  'outfit',
  'playfair',
  'cormorant',
  'merriweather',
  'fraunces',
  'libre_baskerville',
  'instrument_serif',
  'crimson'
] as const

export const AI_LAYOUT_DENSITIES = ['ai_pick', 'compact', 'balanced', 'airy'] as const

export const AI_CORNER_STYLES = ['ai_pick', 'sharp', 'soft', 'round'] as const

export const AI_BRAND_VOICES = [
  'ai_pick',
  'friendly',
  'confident',
  'expert',
  'luxurious',
  'playful',
  'inspirational',
  'straightforward'
] as const

export const AI_HERO_STYLES = ['ai_pick', 'centered', 'split-left', 'split-right'] as const

export const AI_INDUSTRY_OPTIONS = [
  'technology',
  'healthcare',
  'food_hospitality',
  'real_estate',
  'creative_agency',
  'retail',
  'education',
  'fitness',
  'finance',
  'nonprofit',
  'beauty',
  'construction',
  'legal',
  'travel',
  'automotive',
  'events',
  'home_services',
  'pets',
  'arts_music',
  'other'
] as const

export const aiSiteWizardProfileSchema = z.object({
  companyName: z.string().trim().min(1, 'Enter your business or brand name').max(120),
  slogan: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().max(1200).optional().default(''),
  logoUrl: z.string().trim().max(500).optional().default(''),
  siteTitle: z.string().trim().max(120).optional().default(''),
  audience: z.string().trim().max(300).optional().default(''),
  keyOfferings: z.string().trim().max(400).optional().default(''),
  differentiators: z.string().trim().max(400).optional().default(''),
  category: z.enum(SITE_TEMPLATE_CATEGORIES),
  industry: z.enum(AI_INDUSTRY_OPTIONS),
  purpose: z.enum(AI_SITE_PURPOSES),
  stylePersonality: z.enum(AI_STYLE_PERSONALITIES),
  colorMood: z.enum(AI_COLOR_MOODS),
  colorMode: z.enum(AI_COLOR_MODES).optional().default('ai_pick'),
  animationLevel: z.enum(AI_ANIMATION_LEVELS),
  fontChoice: z.enum(AI_FONT_CHOICES).optional().default('ai_pick'),
  layoutDensity: z.enum(AI_LAYOUT_DENSITIES).optional().default('ai_pick'),
  cornerStyle: z.enum(AI_CORNER_STYLES).optional().default('ai_pick'),
  brandVoice: z.enum(AI_BRAND_VOICES).optional().default('ai_pick'),
  heroStyle: z.enum(AI_HERO_STYLES).optional().default('ai_pick'),
  generationNonce: z.string().trim().max(64).optional().default('')
})

export type AiSiteWizardProfile = z.infer<typeof aiSiteWizardProfileSchema>

export const AI_SITE_PURPOSE_LABELS: Record<(typeof AI_SITE_PURPOSES)[number], string> = {
  get_leads: 'Generate leads & inquiries',
  showcase_work: 'Showcase portfolio or work',
  sell_online: 'Sell products or services',
  inform: 'Share information & updates',
  book_appointments: 'Take bookings & appointments',
  build_community: 'Build a community',
  launch_product: 'Launch a new product',
  promote_event: 'Promote an event',
  grow_subscribers: 'Grow a subscriber list',
  attract_donors: 'Attract donors & supporters',
  recruit_talent: 'Recruit talent'
}

export const AI_STYLE_PERSONALITY_LABELS: Record<(typeof AI_STYLE_PERSONALITIES)[number], string> = {
  simple: 'Simple & clean',
  bold: 'Bold & high-contrast',
  elegant: 'Elegant & refined',
  playful: 'Playful & friendly',
  professional: 'Professional & trustworthy',
  flashy: 'Flashy & eye-catching',
  minimal: 'Minimal & spacious',
  luxury: 'Luxury & premium',
  warm: 'Warm & welcoming',
  editorial: 'Editorial & magazine',
  techy: 'Technical & precise',
  organic: 'Organic & natural'
}

export const AI_COLOR_MOOD_LABELS: Record<(typeof AI_COLOR_MOODS)[number], string> = {
  ai_pick: 'Let AI choose',
  blue: 'Classic blue',
  indigo: 'Deep indigo',
  violet: 'Creative violet',
  teal: 'Fresh teal',
  green: 'Natural green',
  emerald: 'Rich emerald',
  orange: 'Warm orange',
  amber: 'Golden amber',
  rose: 'Soft rose',
  crimson: 'Bold crimson',
  coral: 'Vibrant coral',
  plum: 'Moody plum',
  gold: 'Champagne gold',
  sand: 'Earthy sand',
  slate: 'Cool slate',
  mono: 'Monochrome'
}

export const AI_COLOR_MODE_LABELS: Record<(typeof AI_COLOR_MODES)[number], string> = {
  ai_pick: 'Let AI decide',
  light: 'Light mode',
  dark: 'Dark mode'
}

export const AI_ANIMATION_LEVEL_LABELS: Record<(typeof AI_ANIMATION_LEVELS)[number], string> = {
  none: 'No animation',
  subtle: 'Subtle motion',
  moderate: 'Moderate animation',
  energetic: 'Energetic & dynamic'
}

export const AI_FONT_CHOICE_LABELS: Record<(typeof AI_FONT_CHOICES)[number], string> = {
  ai_pick: 'Let AI choose',
  inter: 'Inter',
  dm_sans: 'DM Sans',
  poppins: 'Poppins',
  montserrat: 'Montserrat',
  plus_jakarta: 'Plus Jakarta Sans',
  manrope: 'Manrope',
  lexend: 'Lexend',
  space_grotesk: 'Space Grotesk',
  sora: 'Sora',
  syne: 'Syne',
  outfit: 'Outfit',
  playfair: 'Playfair Display',
  cormorant: 'Cormorant Garamond',
  merriweather: 'Merriweather',
  fraunces: 'Fraunces',
  libre_baskerville: 'Libre Baskerville',
  instrument_serif: 'Instrument Serif',
  crimson: 'Crimson Pro'
}

export const AI_LAYOUT_DENSITY_LABELS: Record<(typeof AI_LAYOUT_DENSITIES)[number], string> = {
  ai_pick: 'Let AI decide',
  compact: 'Compact',
  balanced: 'Balanced',
  airy: 'Airy'
}

export const AI_CORNER_STYLE_LABELS: Record<(typeof AI_CORNER_STYLES)[number], string> = {
  ai_pick: 'Let AI decide',
  sharp: 'Sharp',
  soft: 'Soft',
  round: 'Rounded'
}

export const AI_BRAND_VOICE_LABELS: Record<(typeof AI_BRAND_VOICES)[number], string> = {
  ai_pick: 'Let AI decide',
  friendly: 'Friendly & approachable',
  confident: 'Confident & direct',
  expert: 'Expert & authoritative',
  luxurious: 'Refined & luxurious',
  playful: 'Playful & witty',
  inspirational: 'Inspirational & uplifting',
  straightforward: 'Plain & straightforward'
}

export const AI_HERO_STYLE_LABELS: Record<(typeof AI_HERO_STYLES)[number], string> = {
  ai_pick: 'Let AI decide',
  centered: 'Centered spotlight',
  'split-left': 'Split — visual right',
  'split-right': 'Split — visual left'
}

export const AI_INDUSTRY_LABELS: Record<(typeof AI_INDUSTRY_OPTIONS)[number], string> = {
  technology: 'Technology & SaaS',
  healthcare: 'Healthcare & wellness',
  food_hospitality: 'Food & hospitality',
  real_estate: 'Real estate',
  creative_agency: 'Creative agency',
  retail: 'Retail & e-commerce',
  education: 'Education & coaching',
  fitness: 'Fitness & sports',
  finance: 'Finance & consulting',
  nonprofit: 'Nonprofit & community',
  beauty: 'Beauty & salon',
  construction: 'Construction & trades',
  legal: 'Legal & professional',
  travel: 'Travel & tourism',
  automotive: 'Automotive',
  events: 'Events & weddings',
  home_services: 'Home services',
  pets: 'Pets & veterinary',
  arts_music: 'Arts & music',
  other: 'Other'
}
