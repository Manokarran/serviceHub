import type { SiteFonts, SiteForms, SiteStyles } from '../types/siteStyles'
import { DEFAULT_BUTTONS, DEFAULT_FORMS, DEFAULT_SITE_STYLES } from './siteStylePresets'

type FontPackFonts = Partial<SiteFonts> &
  Pick<
    SiteFonts,
    | 'headingFamily'
    | 'bodyFamily'
    | 'headingWeight'
    | 'bodyWeight'
    | 'headingScale'
    | 'bodySize'
    | 'headingLetterSpacing'
  >

export interface FontPackPreset {
  id: string
  name: string
  fonts: FontPackFonts
}

export interface ButtonPackPreset {
  id: string
  name: string
  buttons: SiteStyles['buttons']
}

export interface FormPackPreset {
  id: string
  name: string
  forms: SiteForms
}

export const FONT_PACK_PRESETS: FontPackPreset[] = [
  {
    id: 'montserrat-open',
    name: 'Montserrat & Open Sans',
    fonts: {
      headingFamily: '"Montserrat", system-ui, sans-serif',
      bodyFamily: '"Open Sans", system-ui, sans-serif',
      headingWeight: 800,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 16,
      headingLetterSpacing: -0.03
    }
  },
  {
    id: 'playfair-lora',
    name: 'Playfair & Lora',
    fonts: {
      headingFamily: '"Playfair Display", Georgia, serif',
      bodyFamily: '"Lora", Georgia, serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.1,
      bodySize: 16,
      headingLetterSpacing: 0.01
    }
  },
  {
    id: 'inter',
    name: 'Inter',
    fonts: {
      headingFamily: '"Inter", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.02
    }
  },
  {
    id: 'merriweather-source',
    name: 'Merriweather & Source Sans',
    fonts: {
      headingFamily: '"Merriweather", Georgia, serif',
      bodyFamily: '"Source Sans 3", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: 0
    }
  },
  {
    id: 'poppins-nunito',
    name: 'Poppins & Nunito',
    fonts: {
      headingFamily: '"Poppins", system-ui, sans-serif',
      bodyFamily: '"Nunito", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 17,
      headingLetterSpacing: 0
    }
  },
  {
    id: 'system',
    name: 'System UI',
    fonts: {
      headingFamily: 'system-ui, -apple-system, sans-serif',
      bodyFamily: 'system-ui, -apple-system, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 0.95,
      bodySize: 15,
      headingLetterSpacing: -0.01
    }
  },
  {
    id: 'montserrat-light',
    name: 'Montserrat Light',
    fonts: {
      headingFamily: '"Montserrat", system-ui, sans-serif',
      bodyFamily: '"Open Sans", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.01
    }
  },
  {
    id: 'playfair-minimal',
    name: 'Playfair Minimal',
    fonts: {
      headingFamily: '"Playfair Display", Georgia, serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 15,
      headingLetterSpacing: 0
    }
  },
  {
    id: 'jakarta-inter',
    name: 'Plus Jakarta & Inter',
    fonts: {
      headingFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 16,
      headingLetterSpacing: -0.025
    }
  },
  {
    id: 'dm-unified',
    name: 'DM Sans',
    fonts: {
      headingFamily: '"DM Sans", system-ui, sans-serif',
      bodyFamily: '"DM Sans", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 16,
      headingLetterSpacing: -0.02
    }
  },
  {
    id: 'space-inter',
    name: 'Space Grotesk & Inter',
    fonts: {
      headingFamily: '"Space Grotesk", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.08,
      bodySize: 16,
      headingLetterSpacing: -0.03
    }
  },
  {
    id: 'instrument-dm',
    name: 'Instrument Serif & DM Sans',
    fonts: {
      headingFamily: '"Instrument Serif", Georgia, serif',
      bodyFamily: '"DM Sans", system-ui, sans-serif',
      headingWeight: 400,
      bodyWeight: 400,
      headingScale: 1.15,
      bodySize: 16,
      headingLetterSpacing: -0.01
    }
  },
  {
    id: 'cormorant-work',
    name: 'Cormorant & Work Sans',
    fonts: {
      headingFamily: '"Cormorant Garamond", Georgia, serif',
      bodyFamily: '"Work Sans", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.12,
      bodySize: 16,
      headingLetterSpacing: 0.02
    }
  },
  {
    id: 'crimson-source',
    name: 'Crimson Pro & Source Sans',
    fonts: {
      headingFamily: '"Crimson Pro", Georgia, serif',
      bodyFamily: '"Source Sans 3", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.08,
      bodySize: 17,
      headingLetterSpacing: 0
    }
  },
  {
    id: 'plex-pair',
    name: 'IBM Plex Serif & Sans',
    fonts: {
      headingFamily: '"IBM Plex Serif", Georgia, serif',
      bodyFamily: '"IBM Plex Sans", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.02,
      bodySize: 16,
      headingLetterSpacing: 0
    }
  },
  {
    id: 'fraunces-work',
    name: 'Fraunces & Work Sans',
    fonts: {
      headingFamily: '"Fraunces", Georgia, serif',
      bodyFamily: '"Work Sans", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.1,
      bodySize: 16,
      headingLetterSpacing: -0.01
    }
  },
  {
    id: 'outfit-inter',
    name: 'Outfit & Inter',
    fonts: {
      headingFamily: '"Outfit", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 16,
      headingLetterSpacing: -0.02
    }
  },
  {
    id: 'sora-inter',
    name: 'Sora & Inter',
    fonts: {
      headingFamily: '"Sora", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1.04,
      bodySize: 16,
      headingLetterSpacing: -0.025
    }
  },
  {
    id: 'manrope-work',
    name: 'Manrope & Work Sans',
    fonts: {
      headingFamily: '"Manrope", system-ui, sans-serif',
      bodyFamily: '"Work Sans", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.03,
      bodySize: 16,
      headingLetterSpacing: -0.03
    }
  },
  {
    id: 'libre-source',
    name: 'Libre Baskerville & Source Sans',
    fonts: {
      headingFamily: '"Libre Baskerville", Georgia, serif',
      bodyFamily: '"Source Sans 3", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 17,
      headingLetterSpacing: 0
    }
  },
  {
    id: 'syne-inter',
    name: 'Syne & Inter',
    fonts: {
      headingFamily: '"Syne", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.1,
      bodySize: 16,
      headingLetterSpacing: -0.02
    }
  },
  {
    id: 'lexend-inter',
    name: 'Lexend & Inter',
    fonts: {
      headingFamily: '"Lexend", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      headingScale: 1,
      bodySize: 17,
      headingLetterSpacing: -0.015
    }
  },
  {
    id: 'raleway-roboto',
    name: 'Raleway & Roboto',
    fonts: {
      headingFamily: '"Raleway", system-ui, sans-serif',
      bodyFamily: '"Roboto", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.05,
      bodySize: 16,
      headingLetterSpacing: 0.02
    }
  },
  {
    id: 'albert-inter',
    name: 'Albert Sans & Inter',
    fonts: {
      headingFamily: '"Albert Sans", system-ui, sans-serif',
      bodyFamily: '"Inter", system-ui, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      headingScale: 1.04,
      bodySize: 16,
      headingLetterSpacing: -0.02
    }
  }
]

