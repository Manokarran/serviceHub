import type { HeroSplitVisualAnimation } from '../types'
import type { SiteColors } from '../types/siteStyles'

type HeroVisualAnimationOption = {
  value: HeroSplitVisualAnimation
  label: string
  icon: string
  group: 'classic' | 'modern' | 'signature'
}

export const HERO_SPLIT_VISUAL_ANIMATION_OPTIONS: HeroVisualAnimationOption[] = [
  { value: 'static', label: 'Static', icon: 'ri-square-line', group: 'classic' },
  { value: 'floating-circles', label: 'Floating circles', icon: 'ri-bubble-chart-line', group: 'classic' },
  { value: 'orbiting-dots', label: 'Orbiting dots', icon: 'ri-loader-4-line', group: 'classic' },
  { value: 'pulse-rings', label: 'Pulse rings', icon: 'ri-radar-line', group: 'classic' },
  { value: 'morphing-blobs', label: 'Morphing blobs', icon: 'ri-drop-line', group: 'classic' },
  { value: 'gradient-shift', label: 'Shifting gradient', icon: 'ri-contrast-2-line', group: 'classic' },
  { value: 'aurora', label: 'Aurora', icon: 'ri-cloud-windy-line', group: 'modern' },
  { value: 'mesh-gradient', label: 'Mesh gradient', icon: 'ri-blur-off-line', group: 'modern' },
  { value: 'wave-lines', label: 'Wave lines', icon: 'ri-water-flash-line', group: 'modern' },
  { value: 'dot-grid', label: 'Dot grid', icon: 'ri-grid-line', group: 'modern' },
  { value: 'shimmer', label: 'Shimmer', icon: 'ri-shining-line', group: 'modern' },
  { value: 'constellation', label: 'Constellation', icon: 'ri-star-line', group: 'modern' },
  { value: 'geometric', label: 'Geometric', icon: 'ri-shape-line', group: 'modern' },
  { value: 'particles-rise', label: 'Rising particles', icon: 'ri-sparkling-line', group: 'modern' },
  { value: 'liquid-metal', label: 'Liquid metal', icon: 'ri-contrast-drop-2-line', group: 'signature' },
  { value: 'neon-pulse', label: 'Neon pulse', icon: 'ri-flashlight-line', group: 'signature' },
  { value: 'prism-beams', label: 'Prism beams', icon: 'ri-sun-line', group: 'signature' },
  { value: 'ripple-field', label: 'Ripple field', icon: 'ri-circle-line', group: 'signature' },
  { value: 'spotlight-sweep', label: 'Spotlight', icon: 'ri-focus-3-line', group: 'signature' },
  { value: 'ribbon-flow', label: 'Ribbon flow', icon: 'ri-brush-line', group: 'signature' },
  { value: 'plasma', label: 'Plasma', icon: 'ri-fire-line', group: 'signature' },
  { value: 'sparkle-rain', label: 'Sparkle rain', icon: 'ri-magic-line', group: 'signature' }
]

export type HeroVisualGradientPreset = {
  id: string
  label: string
  start: string
  end: string
  themeMatched?: boolean
}

