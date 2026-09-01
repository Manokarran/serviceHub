import type { SiteStyles, SiteThemePreset } from '../types/siteStyles'

export const DEFAULT_BUTTONS: SiteStyles['buttons'] = {
  primary: {
    shape: 'pill',
    style: 'solid',
    fontSource: 'body',
    borderWidth: 0,
    paddingX: 28,
    paddingY: 12
  },
  secondary: {
    shape: 'pill',
    style: 'outline',
    fontSource: 'body',
    borderWidth: 1,
    paddingX: 28,
    paddingY: 12
  },
  tertiary: {
    shape: 'rounded',
    style: 'ghost',
    fontSource: 'body',
    borderWidth: 0,
    paddingX: 16,
    paddingY: 8
  }
}

export const DEFAULT_FORMS: SiteStyles['forms'] = {
  fieldShape: 'rounded',
  fieldBorderWidth: 1,
  fieldBorderColor: '#e2e8f0',
  fieldBackground: '#ffffff',
  labelFontSource: 'body',
  fieldFontSize: 16
}

const DEFAULT_MISC: SiteStyles['misc'] = {
  animation: 'fade',
  spacingScale: 'default',
  canvasCornerRadius: 0,
  imageCornerRadius: 0,
  imageHoverEffect: 'zoom',
  imageAspectRatio: 'auto',
  pageSplitVisualAnimation: 'static',
  pageSplitVisualColorStart: '',
  pageSplitVisualColorEnd: ''
}

export const DEFAULT_SITE_STYLES: SiteStyles = {
  themeId: 'plain',
  fonts: {
    headingFamily: '"Inter", system-ui, sans-serif',
    bodyFamily: '"Inter", system-ui, sans-serif',
    headingWeight: 600,
    bodyWeight: 400,
    headingSize: 32,
    headingScale: 1,
    bodySize: 16,
    headingLetterSpacing: -0.01,
    buttonSize: 15,
    navSize: 14,
    labelSize: 13,
    logoSize: 20
  },
  colors: {
    swatch1: '#ffffff',
    swatch2: '#ffffff',
    swatch3: '#d4d4d8',
    swatch4: '#52525b',
    swatch5: '#18181b',
    accent: '#18181b',
    background: '#ffffff',
    text: '#18181b'
  },
  buttons: DEFAULT_BUTTONS,
  forms: DEFAULT_FORMS,
  misc: DEFAULT_MISC
}

function createPreset(
  id: string,
  name: string,
  description: string,
  overrides: {
    fonts?: Partial<SiteStyles['fonts']>
    colors: SiteStyles['colors']
    buttons?: SiteStyles['buttons']
    forms?: SiteStyles['forms']
    misc?: SiteStyles['misc']
  }
): SiteThemePreset {
  return {
    id,
    name,
    description,
    styles: {
      themeId: id,
      fonts: { ...DEFAULT_SITE_STYLES.fonts, ...overrides.fonts },
      colors: overrides.colors,
      buttons: overrides.buttons ?? DEFAULT_BUTTONS,
      forms: { ...DEFAULT_FORMS, ...overrides.forms },
      misc: overrides.misc ?? DEFAULT_MISC
    }
  }
}

