import type { HeroSplitVisualAnimation } from '../types'

export type ButtonShape = 'square' | 'rounded' | 'pill'
export type ButtonStyle = 'solid' | 'outline' | 'ghost'
export type FontSource = 'heading' | 'body'
export type SiteAnimation = 'none' | 'fade' | 'slide-up' | 'scale'
export type SpacingScale = 'compact' | 'default' | 'spacious'
export type ImageHoverEffect = 'none' | 'zoom' | 'fade' | 'lift' | 'blur' | 'grayscale'
export type ImageAspectRatio = 'auto' | '16/9' | '4/3' | '1/1'

export type SiteStylesView =
  | 'home'
  | 'themes'
  | 'fonts'
  | 'fonts-customize'
  | 'colors'
  | 'buttons'
  | 'buttons-customize'
  | 'forms'
  | 'forms-customize'
  | 'misc'
  | 'misc-animations'
  | 'misc-page-background'
  | 'misc-spacing'
  | 'misc-canvas'
  | 'misc-image-blocks'

export interface ButtonStyleConfig {
  shape: ButtonShape
  style: ButtonStyle
  fontSource: FontSource
  borderWidth: number
  paddingX: number
  paddingY: number
}

export interface SiteFonts {
  headingFamily: string
  bodyFamily: string
  headingWeight: number
  bodyWeight: number
  /** Base px size for level-1 headings before scale multiplier. */
  headingSize: number
  headingScale: number
  bodySize: number
  headingLetterSpacing: number
  /** Buttons site-wide. */
  buttonSize: number
  /** Header and footer navigation links. */
  navSize: number
  /** Captions, copyright, and fine print. */
  labelSize: number
  /** Brand name in header and footer. */
  logoSize: number
}

export interface SiteColors {
  swatch1: string
  swatch2: string
  swatch3: string
  swatch4: string
  swatch5: string
  accent: string
  background: string
  text: string
}

export interface SiteForms {
  fieldShape: ButtonShape
  fieldBorderWidth: number
  fieldBorderColor: string
  fieldBackground: string
  labelFontSource: FontSource
  fieldFontSize: number
}

export interface SiteMisc {
  animation: SiteAnimation
  spacingScale: SpacingScale
  /** Builder page preview frame corner radius (px). 0 = square. */
  canvasCornerRadius: number
  imageCornerRadius: number
  imageHoverEffect: ImageHoverEffect
  imageAspectRatio: ImageAspectRatio
  /** Full-page animated background visible behind transparent blocks */
  pageSplitVisualAnimation?: HeroSplitVisualAnimation
  pageSplitVisualColorStart?: string
  pageSplitVisualColorEnd?: string
}

export interface SiteStyles {
  themeId: string
  fonts: SiteFonts
  colors: SiteColors
  buttons: {
    primary: ButtonStyleConfig
    secondary: ButtonStyleConfig
    tertiary: ButtonStyleConfig
  }
  forms: SiteForms
  misc: SiteMisc
}

export interface SiteThemePreset {
  id: string
  name: string
  description: string
  styles: SiteStyles
}
