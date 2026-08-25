import { getPaletteItem, PALETTE_ITEMS } from '../constants'
import type { Block, BlockType, CarouselBlockProps, CarouselSlide, PricingBlockProps, SectionBlockProps, ShowcaseBlockProps, TabPanel, TabsBlockProps } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { asBlockList, MAX_BLOCK_TREE_DEPTH } from './blockList'
import { applySiteThemeToBlockProps } from './siteStylesHelpers'
import { cloneShowcaseItems } from './showcaseBlockHelpers'
import { clonePricingPlans } from './pricingBlockHelpers'

export function createBlockId() {
  return `block-${crypto.randomUUID()}`
}

function asPlainProps(props: Block['props']): Record<string, unknown> {
  return props && typeof props === 'object' ? { ...(props as unknown as Record<string, unknown>) } : {}
}

function cloneCarouselSlides(
  slides: CarouselSlide[] | undefined,
  visiting: WeakSet<object>,
  depth: number
): CarouselSlide[] {
  return (slides ?? []).map(slide => ({
    id: createBlockId(),
    children: asBlockList(slide?.children).map(child => cloneBlockDeep(child, visiting, depth + 1))
  }))
}

function cloneTabPanels(tabs: TabPanel[] | undefined, visiting: WeakSet<object>, depth: number): TabPanel[] {
  return (tabs ?? []).map(panel => ({
    id: createBlockId(),
    label: panel.label,
    children: asBlockList(panel?.children).map(child => cloneBlockDeep(child, visiting, depth + 1))
  }))
}

function cloneSectionColumns(
  props: Record<string, unknown>,
  visiting: WeakSet<object>,
  depth: number
): Pick<SectionBlockProps, 'children' | 'primaryChildren' | 'secondaryChildren'> {
  const cache = new Map<unknown, Block[]>()

  const cloneList = (value: unknown) => {
    if (cache.has(value)) {
      return cache.get(value) as Block[]
    }

    const cloned = asBlockList(value).map(child => cloneBlockDeep(child, visiting, depth + 1))
    cache.set(value, cloned)

    return cloned
  }

  return {
    children: cloneList(props.children),
    primaryChildren: cloneList(props.primaryChildren),
    secondaryChildren: cloneList(props.secondaryChildren)
  }
}

function cloneBlockDeep(block: Block, visiting: WeakSet<object>, depth: number): Block {
  const props = asPlainProps(block.props)

  if (depth > MAX_BLOCK_TREE_DEPTH || visiting.has(block)) {
    return {
      id: createBlockId(),
      type: block.type,
      props: {
        ...props,
        children: [],
        primaryChildren: [],
        secondaryChildren: [],
        slides: Array.isArray(props.slides) ? [] : props.slides,
        tabs: Array.isArray(props.tabs) ? [] : props.tabs
      } as unknown as Block['props']
    }
  }

  visiting.add(block)

  try {
    const cloned: Block = {
      id: createBlockId(),
      type: block.type,
      props: props as unknown as Block['props']
    }

    if (cloned.type === 'section') {
      cloned.props = {
        ...props,
        ...cloneSectionColumns(props, visiting, depth)
      } as SectionBlockProps
    }

    if (cloned.type === 'carousel') {
      cloned.props = {
        ...props,
        slides: cloneCarouselSlides((props as unknown as CarouselBlockProps).slides, visiting, depth)
      } as CarouselBlockProps
    }

    if (cloned.type === 'tabs') {
      cloned.props = {
        ...props,
        tabs: cloneTabPanels((props as unknown as TabsBlockProps).tabs, visiting, depth)
      } as TabsBlockProps
    }

    if (cloned.type === 'showcase') {
      cloned.props = {
        ...props,
        items: cloneShowcaseItems((props as unknown as ShowcaseBlockProps).items, createBlockId)
      } as ShowcaseBlockProps
    }

    if (cloned.type === 'pricing') {
      cloned.props = {
        ...props,
        plans: clonePricingPlans((props as unknown as PricingBlockProps).plans, createBlockId)
      } as PricingBlockProps
    }

    return cloned
  } finally {
    visiting.delete(block)
  }
}

/** Deep-clone a block and all nested children, assigning fresh IDs to everything. */
export function cloneBlockWithNewIds(block: Block): Block {
  return cloneBlockDeep(block, new WeakSet<object>(), 0)
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
      slides: cloneCarouselSlides(carouselProps.slides, new WeakSet<object>(), 0)
    } as typeof props
  }

  if (type === 'tabs') {
    const tabsProps = props as TabsBlockProps
    props = {
      ...tabsProps,
      tabs: cloneTabPanels(tabsProps.tabs, new WeakSet<object>(), 0)
    } as typeof props
  }

  if (type === 'showcase') {
    const showcaseProps = props as ShowcaseBlockProps
    props = {
      ...showcaseProps,
      items: cloneShowcaseItems(showcaseProps.items, createBlockId)
    } as typeof props
  }

  if (type === 'pricing') {
    const pricingProps = props as PricingBlockProps
    props = {
      ...pricingProps,
      plans: clonePricingPlans(pricingProps.plans, createBlockId)
    } as typeof props
  }

  return {
    id: createBlockId(),
    type,
    props
  }
}

export { PALETTE_ITEMS, getPaletteItem }