/** Squarespace-style theme presets — fonts, colors, and buttons applied together */
export const SITE_THEME_PRESETS: SiteThemePreset[] = [
  createPreset('plain', 'Plain', 'Clean white canvas — the default starting point', {
    fonts: {
      headingFamily: '"Inter", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.01
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#ffffff',
      swatch3: '#d4d4d8',
      swatch4: '#52525b',
      swatch5: '#18181b',
      accent: '#18181b',
      background: '#ffffff',
      text: '#18181b'
    },
    misc: {
      ...DEFAULT_MISC,
      pageSplitVisualAnimation: 'static'
    }
  }),
  createPreset('professional', 'Professional', 'Clean sans-serif with neutral palette', {
    fonts: {
      headingFamily: '"Inter", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.02
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#f1f5f9',
      swatch3: '#94a3b8',
      swatch4: '#475569',
      swatch5: '#0f172a',
      accent: '#0f172a',
      background: '#ffffff',
      text: '#0f172a'
    }
  }),
  createPreset('corporate', 'Corporate', 'Trustworthy navy palette for business and finance', {
    fonts: {
      headingFamily: '"IBM Plex Sans", system-ui, sans-serif',
      bodyFamily: '"IBM Plex Sans", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.01
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#f0f4f8',
      swatch3: '#94a3b8',
      swatch4: '#334155',
      swatch5: '#0f172a',
      accent: '#1e40af',
      background: '#ffffff',
      text: '#0f172a'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'rounded' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'rounded' }
    }
  }),
  createPreset('modern', 'Modern', 'SaaS-style indigo accents with crisp typography', {
    fonts: {
      headingFamily: '"DM Sans", system-ui, sans-serif',
      bodyFamily: '"DM Sans", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.02
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#f5f3ff',
      swatch3: '#a5b4fc',
      swatch4: '#4338ca',
      swatch5: '#1e1b4b',
      accent: '#6366f1',
      background: '#ffffff',
      text: '#1e1b4b'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'rounded' }
    }
  }),
  createPreset('startup', 'Startup', 'Energetic palette for product launches and tech brands', {
    fonts: {
      headingFamily: '"Work Sans", system-ui, sans-serif',
      bodyFamily: '"Work Sans", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.02,
      bodySize: 16,
      headingLetterSpacing: -0.02
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#eff6ff',
      swatch3: '#60a5fa',
      swatch4: '#1d4ed8',
      swatch5: '#0c1a3a',
      accent: '#2563eb',
      background: '#ffffff',
      text: '#0c1a3a'
    }
  }),
  createPreset('wellness', 'Wellness', 'Calm sage greens for health, spa, and lifestyle brands', {
    fonts: {
      headingFamily: '"Raleway", system-ui, sans-serif',
      bodyFamily: '"Raleway", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: 0
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#f0fdf4',
      swatch3: '#86efac',
      swatch4: '#15803d',
      swatch5: '#14532d',
      accent: '#16a34a',
      background: '#ffffff',
      text: '#14532d'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'pill' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'pill' }
    }
  }),
  createPreset('creative', 'Creative', 'Bold violet tones for agencies and portfolios', {
    fonts: {
      headingFamily: '"Outfit", system-ui, sans-serif',
      bodyFamily: '"Outfit", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 16,
      headingLetterSpacing: -0.02
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#faf5ff',
      swatch3: '#c4b5fd',
      swatch4: '#6d28d9',
      swatch5: '#2e1065',
      accent: '#7c3aed',
      background: '#ffffff',
      text: '#2e1065'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'pill' }
    }
  }),
  createPreset('luxury', 'Luxury', 'Refined serif with charcoal and gold accents', {
    fonts: {
      headingFamily: '"Cormorant Garamond", Georgia, serif',
      bodyFamily: '"Raleway", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.15,
      bodySize: 16,
      headingLetterSpacing: 0.02
    },
    colors: {
      swatch1: '#fafafa',
      swatch2: '#f5f5f5',
      swatch3: '#ca8a04',
      swatch4: '#525252',
      swatch5: '#171717',
      accent: '#a16207',
      background: '#fafafa',
      text: '#171717'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'square', style: 'outline', borderWidth: 1 },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'square' }
    }
  }),
  createPreset('editorial', 'Editorial', 'Magazine-style serif headings with readable body copy', {
    fonts: {
      headingFamily: '"Crimson Pro", Georgia, serif',
      bodyFamily: '"Source Sans 3", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.1,
      bodySize: 16,
      headingLetterSpacing: 0
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#fafafa',
      swatch3: '#737373',
      swatch4: '#404040',
      swatch5: '#171717',
      accent: '#171717',
      background: '#ffffff',
      text: '#171717'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'square' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'square', style: 'outline' }
    }
  }),
  createPreset('bold', 'Bold', 'Strong headings with high-contrast accents', {
    fonts: {
      headingFamily: '"Montserrat", system-ui, sans-serif',
      bodyFamily: '"Open Sans", system-ui, sans-serif',
      headingWeight: 800,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 16,
      headingLetterSpacing: -0.03
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#fef2f2',
      swatch3: '#f87171',
      swatch4: '#991b1b',
      swatch5: '#450a0a',
      accent: '#dc2626',
      background: '#ffffff',
      text: '#450a0a'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'rounded' }
    }
  }),
  createPreset('playful', 'Playful', 'Rounded shapes with friendly typography', {
    fonts: {
      headingFamily: '"Poppins", system-ui, sans-serif',
      bodyFamily: '"Nunito", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 17,
      headingLetterSpacing: 0
    },
    colors: {
      swatch1: '#fffbeb',
      swatch2: '#fef3c7',
      swatch3: '#fbbf24',
      swatch4: '#b45309',
      swatch5: '#451a03',
      accent: '#d97706',
      background: '#fffbeb',
      text: '#451a03'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'pill' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'pill' }
    }
  }),
  createPreset('elegant', 'Elegant', 'Serif headings with refined contrast', {
    fonts: {
      headingFamily: '"Playfair Display", Georgia, serif',
      bodyFamily: '"Lora", Georgia, serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.1,
      bodySize: 16,
      headingLetterSpacing: 0.01
    },
    colors: {
      swatch1: '#fafaf9',
      swatch2: '#f5f5f4',
      swatch3: '#a8a29e',
      swatch4: '#57534e',
      swatch5: '#1c1917',
      accent: '#44403c',
      background: '#fafaf9',
      text: '#1c1917'
    }
  }),
  createPreset('minimal', 'Minimal', 'Lightweight system fonts, monochrome', {
    fonts: {
      headingFamily: 'system-ui, -apple-system, sans-serif',
      bodyFamily: 'system-ui, -apple-system, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 0.95,
      bodySize: 15,
      headingLetterSpacing: -0.01
    },
    colors: {
      swatch1: '#ffffff',
      swatch2: '#fafafa',
      swatch3: '#a3a3a3',
      swatch4: '#525252',
      swatch5: '#171717',
      accent: '#171717',
      background: '#ffffff',
      text: '#171717'
    },
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'square' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'square' }
    }
  }),
  createPreset('classic', 'Classic', 'Traditional serif with warm tones', {
    fonts: {
      headingFamily: '"Merriweather", Georgia, serif',
      bodyFamily: '"Source Sans 3", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: 0
    },
    colors: {
      swatch1: '#fffdf7',
      swatch2: '#fef9ec',
      swatch3: '#d6b48a',
      swatch4: '#8b5e34',
      swatch5: '#3d2b1f',
      accent: '#8b5e34',
      background: '#fffdf7',
      text: '#3d2b1f'
    }
  })
]

