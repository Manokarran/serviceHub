import type { HeroButtonStyle, HeroLayout, HeroVerticalAlign } from '../types'

type HeroLayoutOption = {
  value: HeroLayout
  label: string
  icon: string
}

type HeroVerticalAlignOption = {
  value: HeroVerticalAlign
  label: string
  icon: string
}

export const HERO_LAYOUT_OPTIONS: HeroLayoutOption[] = [
  { value: 'centered', label: 'Centered', icon: 'ri-align-center' },
  { value: 'split-left', label: 'Split left', icon: 'ri-layout-left-line' },
  { value: 'split-right', label: 'Split right', icon: 'ri-layout-right-line' }
]

export const HERO_VERTICAL_ALIGN_OPTIONS: HeroVerticalAlignOption[] = [
  { value: 'center', label: 'Middle', icon: 'ri-align-vertically' },
  { value: 'bottom', label: 'Bottom', icon: 'ri-align-bottom' }
]

export const HERO_MEDIA_OVERLAY_OPTIONS = [
  { value: 'gradient' as const, label: 'Gradient', icon: 'ri-contrast-2-line' },
  { value: 'subtle' as const, label: 'Subtle', icon: 'ri-contrast-line' },
  { value: 'strong' as const, label: 'Strong', icon: 'ri-contrast-fill' },
  { value: 'none' as const, label: 'None', icon: 'ri-forbid-line' }
]

export const HERO_BUTTON_STYLE_OPTIONS: { value: HeroButtonStyle; label: string; icon: string }[] = [
  { value: 'theme', label: 'Theme', icon: 'ri-palette-line' },
  { value: 'contrast', label: 'Contrast', icon: 'ri-contrast-2-line' }
]

export const HERO_CONTENT_MAX_WIDTH_OPTIONS = [
  { value: 'sm' as const, label: 'Narrow' },
  { value: 'md' as const, label: 'Medium' },
  { value: 'lg' as const, label: 'Wide' },
  { value: 'full' as const, label: 'Full' }
]
