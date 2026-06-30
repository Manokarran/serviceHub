import { z } from 'zod'

import { SITE_TEMPLATE_CATEGORIES } from '@/lib/constants/site-template'

export const AI_SITE_PURPOSES = [
  'get_leads',
  'showcase_work',
  'sell_online',
  'inform',
  'book_appointments',
  'build_community'
] as const

export const AI_STYLE_PERSONALITIES = [
  'simple',
  'bold',
  'elegant',
  'playful',
  'professional',
  'flashy'
] as const

export const AI_COLOR_MOODS = [
  'blue',
  'orange',
  'green',
  'dark',
  'light',
  'violet',
  'ai_pick'
] as const

export const AI_ANIMATION_LEVELS = ['none', 'subtle', 'moderate', 'energetic'] as const

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
  'other'
] as const

export const aiSiteWizardProfileSchema = z.object({
  companyName: z.string().trim().min(1, 'Enter your business or brand name').max(120),
  slogan: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().max(1000).optional().default(''),
  category: z.enum(SITE_TEMPLATE_CATEGORIES),
  industry: z.enum(AI_INDUSTRY_OPTIONS),
  purpose: z.enum(AI_SITE_PURPOSES),
  stylePersonality: z.enum(AI_STYLE_PERSONALITIES),
  colorMood: z.enum(AI_COLOR_MOODS),
  animationLevel: z.enum(AI_ANIMATION_LEVELS)
})

export type AiSiteWizardProfile = z.infer<typeof aiSiteWizardProfileSchema>

export const AI_SITE_PURPOSE_LABELS: Record<(typeof AI_SITE_PURPOSES)[number], string> = {
  get_leads: 'Generate leads & inquiries',
  showcase_work: 'Showcase portfolio or work',
  sell_online: 'Sell products or services',
  inform: 'Share information & updates',
  book_appointments: 'Book appointments',
  build_community: 'Build a community'
}

export const AI_STYLE_PERSONALITY_LABELS: Record<(typeof AI_STYLE_PERSONALITIES)[number], string> = {
  simple: 'Simple & clean',
  bold: 'Bold & high-contrast',
  elegant: 'Elegant & refined',
  playful: 'Playful & friendly',
  professional: 'Professional & trustworthy',
  flashy: 'Flashy & eye-catching'
}

export const AI_COLOR_MOOD_LABELS: Record<(typeof AI_COLOR_MOODS)[number], string> = {
  blue: 'Blue dominated',
  orange: 'Warm orange / sunset',
  green: 'Natural greens',
  dark: 'Dark & modern',
  light: 'Light & minimal',
  violet: 'Violet & creative',
  ai_pick: 'Let AI choose'
}

export const AI_ANIMATION_LEVEL_LABELS: Record<(typeof AI_ANIMATION_LEVELS)[number], string> = {
  none: 'No animation',
  subtle: 'Subtle motion',
  moderate: 'Moderate animation',
  energetic: 'Energetic & dynamic'
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
  other: 'Other'
}
