import type { SiteColors } from '@/features/your-space/types/siteStyles'
import type { UnsplashColorFilter } from '@/lib/unsplash/types'
import type {
  AI_BRAND_VOICES,
  AI_COLOR_MOODS,
  AI_CORNER_STYLES,
  AI_FONT_CHOICES,
  AI_INDUSTRY_OPTIONS,
  AI_LAYOUT_DENSITIES,
  AI_SITE_PURPOSES,
  AI_STYLE_PERSONALITIES
} from '@/lib/validators/ai-site-wizard.validator'
import type { SiteTemplateCategory } from '@/lib/constants/site-template'

type PaletteId = Exclude<(typeof AI_COLOR_MOODS)[number], 'ai_pick'>
type FontPairId = Exclude<(typeof AI_FONT_CHOICES)[number], 'ai_pick'>

export type ColorPalette = {
  id: PaletteId
  label: string
  blurb: string
  accent: string
  gradientStart: string
  gradientEnd: string
  unsplashColor: UnsplashColorFilter

  /** Five surface-to-ink swatches used across blocks, lightest first. */
  light: SiteColors
  dark: SiteColors
}

function palette(
  id: PaletteId,
  label: string,
  blurb: string,
  accent: string,
  gradientStart: string,
  gradientEnd: string,
  unsplashColor: UnsplashColorFilter,
  light: Omit<SiteColors, 'accent'>,
  dark: Omit<SiteColors, 'accent'>,
  darkAccent = accent
): ColorPalette {
  return {
    id,
    label,
    blurb,
    accent,
    gradientStart,
    gradientEnd,
    unsplashColor,
    light: { ...light, accent },
    dark: { ...dark, accent: darkAccent }
  }
}

