export const DEFAULT_TEMPLATE_THUMBNAIL = '/images/templates/default-template.svg'

export const SITE_TEMPLATE_CATEGORIES = [
  'business',
  'services',
  'portfolio',
  'restaurant',
  'creative',
  'landing',
  'ecommerce',
  'health',
  'fitness',
  'beauty',
  'education',
  'events',
  'realestate',
  'nonprofit',
  'personal',
  'blog',
  'other'
] as const

export const SITE_TEMPLATE_STATUSES = ['draft', 'published', 'archived'] as const

export type SiteTemplateCategory = (typeof SITE_TEMPLATE_CATEGORIES)[number]
export type SiteTemplateStatus = (typeof SITE_TEMPLATE_STATUSES)[number]

export const SITE_TEMPLATE_CATEGORY_LABELS: Record<SiteTemplateCategory, string> = {
  business: 'Business',
  services: 'Local Services',
  portfolio: 'Portfolio',
  restaurant: 'Restaurant & Café',
  creative: 'Creative Studio',
  landing: 'Landing Page',
  ecommerce: 'Online Store',
  health: 'Health & Wellness',
  fitness: 'Fitness & Gym',
  beauty: 'Beauty & Salon',
  education: 'Education & Courses',
  events: 'Events & Weddings',
  realestate: 'Real Estate',
  nonprofit: 'Nonprofit',
  personal: 'Personal Brand',
  blog: 'Blog & Publication',
  other: 'Other'
}
