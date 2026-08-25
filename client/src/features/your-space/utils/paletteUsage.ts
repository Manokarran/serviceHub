import { PALETTE_ITEMS } from '../constants'
import type { PaletteItem } from '../types'

export const PALETTE_USAGE_KEY = 'servicehub-builder-palette-usage'
export const PALETTE_USAGE_EVENT = 'builder-palette-usage'

const DEFAULT_FREQUENT_IDS = ['heading', 'text', 'image', 'button', 'hero', 'section-single'] as const

type UsageRecord = {
  count: number
  lastUsedAt: number
}

type UsageMap = Record<string, UsageRecord>

function readUsage(): UsageMap {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = localStorage.getItem(PALETTE_USAGE_KEY)

    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as UsageMap

    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return parsed
  } catch {
    return {}
  }
}

function writeUsage(data: UsageMap) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(PALETTE_USAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event(PALETTE_USAGE_EVENT))
}

export function recordPaletteUse(paletteId?: string) {
  if (!paletteId || typeof window === 'undefined') {
    return
  }

  if (!PALETTE_ITEMS.some(item => item.id === paletteId)) {
    return
  }

  const data = readUsage()
  const previous = data[paletteId] ?? { count: 0, lastUsedAt: 0 }

  data[paletteId] = {
    count: previous.count + 1,
    lastUsedAt: Date.now()
  }

  writeUsage(data)
}

function scoreUsage(record: UsageRecord, now: number) {
  const days = Math.max(0, (now - record.lastUsedAt) / 86_400_000)
  const recency = Math.max(0, 1 - days / 45)

  return record.count * 2 + recency * 8
}

export function getFrequentPaletteItems(limit = 6): PaletteItem[] {
  const known = new Map(PALETTE_ITEMS.map(item => [item.id, item]))
  const data = readUsage()
  const now = Date.now()

  const ranked = Object.entries(data)
    .filter(([id]) => known.has(id))
    .map(([id, record]) => ({ id, score: scoreUsage(record, now) }))
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.id)

  const merged: string[] = []

  for (const id of ranked) {
    if (merged.length >= limit) {
      break
    }

    merged.push(id)
  }

  for (const id of DEFAULT_FREQUENT_IDS) {
    if (merged.length >= limit) {
      break
    }

    if (!merged.includes(id) && known.has(id)) {
      merged.push(id)
    }
  }

  return merged.map(id => known.get(id)).filter((item): item is PaletteItem => Boolean(item))
}