export const COLOR_PALETTES: ColorPalette[] = [
  palette(
    'blue',
    'Classic blue',
    'Dependable and calm — the safe default for business',
    '#2563eb',
    '#3b82f6',
    '#1d4ed8',
    'blue',
    {
      swatch1: '#ffffff',
      swatch2: '#eff6ff',
      swatch3: '#93c5fd',
      swatch4: '#1e40af',
      swatch5: '#0f214d',
      background: '#ffffff',
      text: '#0f214d'
    },
    {
      swatch1: '#0f172a',
      swatch2: '#1e293b',
      swatch3: '#3b82f6',
      swatch4: '#93c5fd',
      swatch5: '#dbeafe',
      background: '#0b1220',
      text: '#e2e8f0'
    },
    '#60a5fa'
  ),
  palette(
    'indigo',
    'Deep indigo',
    'Modern SaaS energy with a serious edge',
    '#4f46e5',
    '#6366f1',
    '#312e81',
    'blue',
    {
      swatch1: '#ffffff',
      swatch2: '#eef2ff',
      swatch3: '#a5b4fc',
      swatch4: '#4338ca',
      swatch5: '#1e1b4b',
      background: '#ffffff',
      text: '#1e1b4b'
    },
    {
      swatch1: '#151235',
      swatch2: '#241f52',
      swatch3: '#6366f1',
      swatch4: '#a5b4fc',
      swatch5: '#e0e7ff',
      background: '#0d0b24',
      text: '#e0e7ff'
    },
    '#818cf8'
  ),
  palette(
    'violet',
    'Creative violet',
    'Expressive and imaginative — great for studios',
    '#7c3aed',
    '#8b5cf6',
    '#6d28d9',
    'purple',
    {
      swatch1: '#ffffff',
      swatch2: '#faf5ff',
      swatch3: '#c4b5fd',
      swatch4: '#6d28d9',
      swatch5: '#2e1065',
      background: '#ffffff',
      text: '#2e1065'
    },
    {
      swatch1: '#1c1033',
      swatch2: '#2e1b52',
      swatch3: '#8b5cf6',
      swatch4: '#c4b5fd',
      swatch5: '#ede9fe',
      background: '#140a26',
      text: '#ede9fe'
    },
    '#a78bfa'
  ),
  palette(
    'teal',
    'Fresh teal',
    'Clean and clinical with a coastal lift',
    '#0d9488',
    '#14b8a6',
    '#0f766e',
    'teal',
    {
      swatch1: '#ffffff',
      swatch2: '#f0fdfa',
      swatch3: '#5eead4',
      swatch4: '#0f766e',
      swatch5: '#042f2e',
      background: '#ffffff',
      text: '#042f2e'
    },
    {
      swatch1: '#0b2b28',
      swatch2: '#134e48',
      swatch3: '#14b8a6',
      swatch4: '#5eead4',
      swatch5: '#ccfbf1',
      background: '#04201e',
      text: '#ccfbf1'
    },
    '#2dd4bf'
  ),
  palette(
    'green',
    'Natural green',
    'Grounded and healthy — wellness and outdoors',
    '#16a34a',
    '#22c55e',
    '#15803d',
    'green',
    {
      swatch1: '#ffffff',
      swatch2: '#f0fdf4',
      swatch3: '#86efac',
      swatch4: '#15803d',
      swatch5: '#14532d',
      background: '#ffffff',
      text: '#14532d'
    },
    {
      swatch1: '#0d2b1a',
      swatch2: '#14532d',
      swatch3: '#22c55e',
      swatch4: '#86efac',
      swatch5: '#dcfce7',
      background: '#07200f',
      text: '#dcfce7'
    },
    '#4ade80'
  ),
  palette(
    'emerald',
    'Rich emerald',
    'Confident growth — finance and consulting',
    '#059669',
    '#10b981',
    '#047857',
    'green',
    {
      swatch1: '#ffffff',
      swatch2: '#ecfdf5',
      swatch3: '#6ee7b7',
      swatch4: '#047857',
      swatch5: '#022c22',
      background: '#ffffff',
      text: '#022c22'
    },
    {
      swatch1: '#062d22',
      swatch2: '#064e3b',
      swatch3: '#10b981',
      swatch4: '#6ee7b7',
      swatch5: '#d1fae5',
      background: '#031f18',
      text: '#d1fae5'
    },
    '#34d399'
  ),
  palette(
    'orange',
    'Warm orange',
    'Friendly and energetic — food and community',
    '#ea580c',
    '#f97316',
    '#c2410c',
    'orange',
    {
      swatch1: '#ffffff',
      swatch2: '#fff7ed',
      swatch3: '#fdba74',
      swatch4: '#c2410c',
      swatch5: '#431407',
      background: '#fffdfb',
      text: '#431407'
    },
    {
      swatch1: '#301207',
      swatch2: '#4d1d09',
      swatch3: '#f97316',
      swatch4: '#fdba74',
      swatch5: '#ffedd5',
      background: '#220d05',
      text: '#ffedd5'
    },
    '#fb923c'
  ),
  palette(
    'amber',
    'Golden amber',
    'Sunlit and optimistic with a retail warmth',
    '#d97706',
    '#f59e0b',
    '#b45309',
    'yellow',
    {
      swatch1: '#ffffff',
      swatch2: '#fffbeb',
      swatch3: '#fcd34d',
      swatch4: '#b45309',
      swatch5: '#451a03',
      background: '#fffdf7',
      text: '#451a03'
    },
    {
      swatch1: '#2e1a05',
      swatch2: '#4d2c07',
      swatch3: '#f59e0b',
      swatch4: '#fcd34d',
      swatch5: '#fef3c7',
      background: '#1f1103',
      text: '#fef3c7'
    },
    '#fbbf24'
  ),
  palette(
    'rose',
    'Soft rose',
    'Gentle and personal — beauty and lifestyle',
    '#e11d48',
    '#fb7185',
    '#be123c',
    'red',
    {
      swatch1: '#ffffff',
      swatch2: '#fff1f2',
      swatch3: '#fda4af',
      swatch4: '#be123c',
      swatch5: '#4c0519',
      background: '#fffbfc',
      text: '#4c0519'
    },
    {
      swatch1: '#330711',
      swatch2: '#4c0519',
      swatch3: '#fb7185',
      swatch4: '#fda4af',
      swatch5: '#ffe4e6',
      background: '#25050d',
      text: '#ffe4e6'
    },
    '#fb7185'
  ),
  palette(
    'crimson',
    'Bold crimson',
    'High drama and urgency — launches and events',
    '#dc2626',
    '#ef4444',
    '#991b1b',
    'red',
    {
      swatch1: '#ffffff',
      swatch2: '#fef2f2',
      swatch3: '#fca5a5',
      swatch4: '#991b1b',
      swatch5: '#450a0a',
      background: '#ffffff',
      text: '#450a0a'
    },
    {
      swatch1: '#2d0808',
      swatch2: '#450a0a',
      swatch3: '#ef4444',
      swatch4: '#fca5a5',
      swatch5: '#fee2e2',
      background: '#1e0505',
      text: '#fee2e2'
    },
    '#f87171'
  ),
  palette(
    'coral',
    'Vibrant coral',
    'Playful and modern — creative and youth brands',
    '#f43f5e',
    '#fb7185',
    '#f97316',
    'magenta',
    {
      swatch1: '#ffffff',
      swatch2: '#fff5f5',
      swatch3: '#fda4af',
      swatch4: '#e11d48',
      swatch5: '#3f0715',
      background: '#fffcfb',
      text: '#3f0715'
    },
    {
      swatch1: '#2c0a14',
      swatch2: '#4a0f20',
      swatch3: '#fb7185',
      swatch4: '#fecdd3',
      swatch5: '#ffe4e6',
      background: '#1d0710',
      text: '#ffe4e6'
    },
    '#fb7185'
  ),
  palette(
    'plum',
    'Moody plum',
    'Nightlife and premium services',
    '#9333ea',
    '#a855f7',
    '#581c87',
    'purple',
    {
      swatch1: '#ffffff',
      swatch2: '#faf5ff',
      swatch3: '#d8b4fe',
      swatch4: '#7e22ce',
      swatch5: '#3b0764',
      background: '#fdfcff',
      text: '#3b0764'
    },
    {
      swatch1: '#210b36',
      swatch2: '#3b0764',
      swatch3: '#a855f7',
      swatch4: '#d8b4fe',
      swatch5: '#f3e8ff',
      background: '#170627',
      text: '#f3e8ff'
    },
    '#c084fc'
  ),
  palette(
    'gold',
    'Champagne gold',
    'Understated luxury on warm neutrals',
    '#a16207',
    '#ca8a04',
    '#78350f',
    'yellow',
    {
      swatch1: '#fefdfb',
      swatch2: '#faf7f0',
      swatch3: '#d6c39a',
      swatch4: '#8a6d2f',
      swatch5: '#1c1917',
      background: '#fdfbf6',
      text: '#1c1917'
    },
    {
      swatch1: '#1f1b14',
      swatch2: '#2e2820',
      swatch3: '#ca8a04',
      swatch4: '#e3cd93',
      swatch5: '#faf7f0',
      background: '#14110c',
      text: '#f5efe2'
    },
    '#d4af37'
  ),
  palette(
    'sand',
    'Earthy sand',
    'Organic, tactile, and calm — artisan brands',
    '#a8763e',
    '#c79a63',
    '#7c5228',
    'orange',
    {
      swatch1: '#fffdf9',
      swatch2: '#f7f0e6',
      swatch3: '#dcc6a8',
      swatch4: '#8b6b47',
      swatch5: '#3b2d20',
      background: '#fdfaf4',
      text: '#3b2d20'
    },
    {
      swatch1: '#241c14',
      swatch2: '#3b2d20',
      swatch3: '#c79a63',
      swatch4: '#dcc6a8',
      swatch5: '#f7f0e6',
      background: '#191309',
      text: '#f2e8d9'
    },
    '#d1a878'
  ),
  palette(
    'slate',
    'Cool slate',
    'Neutral and technical — engineering and B2B',
    '#475569',
    '#64748b',
    '#1e293b',
    'black',
    {
      swatch1: '#ffffff',
      swatch2: '#f8fafc',
      swatch3: '#cbd5e1',
      swatch4: '#475569',
      swatch5: '#0f172a',
      background: '#ffffff',
      text: '#0f172a'
    },
    {
      swatch1: '#1e293b',
      swatch2: '#334155',
      swatch3: '#64748b',
      swatch4: '#cbd5e1',
      swatch5: '#f1f5f9',
      background: '#0f172a',
      text: '#e2e8f0'
    },
    '#94a3b8'
  ),
  palette(
    'mono',
    'Monochrome',
    'Pure black and white — editorial and fashion',
    '#18181b',
    '#3f3f46',
    '#09090b',
    'black_and_white',
    {
      swatch1: '#ffffff',
      swatch2: '#fafafa',
      swatch3: '#d4d4d8',
      swatch4: '#52525b',
      swatch5: '#18181b',
      background: '#ffffff',
      text: '#18181b'
    },
    {
      swatch1: '#18181b',
      swatch2: '#27272a',
      swatch3: '#52525b',
      swatch4: '#a1a1aa',
      swatch5: '#fafafa',
      background: '#09090b',
      text: '#fafafa'
    },
    '#fafafa'
  )
]