export const FONT_FAMILY_OPTIONS = [
  { label: 'Albert Sans', value: '"Albert Sans", system-ui, sans-serif', googleFont: 'Albert+Sans' },
  { label: 'DM Sans', value: '"DM Sans", system-ui, sans-serif', googleFont: 'DM+Sans' },
  { label: 'Fraunces', value: '"Fraunces", Georgia, serif', googleFont: 'Fraunces' },
  { label: 'IBM Plex Sans', value: '"IBM Plex Sans", system-ui, sans-serif', googleFont: 'IBM+Plex+Sans' },
  { label: 'IBM Plex Serif', value: '"IBM Plex Serif", Georgia, serif', googleFont: 'IBM+Plex+Serif' },
  { label: 'Instrument Serif', value: '"Instrument Serif", Georgia, serif', googleFont: 'Instrument+Serif' },
  { label: 'Inter', value: '"Inter", system-ui, sans-serif', googleFont: 'Inter' },
  { label: 'Lato', value: '"Lato", system-ui, sans-serif', googleFont: 'Lato' },
  { label: 'Lexend', value: '"Lexend", system-ui, sans-serif', googleFont: 'Lexend' },
  { label: 'Libre Baskerville', value: '"Libre Baskerville", Georgia, serif', googleFont: 'Libre+Baskerville' },
  { label: 'Manrope', value: '"Manrope", system-ui, sans-serif', googleFont: 'Manrope' },
  { label: 'Montserrat', value: '"Montserrat", system-ui, sans-serif', googleFont: 'Montserrat' },
  { label: 'Nunito', value: '"Nunito", system-ui, sans-serif', googleFont: 'Nunito' },
  { label: 'Open Sans', value: '"Open Sans", system-ui, sans-serif', googleFont: 'Open+Sans' },
  { label: 'Outfit', value: '"Outfit", system-ui, sans-serif', googleFont: 'Outfit' },
  { label: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", system-ui, sans-serif', googleFont: 'Plus+Jakarta+Sans' },
  { label: 'Poppins', value: '"Poppins", system-ui, sans-serif', googleFont: 'Poppins' },
  { label: 'Raleway', value: '"Raleway", system-ui, sans-serif', googleFont: 'Raleway' },
  { label: 'Roboto', value: '"Roboto", system-ui, sans-serif', googleFont: 'Roboto' },
  { label: 'Sora', value: '"Sora", system-ui, sans-serif', googleFont: 'Sora' },
  { label: 'Source Sans 3', value: '"Source Sans 3", system-ui, sans-serif', googleFont: 'Source+Sans+3' },
  { label: 'Space Grotesk', value: '"Space Grotesk", system-ui, sans-serif', googleFont: 'Space+Grotesk' },
  { label: 'Syne', value: '"Syne", system-ui, sans-serif', googleFont: 'Syne' },
  { label: 'Work Sans', value: '"Work Sans", system-ui, sans-serif', googleFont: 'Work+Sans' },
  { label: 'Cormorant Garamond', value: '"Cormorant Garamond", Georgia, serif', googleFont: 'Cormorant+Garamond' },
  { label: 'Crimson Pro', value: '"Crimson Pro", Georgia, serif', googleFont: 'Crimson+Pro' },
  { label: 'Great Vibes', value: '"Great Vibes", cursive', googleFont: 'Great+Vibes' },
  { label: 'Lora', value: '"Lora", Georgia, serif', googleFont: 'Lora' },
  { label: 'Merriweather', value: '"Merriweather", Georgia, serif', googleFont: 'Merriweather' },
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif', googleFont: 'Playfair+Display' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif', googleFont: null }
]