export const HERO_VISUAL_GRADIENT_PRESETS: HeroVisualGradientPreset[] = [
  { id: 'violet', label: 'Violet', start: '#6366f1', end: '#8b5cf6' },
  { id: 'ocean', label: 'Ocean', start: '#0ea5e9', end: '#6366f1' },
  { id: 'sunset', label: 'Sunset', start: '#f97316', end: '#ec4899' },
  { id: 'forest', label: 'Forest', start: '#10b981', end: '#059669' },
  { id: 'midnight', label: 'Midnight', start: '#312e81', end: '#6366f1' },
  { id: 'rose', label: 'Rose', start: '#f43f5e', end: '#fb7185' },
  { id: 'amber', label: 'Amber', start: '#f59e0b', end: '#ef4444' },
  { id: 'cyan', label: 'Cyan', start: '#06b6d4', end: '#3b82f6' },
  { id: 'slate', label: 'Slate', start: '#334155', end: '#64748b' },
  { id: 'lavender', label: 'Lavender', start: '#a78bfa', end: '#c4b5fd' },
  { id: 'teal', label: 'Teal', start: '#14b8a6', end: '#0891b2' },
  { id: 'crimson', label: 'Crimson', start: '#be123c', end: '#fb7185' },
  { id: 'electric', label: 'Electric', start: '#22d3ee', end: '#a855f7' },
  { id: 'mango', label: 'Mango', start: '#fb923c', end: '#f43f5e' },
  { id: 'lime-pop', label: 'Lime pop', start: '#84cc16', end: '#14b8a6' },
  { id: 'candy', label: 'Candy', start: '#f472b6', end: '#818cf8' },
  { id: 'ember', label: 'Ember', start: '#ea580c', end: '#7c2d12' },
  { id: 'glacier', label: 'Glacier', start: '#67e8f9', end: '#2563eb' },
  { id: 'orchid', label: 'Orchid', start: '#c026d3', end: '#4f46e5' },
  { id: 'nova', label: 'Nova', start: '#fde047', end: '#f97316' }
]

function normalizeHexColor(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim() ?? ''

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed

    return `#${r}${r}${g}${g}${b}${b}`
  }

  return fallback
}

function mixHex(a: string, b: string, amount: number): string {
  const left = normalizeHexColor(a, '#6366f1')
  const right = normalizeHexColor(b, '#8b5cf6')
  const t = Math.min(1, Math.max(0, amount))
  const channel = (start: number, end: number) => Math.round(start + (end - start) * t)
  const parse = (hex: string, offset: number) => Number.parseInt(hex.slice(offset, offset + 2), 16)

  return `#${[
    channel(parse(left, 1), parse(right, 1)),
    channel(parse(left, 3), parse(right, 3)),
    channel(parse(left, 5), parse(right, 5))
  ]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')}`
}

/** Build gradient swatches that mirror the active site theme palette. */
export function buildThemeMatchedGradientPresets(colors: SiteColors): HeroVisualGradientPreset[] {
  const accent = normalizeHexColor(colors.accent, '#6366f1')
  const swatch1 = normalizeHexColor(colors.swatch1, accent)
  const swatch2 = normalizeHexColor(colors.swatch2, colors.swatch3 || accent)
  const swatch3 = normalizeHexColor(colors.swatch3, colors.swatch4 || accent)
  const swatch4 = normalizeHexColor(colors.swatch4, colors.swatch5 || accent)
  const swatch5 = normalizeHexColor(colors.swatch5, accent)
  const background = normalizeHexColor(colors.background, '#0f172a')
  const text = normalizeHexColor(colors.text, '#1e293b')

  return [
    { id: 'theme-accent', label: 'Theme accent', start: accent, end: mixHex(accent, swatch2, 0.55), themeMatched: true },
    { id: 'theme-brand', label: 'Theme brand', start: swatch1, end: swatch3, themeMatched: true },
    { id: 'theme-pulse', label: 'Theme pulse', start: swatch2, end: accent, themeMatched: true },
    { id: 'theme-depth', label: 'Theme depth', start: mixHex(background, accent, 0.35), end: accent, themeMatched: true },
    { id: 'theme-glow', label: 'Theme glow', start: accent, end: mixHex(accent, '#ffffff', 0.45), themeMatched: true },
    { id: 'theme-ink', label: 'Theme ink', start: mixHex(text, accent, 0.25), end: swatch4 || swatch5, themeMatched: true }
  ]
}

export const DEFAULT_HERO_SPLIT_VISUAL_ANIMATION: HeroSplitVisualAnimation = 'aurora'

/** Animations that shift the base gradient fill (not only overlay layers). */
export const ANIMATED_HERO_BACKGROUND_TYPES: HeroSplitVisualAnimation[] = [
  'gradient-shift',
  'aurora',
  'mesh-gradient',
  'shimmer',
  'liquid-metal',
  'neon-pulse',
  'plasma',
  'prism-beams',
  'spotlight-sweep'
]