export const COLOR_PALETTE_BY_ID = new Map(COLOR_PALETTES.map(entry => [entry.id, entry]))

export function getPalette(id: string): ColorPalette {
  return COLOR_PALETTE_BY_ID.get(id as PaletteId) ?? COLOR_PALETTES[0]
}

/** Palettes whose light surfaces already read as warm/dark enough to look good in dark mode. */
export function resolvePaletteColors(paletteId: string, mode: 'light' | 'dark'): SiteColors {
  const entry = getPalette(paletteId)

  return { ...(mode === 'dark' ? entry.dark : entry.light) }
}

export type FontPairing = {
  id: FontPairId
  label: string
  blurb: string
  headingFamily: string
  bodyFamily: string
  headingWeight: number
  headingLetterSpacing: number

  /** Rough classification the art director reasons about. */
  mood: 'geometric' | 'neutral' | 'expressive' | 'serif' | 'editorial'
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'inter',
    label: 'Inter',
    blurb: 'Neutral, legible, never wrong',
    headingFamily: '"Inter", system-ui, sans-serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.02,
    mood: 'neutral'
  },
  {
    id: 'dm_sans',
    label: 'DM Sans',
    blurb: 'Friendly product and SaaS voice',
    headingFamily: '"DM Sans", system-ui, sans-serif',
    bodyFamily: '"DM Sans", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.02,
    mood: 'geometric'
  },
  {
    id: 'poppins',
    label: 'Poppins + Nunito',
    blurb: 'Round, warm, and approachable',
    headingFamily: '"Poppins", system-ui, sans-serif',
    bodyFamily: '"Nunito", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: 0,
    mood: 'geometric'
  },
  {
    id: 'montserrat',
    label: 'Montserrat + Open Sans',
    blurb: 'Broad, bold display headlines',
    headingFamily: '"Montserrat", system-ui, sans-serif',
    bodyFamily: '"Open Sans", system-ui, sans-serif',
    headingWeight: 800,
    headingLetterSpacing: -0.03,
    mood: 'geometric'
  },
  {
    id: 'plus_jakarta',
    label: 'Plus Jakarta Sans',
    blurb: 'Crisp and contemporary',
    headingFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    bodyFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.02,
    mood: 'neutral'
  },
  {
    id: 'manrope',
    label: 'Manrope',
    blurb: 'Quietly technical, wide counters',
    headingFamily: '"Manrope", system-ui, sans-serif',
    bodyFamily: '"Manrope", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.02,
    mood: 'neutral'
  },
  {
    id: 'lexend',
    label: 'Lexend',
    blurb: 'Engineered for fast reading',
    headingFamily: '"Lexend", system-ui, sans-serif',
    bodyFamily: '"Lexend", system-ui, sans-serif',
    headingWeight: 600,
    headingLetterSpacing: -0.01,
    mood: 'neutral'
  },
  {
    id: 'space_grotesk',
    label: 'Space Grotesk + Inter',
    blurb: 'Technical with personality',
    headingFamily: '"Space Grotesk", system-ui, sans-serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.03,
    mood: 'expressive'
  },
  {
    id: 'sora',
    label: 'Sora + Inter',
    blurb: 'Future-facing and geometric',
    headingFamily: '"Sora", system-ui, sans-serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.03,
    mood: 'geometric'
  },
  {
    id: 'syne',
    label: 'Syne + DM Sans',
    blurb: 'Art-gallery attitude',
    headingFamily: '"Syne", system-ui, sans-serif',
    bodyFamily: '"DM Sans", system-ui, sans-serif',
    headingWeight: 800,
    headingLetterSpacing: -0.02,
    mood: 'expressive'
  },
  {
    id: 'outfit',
    label: 'Outfit',
    blurb: 'Clean geometric display',
    headingFamily: '"Outfit", system-ui, sans-serif',
    bodyFamily: '"Outfit", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.02,
    mood: 'geometric'
  },
  {
    id: 'playfair',
    label: 'Playfair Display + Source Sans',
    blurb: 'High-contrast editorial serif',
    headingFamily: '"Playfair Display", Georgia, serif',
    bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    headingWeight: 600,
    headingLetterSpacing: 0.01,
    mood: 'editorial'
  },
  {
    id: 'cormorant',
    label: 'Cormorant + Raleway',
    blurb: 'Delicate, couture, high-end',
    headingFamily: '"Cormorant Garamond", Georgia, serif',
    bodyFamily: '"Raleway", system-ui, sans-serif',
    headingWeight: 600,
    headingLetterSpacing: 0.02,
    mood: 'serif'
  },
  {
    id: 'merriweather',
    label: 'Merriweather + Source Sans',
    blurb: 'Sturdy, trustworthy, classic',
    headingFamily: '"Merriweather", Georgia, serif',
    bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: 0,
    mood: 'serif'
  },
  {
    id: 'fraunces',
    label: 'Fraunces + Manrope',
    blurb: 'Characterful modern serif',
    headingFamily: '"Fraunces", Georgia, serif',
    bodyFamily: '"Manrope", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: -0.01,
    mood: 'expressive'
  },
  {
    id: 'libre_baskerville',
    label: 'Libre Baskerville + Lato',
    blurb: 'Bookish and considered',
    headingFamily: '"Libre Baskerville", Georgia, serif',
    bodyFamily: '"Lato", system-ui, sans-serif',
    headingWeight: 700,
    headingLetterSpacing: 0,
    mood: 'serif'
  },
  {
    id: 'instrument_serif',
    label: 'Instrument Serif + Inter',
    blurb: 'Oversized fashion headlines',
    headingFamily: '"Instrument Serif", Georgia, serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    headingWeight: 400,
    headingLetterSpacing: -0.01,
    mood: 'editorial'
  },
  {
    id: 'crimson',
    label: 'Crimson Pro + Source Sans',
    blurb: 'Long-form magazine reading',
    headingFamily: '"Crimson Pro", Georgia, serif',
    bodyFamily: '"Source Sans 3", system-ui, sans-serif',
    headingWeight: 600,
    headingLetterSpacing: 0,
    mood: 'editorial'
  }
]