export const BUTTON_PACK_PRESETS: ButtonPackPreset[] = [
  {
    id: 'pill-solid',
    name: 'Pill — Solid',
    buttons: DEFAULT_BUTTONS
  },
  {
    id: 'rounded-solid',
    name: 'Rounded — Solid',
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'rounded' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'rounded' },
      tertiary: { ...DEFAULT_BUTTONS.tertiary, shape: 'rounded' }
    }
  },
  {
    id: 'square-solid',
    name: 'Square — Solid',
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'square' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'square' },
      tertiary: { ...DEFAULT_BUTTONS.tertiary, shape: 'square' }
    }
  },
  {
    id: 'pill-outline',
    name: 'Pill — Outline',
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, style: 'outline', borderWidth: 1 },
      secondary: { ...DEFAULT_BUTTONS.secondary, style: 'outline' },
      tertiary: { ...DEFAULT_BUTTONS.tertiary, style: 'ghost' }
    }
  },
  {
    id: 'rounded-mixed',
    name: 'Rounded — Mixed',
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'rounded' },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'rounded', style: 'outline' },
      tertiary: { ...DEFAULT_BUTTONS.tertiary, shape: 'rounded', style: 'ghost' }
    }
  },
  {
    id: 'square-outline',
    name: 'Square — Outline',
    buttons: {
      ...DEFAULT_BUTTONS,
      primary: { ...DEFAULT_BUTTONS.primary, shape: 'square', style: 'outline', borderWidth: 2 },
      secondary: { ...DEFAULT_BUTTONS.secondary, shape: 'square', style: 'outline', borderWidth: 1 },
      tertiary: { ...DEFAULT_BUTTONS.tertiary, shape: 'square', style: 'ghost' }
    }
  }
]

