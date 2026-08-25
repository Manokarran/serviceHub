import { PALETTE_ITEMS } from '../constants'
import type { Block, BlockType, CarouselBlockProps, PaletteItem, SectionBlockProps, TabsBlockProps } from '../types'
import {
  canNestInCarousel,
  canNestInSection,
  canNestInTabs,
  getCarouselSlideChildren,
  getSectionColumnChildren,
  getTabPanelChildren,
  type BlockColumn,
  type BlockLocation,
  type NestTargetHints
} from './blockTreeUtils'

export type QuickAddLocation = Omit<BlockLocation, 'index'> & { index?: number }

export function canAddBlockAtLocation(type: BlockType, location: QuickAddLocation): boolean {
  if (location.container === 'root') {
    return true
  }

  if (location.container === 'section') {
    return canNestInSection(type)
  }

  if (location.container === 'carousel') {
    return canNestInCarousel(type)
  }

  return canNestInTabs(type)
}

/** Palette entries allowed at a given insert location. Keeps distinct variants (sections, typography, etc.). */
export function getQuickAddPaletteItems(location: QuickAddLocation): PaletteItem[] {
  const allowed = PALETTE_ITEMS.filter(item => canAddBlockAtLocation(item.type, location))

  // Types that ship multiple palette presets — show every preset in insert menus.
  const keepVariants = new Set<BlockType>(['section', 'carousel', 'tabs', 'heading', 'text', 'shape', 'showcase', 'pricing'])
  const seenTypes = new Set<BlockType>()
  const items: PaletteItem[] = []

  for (const item of allowed) {
    if (keepVariants.has(item.type)) {
      items.push(item)
      continue
    }

    if (seenTypes.has(item.type)) {
      continue
    }

    seenTypes.add(item.type)
    items.push(item)
  }

  return items
}

export function toBlockLocation(location: QuickAddLocation, index: number): BlockLocation {
  if (location.container === 'root') {
    return { container: 'root', index }
  }

  if (location.container === 'section') {
    return {
      container: 'section',
      sectionId: location.sectionId,
      column: location.column,
      index
    }
  }

  if (location.container === 'carousel') {
    return {
      container: 'carousel',
      carouselId: location.carouselId,
      slideId: location.slideId,
      index
    }
  }

  return {
    container: 'tabs',
    tabsId: location.tabsId,
    panelId: location.panelId,
    index
  }
}

function sectionColumnLabel(layout: SectionBlockProps['layout'], column: BlockColumn): string {
  if (column === 'secondary') {
    return layout === 'split-vertical' ? 'bottom row' : 'right column'
  }

  if (column === 'primary') {
    return layout === 'split-vertical' ? 'top row' : 'left column'
  }

  return 'section'
}

export type InsertInsideOption = {
  location: QuickAddLocation
  index: number
  label: string
}

/** Resolve where “Add inside” should place a child for section / carousel / tabs. */
export function resolveInsertInsideTarget(
  block: Block,
  nestHints?: NestTargetHints,
  preferredColumn?: BlockColumn
): InsertInsideOption | null {
  const options = listInsertInsideTargets(block, nestHints, preferredColumn)

  return options[0] ?? null
}

/** All inside insert destinations (e.g. both columns of a double section). */
export function listInsertInsideTargets(
  block: Block,
  nestHints?: NestTargetHints,
  preferredColumn?: BlockColumn
): InsertInsideOption[] {
  if (block.type === 'section') {
    const props = block.props as SectionBlockProps
    const isSplit = props.layout === 'split-horizontal' || props.layout === 'split-vertical'
    const hint = nestHints?.[block.id]
    const hintedColumn = hint?.kind === 'section' ? hint.column : undefined
    const columns: BlockColumn[] = isSplit ? ['primary', 'secondary'] : ['default']

    const ordered =
      preferredColumn && columns.includes(preferredColumn)
        ? [preferredColumn, ...columns.filter(column => column !== preferredColumn)]
        : hintedColumn && columns.includes(hintedColumn)
          ? [hintedColumn, ...columns.filter(column => column !== hintedColumn)]
          : columns

    return ordered.map(column => {
      const children = getSectionColumnChildren(block, column)

      return {
        location: { container: 'section' as const, sectionId: block.id, column },
        index: children.length,
        label: sectionColumnLabel(props.layout, column)
      }
    })
  }

  if (block.type === 'carousel') {
    const props = block.props as CarouselBlockProps
    const hint = nestHints?.[block.id]
    const slideIndex =
      hint?.kind === 'carousel'
        ? Math.max(
            0,
            props.slides.findIndex(entry => entry.id === hint.slotId)
          )
        : 0
    const slide = props.slides[slideIndex] ?? props.slides[0]

    if (!slide) {
      return []
    }

    const children = getCarouselSlideChildren(block, slide.id)

    return [
      {
        location: { container: 'carousel', carouselId: block.id, slideId: slide.id },
        index: children.length,
        label: `Slide ${slideIndex + 1}`
      }
    ]
  }

  if (block.type === 'tabs') {
    const props = block.props as TabsBlockProps
    const hint = nestHints?.[block.id]
    const panelIndex =
      hint?.kind === 'tabs'
        ? Math.max(
            0,
            props.tabs.findIndex(entry => entry.id === hint.slotId)
          )
        : 0
    const panel = props.tabs[panelIndex] ?? props.tabs[0]

    if (!panel) {
      return []
    }

    const children = getTabPanelChildren(block, panel.id)

    return [
      {
        location: { container: 'tabs', tabsId: block.id, panelId: panel.id },
        index: children.length,
        label: panel.label || `Tab ${panelIndex + 1}`
      }
    ]
  }

  return []
}
