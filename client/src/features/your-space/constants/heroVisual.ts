import type { HeroSplitVisualAnimation } from '../types'

type HeroVisualAnimationOption = {
  value: HeroSplitVisualAnimation
  label: string
  icon: string
  group: 'classic' | 'modern'
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
  { value: 'particles-rise', label: 'Rising particles', icon: 'ri-sparkling-line', group: 'modern' }
]

export type HeroVisualGradientPreset = {
  id: string
  label: string
  start: string
  end: string
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
  { id: 'crimson', label: 'Crimson', start: '#be123c', end: '#fb7185' }
]

export const DEFAULT_HERO_SPLIT_VISUAL_ANIMATION: HeroSplitVisualAnimation = 'aurora'

export const ANIMATED_HERO_BACKGROUND_TYPES: HeroSplitVisualAnimation[] = ['gradient-shift', 'aurora', 'mesh-gradient', 'shimmer']
