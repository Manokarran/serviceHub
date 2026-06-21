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
  fieldShape: 'pill',
  fieldBorderWidth: 1,
  fieldBorderColor: '#e2e8f0',
  fieldBackground: '#ffffff',
  labelFontSource: 'body'
}

const DEFAULT_MISC: SiteStyles['misc'] = {
  animation: 'fade',
  spacingScale: 'default',
  canvasCornerRadius: 0,
  imageCornerRadius: 0,
  imageHoverEffect: 'none',
  imageAspectRatio: 'auto'
}

export const DEFAULT_SITE_STYLES: SiteStyles = {
  themeId: 'professional',
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
    swatch2: '#f8fafc',
    swatch3: '#94a3b8',
    swatch4: '#334155',
    swatch5: '#0f172a',
    accent: '#0f172a',
    background: '#ffffff',
    text: '#0f172a'
  },
  buttons: DEFAULT_BUTTONS,
  forms: DEFAULT_FORMS,
  misc: DEFAULT_MISC
}

function createPreset(
  id: string,
  name: string,
  description: string,
  overrides: Partial<Omit<SiteStyles, 'themeId'>> & Pick<SiteStyles, 'fonts' | 'colors'>
): SiteThemePreset {
  return {
    id,
    name,
    description,
    styles: {
      themeId: id,
      fonts: overrides.fonts,
      colors: overrides.colors,
      buttons: overrides.buttons ?? DEFAULT_BUTTONS,
      forms: overrides.forms ?? DEFAULT_FORMS,
      misc: overrides.misc ?? DEFAULT_MISC
    }
  }
}

/** Squarespace-style theme presets — fonts, colors, and buttons applied together */
export const SITE_THEME_PRESETS: SiteThemePreset[] = [
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
  { label: 'Inter', value: '"Inter", system-ui, sans-serif', googleFont: 'Inter' },
  { label: 'Montserrat', value: '"Montserrat", system-ui, sans-serif', googleFont: 'Montserrat' },
  { label: 'Open Sans', value: '"Open Sans", system-ui, sans-serif', googleFont: 'Open+Sans' },
  { label: 'Poppins', value: '"Poppins", system-ui, sans-serif', googleFont: 'Poppins' },
  { label: 'Nunito', value: '"Nunito", system-ui, sans-serif', googleFont: 'Nunito' },
  { label: 'Playfair Display', value: '"Playfair Display", Georgia, serif', googleFont: 'Playfair+Display' },
  { label: 'Lora', value: '"Lora", Georgia, serif', googleFont: 'Lora' },
  { label: 'Merriweather', value: '"Merriweather", Georgia, serif', googleFont: 'Merriweather' },
  { label: 'Source Sans 3', value: '"Source Sans 3", system-ui, sans-serif', googleFont: 'Source+Sans+3' },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif', googleFont: null }
]