export const FONT_PAIRING_BY_ID = new Map(FONT_PAIRINGS.map(entry => [entry.id, entry]))

export function getFontPairing(id: string): FontPairing {
  return FONT_PAIRING_BY_ID.get(id as FontPairId) ?? FONT_PAIRINGS[0]
}

/** Pull the Google Fonts family name out of a CSS stack, or null for system stacks. */
export function googleFontFamily(stack: string): string | null {
  return stack.match(/^"([^"]+)"/)?.[1] ?? null
}

export type CornerTokens = {
  buttonShape: 'square' | 'rounded' | 'pill'
  cardRadius: number
  imageRadius: number
}

export const CORNER_TOKENS: Record<Exclude<(typeof AI_CORNER_STYLES)[number], 'ai_pick'>, CornerTokens> = {
  sharp: { buttonShape: 'square', cardRadius: 0, imageRadius: 0 },
  soft: { buttonShape: 'rounded', cardRadius: 12, imageRadius: 10 },
  round: { buttonShape: 'pill', cardRadius: 24, imageRadius: 20 }
}

export type DensityTokens = {
  sectionPaddingY: number
  heroMinHeight: number
  gap: number
  spacingScale: 'compact' | 'default' | 'spacious'
}

export const DENSITY_TOKENS: Record<Exclude<(typeof AI_LAYOUT_DENSITIES)[number], 'ai_pick'>, DensityTokens> = {
  compact: { sectionPaddingY: 48, heroMinHeight: 460, gap: 20, spacingScale: 'compact' },
  balanced: { sectionPaddingY: 80, heroMinHeight: 580, gap: 32, spacingScale: 'default' },
  airy: { sectionPaddingY: 120, heroMinHeight: 700, gap: 48, spacingScale: 'spacious' }
}