export const FORM_PACK_PRESETS: FormPackPreset[] = [
  {
    id: 'pill-light',
    name: 'Pill — Light border',
    forms: { ...DEFAULT_FORMS, fieldShape: 'pill' }
  },
  {
    id: 'rounded-subtle',
    name: 'Rounded — Subtle',
    forms: {
      ...DEFAULT_FORMS,
      fieldShape: 'rounded',
      fieldBorderWidth: 1,
      fieldBorderColor: '#e5e7eb'
    }
  },
  {
    id: 'square-minimal',
    name: 'Square — Minimal',
    forms: {
      ...DEFAULT_FORMS,
      fieldShape: 'square',
      fieldBorderWidth: 1,
      fieldBorderColor: '#d1d5db',
      fieldBackground: '#fafafa'
    }
  },
  {
    id: 'pill-bold',
    name: 'Pill — Bold border',
    forms: {
      ...DEFAULT_FORMS,
      fieldShape: 'pill',
      fieldBorderWidth: 2,
      fieldBorderColor: '#0f172a'
    }
  },
  {
    id: 'rounded-filled',
    name: 'Rounded — Filled',
    forms: {
      ...DEFAULT_FORMS,
      fieldShape: 'rounded',
      fieldBorderWidth: 0,
      fieldBackground: '#f1f5f9',
      fieldBorderColor: 'transparent'
    }
  },
  {
    id: 'square-classic',
    name: 'Square — Classic',
    forms: {
      ...DEFAULT_FORMS,
      fieldShape: 'square',
      fieldBorderWidth: 2,
      fieldBorderColor: '#94a3b8',
      fieldBackground: '#ffffff'
    }
  }
]

export function fontsMatch(a: SiteFonts, b: SiteFonts): boolean {
  const left = { ...DEFAULT_SITE_STYLES.fonts, ...a }
  const right = { ...DEFAULT_SITE_STYLES.fonts, ...b }

  return (
    left.headingFamily === right.headingFamily &&
    left.bodyFamily === right.bodyFamily &&
    left.headingWeight === right.headingWeight &&
    left.bodyWeight === right.bodyWeight &&
    left.headingSize === right.headingSize &&
    left.headingScale === right.headingScale &&
    left.bodySize === right.bodySize &&
    left.headingLetterSpacing === right.headingLetterSpacing &&
    left.buttonSize === right.buttonSize &&
    left.navSize === right.navSize &&
    left.labelSize === right.labelSize &&
    left.logoSize === right.logoSize
  )
}

export function buttonsMatch(a: SiteStyles['buttons'], b: SiteStyles['buttons']): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function formsMatch(a: SiteForms, b: SiteForms): boolean {
  const left = { ...DEFAULT_FORMS, ...a }
  const right = { ...DEFAULT_FORMS, ...b }

  return JSON.stringify(left) === JSON.stringify(right)
}

export function findMatchingFontPackId(fonts: SiteFonts): string | null {
  return FONT_PACK_PRESETS.find(pack => fontsMatch(fonts, { ...DEFAULT_SITE_STYLES.fonts, ...pack.fonts }))?.id ?? null
}

export function findMatchingButtonPackId(buttons: SiteStyles['buttons']): string | null {
  return BUTTON_PACK_PRESETS.find(pack => buttonsMatch(buttons, pack.buttons))?.id ?? null
}

export function findMatchingFormPackId(forms: SiteForms): string | null {
  return FORM_PACK_PRESETS.find(pack => formsMatch(forms, { ...DEFAULT_FORMS, ...pack.forms }))?.id ?? null
}
