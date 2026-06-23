import { getPaletteItem, PALETTE_ITEMS } from '../constants'
import type { Block, BlockType, CarouselBlockProps, CarouselSlide, TabPanel, TabsBlockProps } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { applySiteThemeToBlockProps } from './siteStylesHelpers'

export function createBlockId() {
  return `block-${crypto.randomUUID()}`
}

function cloneCarouselSlides(slides: CarouselSlide[]): CarouselSlide[] {
  return slides.map(slide => ({
    id: createBlockId(),
    children: slide.children.map(child => ({
      ...child,
      id: `${child.type}-${crypto.randomUUID()}`
    }))
  }))
}

function cloneTabPanels(tabs: TabPanel[]): TabPanel[] {
  return tabs.map(panel => ({
    id: createBlockId(),
    label: panel.label,
    children: panel.children.map(child => ({
      ...child,
      id: `${child.type}-${crypto.randomUUID()}`
    }))
  }))
}

export function createBlock(type: BlockType, siteStyles?: SiteStyles, paletteId?: string): Block {
  const paletteItem = getPaletteItem(paletteId, type)

  if (!paletteItem) {
    throw new Error(`Unknown block type: ${type}${paletteId ? ` (${paletteId})` : ''}`)
  }

  let props = siteStyles
    ? applySiteThemeToBlockProps(type, { ...paletteItem.defaultProps }, siteStyles)
    : { ...paletteItem.defaultProps }

  if (type === 'carousel') {
    const carouselProps = props as CarouselBlockProps
    props = {
      ...carouselProps,
      slides: cloneCarouselSlides(carouselProps.slides)
    } as typeof props
  }

  if (type === 'tabs') {
    const tabsProps = props as TabsBlockProps
    props = {
      ...tabsProps,
      tabs: cloneTabPanels(tabsProps.tabs)
    } as typeof props
  }

  return {
    id: createBlockId(),
    type,
    props
  }
}

export { PALETTE_ITEMS, getPaletteItem }
