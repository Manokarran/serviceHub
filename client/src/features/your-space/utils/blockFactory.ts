import { getPaletteItem, PALETTE_ITEMS } from '../constants'
import type { Block, BlockType } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { applySiteThemeToBlockProps } from './siteStylesHelpers'

export function createBlockId() {
  return `block-${crypto.randomUUID()}`
}

export function createBlock(type: BlockType, siteStyles?: SiteStyles, paletteId?: string): Block {
  const paletteItem = getPaletteItem(paletteId, type)

  if (!paletteItem) {
    throw new Error(`Unknown block type: ${type}${paletteId ? ` (${paletteId})` : ''}`)
  }

  const props = siteStyles
    ? applySiteThemeToBlockProps(type, { ...paletteItem.defaultProps }, siteStyles)
    : { ...paletteItem.defaultProps }

  return {
    id: createBlockId(),
    type,
    props
  }
}

export { PALETTE_ITEMS, getPaletteItem }