/** UI metadata: icon + one-line pitch for each pickable option. */
export type OptionMeta = {
  icon: string
  blurb: string
}

export const CATEGORY_META: Record<SiteTemplateCategory, OptionMeta> = {
  business: { icon: 'ri-briefcase-4-line', blurb: 'Company site with services and contact' },
  services: { icon: 'ri-tools-line', blurb: 'Local trade or service provider' },
  portfolio: { icon: 'ri-gallery-line', blurb: 'Show selected work and case studies' },
  restaurant: { icon: 'ri-restaurant-2-line', blurb: 'Menu, atmosphere, and reservations' },
  creative: { icon: 'ri-palette-line', blurb: 'Studio or agency with a strong point of view' },
  landing: { icon: 'ri-rocket-2-line', blurb: 'One focused page built to convert' },
  ecommerce: { icon: 'ri-shopping-bag-3-line', blurb: 'Products, collections, and checkout' },
  health: { icon: 'ri-heart-pulse-line', blurb: 'Clinic, practice, or wellness studio' },
  fitness: { icon: 'ri-run-line', blurb: 'Gym, coach, or training programs' },
  beauty: { icon: 'ri-scissors-2-line', blurb: 'Salon, spa, or beauty professional' },
  education: { icon: 'ri-graduation-cap-line', blurb: 'Courses, coaching, and enrolment' },
  events: { icon: 'ri-calendar-event-line', blurb: 'Weddings, conferences, and celebrations' },
  realestate: { icon: 'ri-home-4-line', blurb: 'Listings, agents, and neighbourhoods' },
  nonprofit: { icon: 'ri-hand-heart-line', blurb: 'Mission, impact, and donations' },
  personal: { icon: 'ri-user-star-line', blurb: 'Personal brand, speaker, or consultant' },
  blog: { icon: 'ri-article-line', blurb: 'Writing, publication, or newsletter' },
  other: { icon: 'ri-layout-grid-line', blurb: 'Something else — we will adapt' }
}

