import type { SxProps, Theme } from '@mui/material/styles'

import type { HeroBlockProps } from '../types'

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

export function getHeroRotatingWordHighlightSx(accentColor: string): SxProps<Theme> {
  const accent = accentColor?.trim() || '#8B5CF6'

  return {
    backgroundImage: `linear-gradient(100deg, ${accent}, #22D3EE 45%, #F472B6 82%, ${accent})`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  }
}
