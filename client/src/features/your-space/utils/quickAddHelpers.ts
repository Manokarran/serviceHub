import type { AiBuilderInsertAt } from '@/lib/ai-builder/types'

import { PALETTE_ITEMS } from '../constants'
import type { Block, BlockType, CarouselBlockProps, PaletteItem, SectionBlockProps, TabsBlockProps } from '../types'
import {
  canNestInCarousel,
  canNestInSection,
  canNestInTabs,
  findBlockInTree,
  getCarouselSlideChildren,
  getSectionColumnChildren,
  getTabPanelChildren,
  type BlockColumn,
  type BlockLocation,
  type NestTargetHints
} from './blockTreeUtils'

type WithoutIndex<T> = T extends unknown ? Omit<T, 'index'> & { index?: number } : never

export type QuickAddLocation = WithoutIndex<BlockLocation>

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

/** Every palette entry allowed at the insert location (all variants included). */
export function getQuickAddPaletteItems(location: QuickAddLocation): PaletteItem[] {
  return PALETTE_ITEMS.filter(item => canAddBlockAtLocation(item.type, location))
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

export function getChildrenAtQuickAddLocation(blocks: Block[], location: QuickAddLocation): Block[] {
  if (location.container === 'root') {
    return blocks
  }

  if (location.container === 'section') {
    const section = findBlockInTree(blocks, location.sectionId)

    return section ? getSectionColumnChildren(section, location.column) : []
  }

  if (location.container === 'carousel') {
    const carousel = findBlockInTree(blocks, location.carouselId)

    return carousel ? getCarouselSlideChildren(carousel, location.slideId) : []
  }

  const tabs = findBlockInTree(blocks, location.tabsId)

  return tabs ? getTabPanelChildren(tabs, location.panelId) : []
}

function humanizeBlockType(type: BlockType): string {
  const paletteLabel = PALETTE_ITEMS.find(item => item.type === type)?.label

  if (paletteLabel) {
    return paletteLabel
  }

  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim()
}

const LABEL_KEYS = ['title', 'text', 'logoText', 'copyrightText', 'eyebrow', 'alt', 'ctaLabel'] as const

export function describeBlockForInsert(block: Block): string {
  const props = block.props as unknown as Record<string, unknown>

  for (const key of LABEL_KEYS) {
    const value = props[key]

    if (typeof value === 'string' && value.trim().length > 0) {
      const trimmed = value.trim().replace(/\s+/g, ' ')

      return trimmed.length > 28 ? `${trimmed.slice(0, 28)}…` : trimmed
    }
  }

  return humanizeBlockType(block.type)
}

function containerInsertLabel(blocks: Block[], location: QuickAddLocation): string {
  if (location.container === 'root') {
    return 'page end'
  }

  if (location.container === 'section') {
    const section = findBlockInTree(blocks, location.sectionId)
    const props = section?.props as SectionBlockProps | undefined
    const layout = props?.layout ?? 'single'

    if (location.column === 'secondary') {
      return layout === 'split-vertical' ? 'bottom row' : 'right column'
    }

    if (location.column === 'primary') {
      return layout === 'split-vertical' ? 'top row' : 'left column'
    }

    return section ? describeBlockForInsert(section) : 'section'
  }

  if (location.container === 'carousel') {
    const carousel = findBlockInTree(blocks, location.carouselId)
    const props = carousel?.props as CarouselBlockProps | undefined
    const slideIndex = props?.slides.findIndex(slide => slide.id === location.slideId) ?? -1

    return slideIndex >= 0 ? `Slide ${slideIndex + 1}` : 'carousel'
  }

  const tabs = findBlockInTree(blocks, location.tabsId)
  const props = tabs?.props as TabsBlockProps | undefined
  const panel = props?.tabs.find(entry => entry.id === location.panelId)

  return panel?.label?.trim() || 'tab'
}

function containerBlockId(location: QuickAddLocation): string | null {
  if (location.container === 'root') {
    return null
  }

  if (location.container === 'section') {
    return location.sectionId
  }

  if (location.container === 'carousel') {
    return location.carouselId
  }

  return location.tabsId
}

export type AiInsertTargetResolution = {
  at: AiBuilderInsertAt
  label: string
  blockLocation: BlockLocation
}

/** Map a quick-add slot to an AI insert `at` plus a short chip label. */
export function resolveAiInsertTarget(
  blocks: Block[],
  location: QuickAddLocation,
  index: number,
  idToRef: Record<string, string>
): AiInsertTargetResolution | null {
  const children = getChildrenAtQuickAddLocation(blocks, location)
  const clampedIndex = Math.max(0, Math.min(index, children.length))
  const blockLocation = toBlockLocation(location, clampedIndex)

  if (clampedIndex < children.length) {
    const neighbor = children[clampedIndex]
    const ref = idToRef[neighbor.id]

    if (!ref) {
      return null
    }

    return {
      at: { position: 'before', ref },
      label: `above ${describeBlockForInsert(neighbor)}`,
      blockLocation
    }
  }

  if (children.length > 0) {
    const neighbor = children[children.length - 1]
    const ref = idToRef[neighbor.id]

    if (!ref) {
      return null
    }

    return {
      at: { position: 'after', ref },
      label: `below ${describeBlockForInsert(neighbor)}`,
      blockLocation
    }
  }

  if (location.container === 'root') {
    return {
      at: { position: 'page-end' },
      label: 'at page end',
      blockLocation
    }
  }

  const parentId = containerBlockId(location)
  const ref = parentId ? idToRef[parentId] : undefined

  if (!ref) {
    return null
  }

  return {
    at: { position: 'inside-end', ref },
    label: `into ${containerInsertLabel(blocks, location)}`,
    blockLocation
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