export const PURPOSE_META: Record<(typeof AI_SITE_PURPOSES)[number], OptionMeta> = {
  get_leads: { icon: 'ri-magnet-line', blurb: 'Drive enquiries to a contact form' },
  showcase_work: { icon: 'ri-image-2-line', blurb: 'Let the work do the talking' },
  sell_online: { icon: 'ri-shopping-cart-2-line', blurb: 'Move visitors toward a purchase' },
  inform: { icon: 'ri-information-line', blurb: 'Explain clearly and build trust' },
  book_appointments: { icon: 'ri-calendar-check-line', blurb: 'Fill the calendar with bookings' },
  build_community: { icon: 'ri-group-line', blurb: 'Gather people around a shared idea' },
  launch_product: { icon: 'ri-rocket-line', blurb: 'Build hype for something new' },
  promote_event: { icon: 'ri-ticket-2-line', blurb: 'Sell out the room' },
  grow_subscribers: { icon: 'ri-mail-star-line', blurb: 'Capture emails and keep in touch' },
  attract_donors: { icon: 'ri-hand-coin-line', blurb: 'Turn belief into contribution' },
  recruit_talent: { icon: 'ri-user-add-line', blurb: 'Attract people who want to join' }
}

export const INDUSTRY_META: Record<(typeof AI_INDUSTRY_OPTIONS)[number], OptionMeta> = {
  technology: { icon: 'ri-code-box-line', blurb: 'Software, SaaS, and IT' },
  healthcare: { icon: 'ri-stethoscope-line', blurb: 'Clinics, practitioners, care' },
  food_hospitality: { icon: 'ri-cup-line', blurb: 'Restaurants, cafés, hotels' },
  real_estate: { icon: 'ri-building-2-line', blurb: 'Property and development' },
  creative_agency: { icon: 'ri-brush-4-line', blurb: 'Design, brand, and media' },
  retail: { icon: 'ri-store-2-line', blurb: 'Shops and e-commerce' },
  education: { icon: 'ri-book-open-line', blurb: 'Schools, courses, coaching' },
  fitness: { icon: 'ri-boxing-line', blurb: 'Gyms, studios, sport' },
  finance: { icon: 'ri-line-chart-line', blurb: 'Advisory, accounting, fintech' },
  nonprofit: { icon: 'ri-seedling-line', blurb: 'Charities and community' },
  beauty: { icon: 'ri-sparkling-2-line', blurb: 'Salons, spa, cosmetics' },
  construction: { icon: 'ri-hammer-line', blurb: 'Building and trades' },
  legal: { icon: 'ri-scales-3-line', blurb: 'Law and professional services' },
  travel: { icon: 'ri-plane-line', blurb: 'Tourism and experiences' },
  automotive: { icon: 'ri-car-line', blurb: 'Dealers, repair, detailing' },
  events: { icon: 'ri-goblet-line', blurb: 'Planning and venues' },
  home_services: { icon: 'ri-home-gear-line', blurb: 'Cleaning, repair, landscaping' },
  pets: { icon: 'ri-bear-smile-line', blurb: 'Veterinary, grooming, care' },
  arts_music: { icon: 'ri-music-2-line', blurb: 'Performers, galleries, makers' },
  other: { icon: 'ri-more-2-line', blurb: 'Not listed here' }
}

