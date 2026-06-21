import type { SiteFonts, SiteForms, SiteStyles } from '../types/siteStyles'
import { DEFAULT_BUTTONS, DEFAULT_FORMS } from './siteStylePresets'

export interface FontPackPreset {
  id: string
  name: string
  fonts: SiteFonts
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
    forms: DEFAULT_FORMS
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
  return (
    a.headingFamily === b.headingFamily &&
    a.bodyFamily === b.bodyFamily &&
    a.headingWeight === b.headingWeight &&
    a.bodyWeight === b.bodyWeight &&
    a.headingScale === b.headingScale &&
    a.bodySize === b.bodySize &&
    a.headingLetterSpacing === b.headingLetterSpacing
  )
}

export function buttonsMatch(a: SiteStyles['buttons'], b: SiteStyles['buttons']): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function formsMatch(a: SiteForms, b: SiteForms): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function findMatchingFontPackId(fonts: SiteFonts): string | null {
  return FONT_PACK_PRESETS.find(pack => fontsMatch(fonts, pack.fonts))?.id ?? null
}

export function findMatchingButtonPackId(buttons: SiteStyles['buttons']): string | null {
  return BUTTON_PACK_PRESETS.find(pack => buttonsMatch(buttons, pack.buttons))?.id ?? null
}

export function findMatchingFormPackId(forms: SiteForms): string | null {
  return FORM_PACK_PRESETS.find(pack => formsMatch(forms, pack.forms))?.id ?? null
}
