import type { SxProps, Theme } from '@mui/material/styles'

import type { HeroBlockProps, HeroRotatingWordStyle } from '../types'

export const HERO_ROTATE_TOKEN = '{rotate}'

export const DEFAULT_HERO_ROTATING_WORDS = ['salon', 'café', 'studio', 'clinic', 'agency', 'boutique'] as const

export const DEFAULT_HERO_ROTATING_INTERVAL_MS = 2400

export function normalizeHeroRotatingWords(words: unknown): string[] {
  if (!Array.isArray(words)) {
    return []
  }

  return words
    .map(word => (typeof word === 'string' ? word.trim() : ''))
    .filter(Boolean)
    .slice(0, 24)
}

export function resolveHeroRotatingIntervalMs(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_HERO_ROTATING_INTERVAL_MS
  }

  return Math.min(8000, Math.max(1200, Math.round(value)))
}

export function heroTitleHasRotateToken(title: string): boolean {
  return title.includes(HERO_ROTATE_TOKEN)
}

/** Insert `{rotate}` before the last word when enabling sliding words on a plain title. */
export function ensureHeroRotateToken(title: string): string {
  if (heroTitleHasRotateToken(title)) {
    return title
  }

  const trimmed = title.trim()

  if (!trimmed) {
    return `Build the website your ${HERO_ROTATE_TOKEN} deserves`
  }

  const parts = trimmed.split(/\s+/)

  if (parts.length >= 2) {
    return [...parts.slice(0, -1), HERO_ROTATE_TOKEN, parts[parts.length - 1]].join(' ')
  }

  return `${trimmed} ${HERO_ROTATE_TOKEN}`
}

export function isHeroRotatingTitleActive(
  props: Pick<HeroBlockProps, 'rotatingWordsEnabled' | 'rotatingWords' | 'title'>
): boolean {
  if (!props.rotatingWordsEnabled) {
    return false
  }

  const words = normalizeHeroRotatingWords(props.rotatingWords)

  return words.length > 0 && heroTitleHasRotateToken(props.title)
}

export function splitHeroTitleAroundRotate(title: string): { before: string; after: string } | null {
  const index = title.indexOf(HERO_ROTATE_TOKEN)

  if (index === -1) {
    return null
  }

  return {
    before: title.slice(0, index),
    after: title.slice(index + HERO_ROTATE_TOKEN.length)
  }
}

export const HERO_ROTATING_WORD_STYLES = ['title', 'accent', 'theme', 'soft', 'vivid'] as const

export const HERO_ROTATING_WORD_STYLE_OPTIONS: {
  id: HeroRotatingWordStyle
  label: string
  description: string
}[] = [
  { id: 'title', label: 'Title', description: 'Matches the rest of the headline.' },
  { id: 'accent', label: 'Accent', description: 'A flat brand color.' },
  { id: 'theme', label: 'Theme', description: 'A gradient drawn from your site colors.' },
  { id: 'soft', label: 'Soft', description: 'Accent fading into the headline.' },
  { id: 'vivid', label: 'Vivid', description: 'Bright cyan and pink.' }
]

export function resolveHeroRotatingWordStyle(value: unknown): HeroRotatingWordStyle {
  if (value === 'title' || value === 'accent' || value === 'theme' || value === 'soft' || value === 'vivid') {
    return value
  }

  return 'theme'
}

export type HeroRotatingWordColors = {
  accent: string
  text: string
}

export function getHeroRotatingWordHighlightSx(
  style: HeroRotatingWordStyle,
  colors: HeroRotatingWordColors
): SxProps<Theme> {
  const accent = colors.accent?.trim() || '#18181b'
  const text = colors.text?.trim() || '#18181b'
  const resolved = resolveHeroRotatingWordStyle(style)

  if (resolved === 'title') {
    return { color: 'inherit' }
  }

  if (resolved === 'accent') {
    return { color: accent }
  }

  return clipTextGradient(gradientForRotatingWord(resolved, accent, text))
}

function clipTextGradient(backgroundImage: string): SxProps<Theme> {
  return {
    backgroundImage,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent'
  }
}

function gradientForRotatingWord(style: 'theme' | 'soft' | 'vivid', accent: string, text: string): string {
  if (style === 'vivid') {
    return `linear-gradient(100deg, ${accent}, #22D3EE 45%, #F472B6 82%, ${accent})`
  }

  if (style === 'soft') {
    return `linear-gradient(105deg, ${accent} 0%, ${mixHex(accent, text, 0.62)} 100%)`
  }

  const hsl = hexToHsl(accent)

  if (!hsl || hsl.s < 0.12) {
    const light = hsl && hsl.l > 0.55

    return `linear-gradient(105deg, ${mixHex(accent, light ? '#111111' : '#ffffff', 0.42)} 0%, ${accent} 46%, ${mixHex(accent, light ? '#ffffff' : '#111111', 0.28)} 100%)`
  }

  const lift = hslToHex({ h: (hsl.h + 28) % 360, s: clamp01(hsl.s), l: clamp(hsl.l + 0.1, 0.32, 0.7) })
  const depth = hslToHex({ h: (hsl.h + 332) % 360, s: clamp01(hsl.s + 0.04), l: clamp(hsl.l - 0.08, 0.24, 0.62) })

  return `linear-gradient(105deg, ${depth} 0%, ${accent} 42%, ${lift} 100%)`
}

function mixHex(a: string, b: string, amount: number): string {
  const left = hexToRgb(a) ?? { r: 24, g: 24, b: 27 }
  const right = hexToRgb(b) ?? left
  const t = clamp01(amount)
  const channel = (start: number, end: number) => Math.round(start + (end - start) * t)

  return rgbToHex({
    r: channel(left.r, right.r),
    g: channel(left.g, right.g),
    b: channel(left.b, right.b)
  })
}

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const trimmed = color.trim()
  const match = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)

  if (!match) {
    return null
  }

  let hex = match[1]

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16)
  }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${[r, g, b].map(channel => clamp(channel, 0, 255).toString(16).padStart(2, '0')).join('')}`
}

function hexToHsl(color: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(color)

  if (!rgb) {
    return null
  }

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const delta = max - min

  if (delta === 0) {
    return { h: 0, s: 0, l }
  }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let h = 0

  if (max === r) {
    h = (g - b) / delta + (g < b ? 6 : 0)
  } else if (max === g) {
    h = (b - r) / delta + 2
  } else {
    h = (r - g) / delta + 4
  }

  return { h: h * 60, s, l }
}

function hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
  const hue = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (hue < 60) {
    r = c
    g = x
  } else if (hue < 120) {
    r = x
    g = c
  } else if (hue < 180) {
    g = c
    b = x
  } else if (hue < 240) {
    g = x
    b = c
  } else if (hue < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return rgbToHex({
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clamp01(value: number): number {
  return clamp(value, 0, 1)
}