export type PersonalityPreview = {
  icon: string
  blurb: string

  /** Drives the miniature site thumbnail on the card. */
  headingFamily: string
  radius: number
  weight: number
  letterSpacing: number
  uppercase: boolean
}

export const PERSONALITY_META: Record<(typeof AI_STYLE_PERSONALITIES)[number], PersonalityPreview> = {
  simple: {
    icon: 'ri-layout-line',
    blurb: 'Generous whitespace, nothing shouting',
    headingFamily: '"Inter", system-ui, sans-serif',
    radius: 8,
    weight: 600,
    letterSpacing: -0.01,
    uppercase: false
  },
  bold: {
    icon: 'ri-contrast-2-line',
    blurb: 'Huge type and unmissable contrast',
    headingFamily: '"Montserrat", system-ui, sans-serif',
    radius: 4,
    weight: 800,
    letterSpacing: -0.03,
    uppercase: true
  },
  elegant: {
    icon: 'ri-quill-pen-line',
    blurb: 'Serif headlines and restrained colour',
    headingFamily: '"Playfair Display", Georgia, serif',
    radius: 2,
    weight: 600,
    letterSpacing: 0.01,
    uppercase: false
  },
  playful: {
    icon: 'ri-emotion-happy-line',
    blurb: 'Round shapes and cheerful colour',
    headingFamily: '"Poppins", system-ui, sans-serif',
    radius: 24,
    weight: 700,
    letterSpacing: 0,
    uppercase: false
  },
  professional: {
    icon: 'ri-shield-check-line',
    blurb: 'Structured, credible, easy to scan',
    headingFamily: '"Inter", system-ui, sans-serif',
    radius: 6,
    weight: 700,
    letterSpacing: -0.02,
    uppercase: false
  },
  flashy: {
    icon: 'ri-flashlight-line',
    blurb: 'Gradients, glow, and movement',
    headingFamily: '"Sora", system-ui, sans-serif',
    radius: 16,
    weight: 700,
    letterSpacing: -0.03,
    uppercase: false
  },
  splashy: {
    icon: 'ri-sparkling-2-line',
    blurb: 'Neon borders, shimmer CTAs, dark aurora',
    headingFamily: '"Playfair Display", Georgia, serif',
    radius: 20,
    weight: 800,
    letterSpacing: -0.03,
    uppercase: false
  },
  minimal: {
    icon: 'ri-subtract-line',
    blurb: 'Almost nothing, perfectly placed',
    headingFamily: 'system-ui, -apple-system, sans-serif',
    radius: 0,
    weight: 500,
    letterSpacing: -0.01,
    uppercase: false
  },
  luxury: {
    icon: 'ri-vip-diamond-line',
    blurb: 'Slow, spacious, quietly expensive',
    headingFamily: '"Cormorant Garamond", Georgia, serif',
    radius: 0,
    weight: 600,
    letterSpacing: 0.06,
    uppercase: true
  },
  warm: {
    icon: 'ri-sun-line',
    blurb: 'Soft edges and human photography',
    headingFamily: '"Fraunces", Georgia, serif',
    radius: 18,
    weight: 700,
    letterSpacing: -0.01,
    uppercase: false
  },
  editorial: {
    icon: 'ri-newspaper-line',
    blurb: 'Magazine grid and long-form rhythm',
    headingFamily: '"Instrument Serif", Georgia, serif',
    radius: 0,
    weight: 400,
    letterSpacing: -0.01,
    uppercase: false
  },
  techy: {
    icon: 'ri-terminal-box-line',
    blurb: 'Precise grid, mono details, data-led',
    headingFamily: '"Space Grotesk", system-ui, sans-serif',
    radius: 6,
    weight: 700,
    letterSpacing: -0.03,
    uppercase: false
  },
  organic: {
    icon: 'ri-leaf-line',
    blurb: 'Natural texture and earthy calm',
    headingFamily: '"Manrope", system-ui, sans-serif',
    radius: 28,
    weight: 600,
    letterSpacing: -0.01,
    uppercase: false
  }
}

