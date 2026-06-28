export const DEFAULT_TEMPLATE_THUMBNAIL = '/images/templates/default-template.svg'

export const SITE_TEMPLATE_CATEGORIES = [
  'business',
  'portfolio',
  'restaurant',
  'creative',
  'landing',
  'other'
] as const

export const SITE_TEMPLATE_STATUSES = ['draft', 'published', 'archived'] as const

export type SiteTemplateCategory = (typeof SITE_TEMPLATE_CATEGORIES)[number]
export type SiteTemplateStatus = (typeof SITE_TEMPLATE_STATUSES)[number]

export const SITE_TEMPLATE_CATEGORY_LABELS: Record<SiteTemplateCategory, string> = {
  business: 'Business',
  portfolio: 'Portfolio',
  restaurant: 'Restaurant',
  creative: 'Creative',
  landing: 'Landing Page',
  other: 'Other'
}
