import { getPaletteItem, PALETTE_ITEMS } from '../constants'
import type { Block, BlockType, CarouselBlockProps, CarouselSlide, SectionBlockProps, TabPanel, TabsBlockProps } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { applySiteThemeToBlockProps } from './siteStylesHelpers'

export function createBlockId() {
  return `block-${crypto.randomUUID()}`
}

function cloneCarouselSlides(slides: CarouselSlide[]): CarouselSlide[] {
  return slides.map(slide => ({
    id: createBlockId(),
    children: slide.children.map(child => cloneBlockWithNewIds(child))
  }))
}

function cloneTabPanels(tabs: TabPanel[]): TabPanel[] {
  return tabs.map(panel => ({
    id: createBlockId(),
    label: panel.label,
    children: panel.children.map(child => cloneBlockWithNewIds(child))
  }))
}

/** Deep-clone a block and all nested children, assigning fresh IDs to everything. */
export function cloneBlockWithNewIds(block: Block): Block {
  const cloned: Block = { ...block, id: createBlockId(), props: { ...block.props } }

  if (cloned.type === 'section') {
    const props = cloned.props as SectionBlockProps
    cloned.props = {
      ...props,
      children: (props.children ?? []).map(cloneBlockWithNewIds),
      primaryChildren: (props.primaryChildren ?? []).map(cloneBlockWithNewIds),
      secondaryChildren: (props.secondaryChildren ?? []).map(cloneBlockWithNewIds)
    } as SectionBlockProps
  }

  if (cloned.type === 'carousel') {
    const props = cloned.props as CarouselBlockProps
    cloned.props = { ...props, slides: cloneCarouselSlides(props.slides) } as CarouselBlockProps
  }

  if (cloned.type === 'tabs') {
    const props = cloned.props as TabsBlockProps
    cloned.props = { ...props, tabs: cloneTabPanels(props.tabs) } as TabsBlockProps
  }

  return cloned
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
