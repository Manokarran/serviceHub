/**
 * AI / setup credit catalog. Super admins can override amounts via platform settings.
 */

export const CREDIT_FEATURES = [
  'generate_change_text',
  'rewrite_text',
  'generate_seo',
  'change_image_background',
  'major_redesign',
  'ai_chat_minor',
  'ai_chat_major',
  'service_setup'
] as const

export type CreditFeature = (typeof CREDIT_FEATURES)[number]

export type CreditCostMap = Record<CreditFeature, number>

export const DEFAULT_SIGNUP_CREDITS = 20

export const DEFAULT_CREDIT_COSTS: CreditCostMap = {
  generate_change_text: 1,
  rewrite_text: 1,
  generate_seo: 2,
  change_image_background: 2,
  major_redesign: 5,
  ai_chat_minor: 1,
  ai_chat_major: 2,
  service_setup: 5
}

export const CREDIT_FEATURE_LABELS: Record<
  CreditFeature,
  { title: string; description: string; note?: string }
> = {
  generate_change_text: {
    title: 'Generate / change website text',
    description: 'AI writes or updates copy on your pages'
  },
  rewrite_text: {
    title: 'Rewrite text',
    description: 'AI rewords selected copy in place'
  },
  generate_seo: {
    title: 'Generate SEO content',
    description: 'AI drafts page titles and meta descriptions'
  },
  change_image_background: {
    title: 'Change image background',
    description: 'AI picks a photo from Unsplash',
    note: 'Photos are selected, not AI-generated'
  },
  major_redesign: {
    title: 'Major redesign of existing website',
    description: 'Full restyle or AI site generation for your brand'
  },
  ai_chat_minor: {
    title: 'AI chat — design tweak',
    description: 'Small layout or property changes via chat'
  },
  ai_chat_major: {
    title: 'AI chat — larger modification',
    description: 'Broader redesign-style instructions in chat'
  },
  service_setup: {
    title: 'Create a service',
    description: 'Each new bookable service uses credits'
  }
}

/** Features shown in the public pricing table (excludes chat split for clarity). */
export const CREDIT_PRICING_DISPLAY: Array<{
  feature: CreditFeature | 'ai_chat'
  title: string
  creditsLabel: string
  note?: string
}> = [
  {
    feature: 'generate_change_text',
    title: 'Generate / change website text',
    creditsLabel: '1 credit'
  },
  {
    feature: 'rewrite_text',
    title: 'Rewrite text',
    creditsLabel: '1 credit'
  },
  {
    feature: 'generate_seo',
    title: 'Generate SEO content',
    creditsLabel: '2 credits'
  },
  {
    feature: 'change_image_background',
    title: 'Change image background',
    creditsLabel: '2 credits',
    note: 'Unsplash photo pick — not generated'
  },
  {
    feature: 'major_redesign',
    title: 'Major redesign of existing website',
    creditsLabel: '5 credits'
  },
  {
    feature: 'ai_chat',
    title: 'AI chat / design modification',
    creditsLabel: '1–2 credits'
  },
  {
    feature: 'service_setup',
    title: 'Create a service',
    creditsLabel: '5 credits'
  }
]
