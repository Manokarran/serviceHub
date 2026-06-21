import type { SplitVisualConfig } from '../types'

function normalizeHex(value: string): string | null {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value
  }

  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value

    return `#${r}${r}${g}${g}${b}${b}`
  }

  return null
}

function darkenHex(hex: string, mixRatio = 0.45): string {
  const normalized = normalizeHex(hex)

  if (!normalized) {
    return '#312e81'
  }

  const r = Number.parseInt(normalized.slice(1, 3), 16)
  const g = Number.parseInt(normalized.slice(3, 5), 16)
  const b = Number.parseInt(normalized.slice(5, 7), 16)
  const blend = (channel: number) => Math.round(channel * (1 - mixRatio) + 15 * mixRatio)

  return `#${blend(r).toString(16).padStart(2, '0')}${blend(g).toString(16).padStart(2, '0')}${blend(b).toString(16).padStart(2, '0')}`
}

export function resolveHeroVisualColors(
  config: Pick<SplitVisualConfig, 'splitVisualColorStart' | 'splitVisualColorEnd'>,
  accentColor: string
): { start: string; end: string } {
  const start = config.splitVisualColorStart?.trim() || accentColor
  const end = config.splitVisualColorEnd?.trim() || darkenHex(start)

  return { start, end }
}

export function buildHeroVisualGradient(start: string, end: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`
}

export function buildHeroVisualShiftGradient(start: string, end: string): string {
  return `linear-gradient(135deg, ${start} 0%, ${end} 35%, ${start} 70%, ${end} 100%)`
}
