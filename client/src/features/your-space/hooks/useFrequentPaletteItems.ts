'use client'

import { useEffect, useState } from 'react'

import type { PaletteItem } from '../types'
import { getFrequentPaletteItems, PALETTE_USAGE_EVENT } from '../utils/paletteUsage'

export function useFrequentPaletteItems(limit = 6): PaletteItem[] {
  const [items, setItems] = useState<PaletteItem[]>(() => getFrequentPaletteItems(limit))

  useEffect(() => {
    const sync = () => setItems(getFrequentPaletteItems(limit))

    sync()
    window.addEventListener(PALETTE_USAGE_EVENT, sync)

    return () => {
      window.removeEventListener(PALETTE_USAGE_EVENT, sync)
    }
  }, [limit])

  return items
}