export const MOTION_META: Record<'none' | 'subtle' | 'moderate' | 'energetic', OptionMeta> = {
  none: { icon: 'ri-pause-circle-line', blurb: 'Everything sits still' },
  subtle: { icon: 'ri-drop-line', blurb: 'Gentle fades and drifting shapes' },
  moderate: { icon: 'ri-wind-line', blurb: 'Aurora backgrounds and rise-in sections' },
  energetic: { icon: 'ri-flashlight-fill', blurb: 'Particles, shimmer, and constellations' }
}

export const BRAND_VOICE_META: Record<(typeof AI_BRAND_VOICES)[number], OptionMeta> = {
  ai_pick: { icon: 'ri-sparkling-line', blurb: 'Match the tone to the industry' },
  friendly: { icon: 'ri-chat-smile-2-line', blurb: '"We would love to help you out."' },
  confident: { icon: 'ri-flag-2-line', blurb: '"We build the best in the business."' },
  expert: { icon: 'ri-award-line', blurb: '"Twenty years of specialist practice."' },
  luxurious: { icon: 'ri-vip-crown-line', blurb: '"An experience considered in every detail."' },
  playful: { icon: 'ri-emotion-laugh-line', blurb: '"Coffee so good it is basically rude."' },
  inspirational: { icon: 'ri-fire-line', blurb: '"Start the thing you keep postponing."' },
  straightforward: { icon: 'ri-file-text-line', blurb: '"Fixed prices. Same-day callout."' }
}

export const CORNER_META: Record<(typeof AI_CORNER_STYLES)[number], OptionMeta> = {
  ai_pick: { icon: 'ri-sparkling-line', blurb: 'Match the personality' },
  sharp: { icon: 'ri-square-line', blurb: 'Square edges, architectural' },
  soft: { icon: 'ri-checkbox-blank-line', blurb: 'Lightly rounded, modern default' },
  round: { icon: 'ri-circle-line', blurb: 'Full pills, friendly and soft' }
}

export const DENSITY_META: Record<(typeof AI_LAYOUT_DENSITIES)[number], OptionMeta> = {
  ai_pick: { icon: 'ri-sparkling-line', blurb: 'Match the personality' },
  compact: { icon: 'ri-align-top', blurb: 'Tight sections, more above the fold' },
  balanced: { icon: 'ri-align-vertically', blurb: 'Comfortable rhythm throughout' },
  airy: { icon: 'ri-align-bottom', blurb: 'Big breathing room, gallery feel' }
}
