import type { Block, BlockType, CarouselBlockProps, SectionBlockProps, TabsBlockProps } from '../types'

export type BlockColumn = 'default' | 'primary' | 'secondary'

export type BlockLocation =
  | { container: 'root'; index: number }
  | { container: 'section'; sectionId: string; column: BlockColumn; index: number }
  | { container: 'carousel'; carouselId: string; slideId: string; index: number }
  | { container: 'tabs'; tabsId: string; panelId: string; index: number }

/** Blocks allowed inside a section (including nested sections, carousels, and tabs) */
export const SECTION_CHILD_TYPES: BlockType[] = [
  'section',
  'carousel',
  'tabs',
  'heading',
  'text',
  'button',
  'image',
  'video',
  'logo',
  'shape',
  'icon',
  'contactForm',
  'showcase',
  'pricing',
  'serviceDirectory',
  'serviceBooking',
  'customerBookings'
]

/** Blocks allowed inside a carousel slide or tab panel */
export const CAROUSEL_CHILD_TYPES: BlockType[] = SECTION_CHILD_TYPES

export const TAB_CHILD_TYPES: BlockType[] = SECTION_CHILD_TYPES

/** Full-width blocks that must stay at the page root */
export const ROOT_ONLY_BLOCK_TYPES: BlockType[] = ['header', 'footer', 'hero']

export function canNestInSection(type: BlockType): boolean {
  return SECTION_CHILD_TYPES.includes(type)
}

export function canNestInCarousel(type: BlockType): boolean {
  return CAROUSEL_CHILD_TYPES.includes(type)
}

export function canNestInTabs(type: BlockType): boolean {
  return TAB_CHILD_TYPES.includes(type)
}

export function getSectionColumnChildren(section: Block, column: BlockColumn): Block[] {
  const props = section.props as SectionBlockProps

  if (column === 'primary') {
    return props.primaryChildren ?? []
  }

  if (column === 'secondary') {
    return props.secondaryChildren ?? []
  }

  return props.children ?? []
}

export function getCarouselSlideChildren(carousel: Block, slideId: string): Block[] {
  const props = carousel.props as CarouselBlockProps
  const slide = props.slides.find(entry => entry.id === slideId)

  return slide?.children ?? []
}

export function getTabPanelChildren(tabsBlock: Block, panelId: string): Block[] {
  const props = tabsBlock.props as TabsBlockProps
  const panel = props.tabs.find(entry => entry.id === panelId)

  return panel?.children ?? []
}
export function getDefaultSectionColumn(layout: SectionBlockProps['layout']): BlockColumn {
  if (layout === 'split-horizontal' || layout === 'split-vertical') {
    return 'primary'
  }

  return 'default'
}

export function parseSectionDropId(id: string | number): { sectionId: string; column: BlockColumn } | null {
  if (typeof id !== 'string' || !id.startsWith('section-drop:')) {
    return null
  }

  const parts = id.split(':')
  const sectionId = parts[1]
  const column = (parts[2] as BlockColumn | undefined) ?? 'default'

  if (!sectionId) {
    return null
  }

  return { sectionId, column }
}

export function parseCarouselDropId(id: string | number): { carouselId: string; slideId: string } | null {
  if (typeof id !== 'string' || !id.startsWith('carousel-drop:')) {
    return null
  }

  const parts = id.split(':')
  const carouselId = parts[1]
  const slideId = parts[2]

  if (!carouselId || !slideId) {
    return null
  }

  return { carouselId, slideId }
}

export function sectionDropId(sectionId: string, column: BlockColumn = 'default'): string {
  return column === 'default' ? `section-drop:${sectionId}` : `section-drop:${sectionId}:${column}`
}

export function carouselDropId(carouselId: string, slideId: string): string {
  return `carousel-drop:${carouselId}:${slideId}`
}

export function parseTabsDropId(id: string | number): { tabsId: string; panelId: string } | null {
  if (typeof id !== 'string' || !id.startsWith('tabs-drop:')) {
    return null
  }

  const parts = id.split(':')
  const tabsId = parts[1]
  const panelId = parts[2]

  if (!tabsId || !panelId) {
    return null
  }

  return { tabsId, panelId }
}

export function tabsDropId(tabsId: string, panelId: string): string {
  return `tabs-drop:${tabsId}:${panelId}`
}
export function insertDropId(location: BlockLocation): string {
  if (location.container === 'root') {
    return `insert:root:${location.index}`
  }

  if (location.container === 'section') {
    return `insert:section:${location.sectionId}:${location.column}:${location.index}`
  }

  if (location.container === 'carousel') {
    return `insert:carousel:${location.carouselId}:${location.slideId}:${location.index}`
  }

  return `insert:tabs:${location.tabsId}:${location.panelId}:${location.index}`
}
export function parseInsertDropId(id: string | number): BlockLocation | null {
  if (typeof id !== 'string' || !id.startsWith('insert:')) {
    return null
  }

  const parts = id.split(':')

  if (parts[1] === 'root') {
    const index = Number.parseInt(parts[2] ?? '', 10)

    if (Number.isNaN(index) || index < 0) {
      return null
    }

    return { container: 'root', index }
  }

  if (parts[1] === 'section') {
    const sectionId = parts[2]
    const column = (parts[3] as BlockColumn | undefined) ?? 'default'
    const index = Number.parseInt(parts[4] ?? '', 10)

    if (!sectionId || Number.isNaN(index) || index < 0) {
      return null
    }

    return { container: 'section', sectionId, column, index }
  }

  if (parts[1] === 'carousel') {
    const carouselId = parts[2]
    const slideId = parts[3]
    const index = Number.parseInt(parts[4] ?? '', 10)

    if (!carouselId || !slideId || Number.isNaN(index) || index < 0) {
      return null
    }

    return { container: 'carousel', carouselId, slideId, index }
  }

  if (parts[1] === 'tabs') {
    const tabsId = parts[2]
    const panelId = parts[3]
    const index = Number.parseInt(parts[4] ?? '', 10)

    if (!tabsId || !panelId || Number.isNaN(index) || index < 0) {
      return null
    }

    return { container: 'tabs', tabsId, panelId, index }
  }

  return null
}
function setSectionColumnChildren(
  props: SectionBlockProps,
  column: BlockColumn,
  children: Block[]
): SectionBlockProps {
  if (column === 'primary') {
    return { ...props, primaryChildren: children }
  }

  if (column === 'secondary') {
    return { ...props, secondaryChildren: children }
  }

  return { ...props, children }
}

function mapSectionColumns(section: Block, mapper: (children: Block[]) => Block[]): Block {
  const props = section.props as SectionBlockProps

  return {
    ...section,
    props: {
      ...props,
      children: mapper(props.children ?? []),
      primaryChildren: mapper(props.primaryChildren ?? []),
      secondaryChildren: mapper(props.secondaryChildren ?? [])
    }
  }
}

function mapCarouselSlides(carousel: Block, mapper: (children: Block[]) => Block[]): Block {
  const props = carousel.props as CarouselBlockProps

  return {
    ...carousel,
    props: {
      ...props,
      slides: props.slides.map(slide => ({
        ...slide,
        children: mapper(slide.children)
      }))
    }
  }
}

function mapTabsPanels(tabsBlock: Block, mapper: (children: Block[]) => Block[]): Block {
  const props = tabsBlock.props as TabsBlockProps

  return {
    ...tabsBlock,
    props: {
      ...props,
      tabs: props.tabs.map(panel => ({
        ...panel,
        children: mapper(panel.children)
      }))
    }
  }
}

function mapNestedChildren(block: Block, mapper: (children: Block[]) => Block[]): Block {
  if (block.type === 'section') {
    return mapSectionColumns(block, mapper)
  }

  if (block.type === 'carousel') {
    return mapCarouselSlides(block, mapper)
  }

  if (block.type === 'tabs') {
    return mapTabsPanels(block, mapper)
  }

  return block
}

function updateSectionById(
  blocks: Block[],
  sectionId: string,
  updater: (props: SectionBlockProps) => SectionBlockProps
): Block[] {
  return blocks.map(block => {
    if (block.id === sectionId && block.type === 'section') {
      return { ...block, props: updater(block.props as SectionBlockProps) }
    }

    if (block.type === 'section' || block.type === 'carousel' || block.type === 'tabs') {
      return mapNestedChildren(block, children => updateSectionById(children, sectionId, updater))
    }

    return block
  })
}

function updateCarouselById(
  blocks: Block[],
  carouselId: string,
  updater: (props: CarouselBlockProps) => CarouselBlockProps
): Block[] {
  return blocks.map(block => {
    if (block.id === carouselId && block.type === 'carousel') {
      return { ...block, props: updater(block.props as CarouselBlockProps) }
    }

    if (block.type === 'section' || block.type === 'carousel' || block.type === 'tabs') {
      return mapNestedChildren(block, children => updateCarouselById(children, carouselId, updater))
    }

    return block
  })
}

function updateTabsById(
  blocks: Block[],
  tabsId: string,
  updater: (props: TabsBlockProps) => TabsBlockProps
): Block[] {
  return blocks.map(block => {
    if (block.id === tabsId && block.type === 'tabs') {
      return { ...block, props: updater(block.props as TabsBlockProps) }
    }

    if (block.type === 'section' || block.type === 'carousel' || block.type === 'tabs') {
      return mapNestedChildren(block, children => updateTabsById(children, tabsId, updater))
    }

    return block
  })
}

function findSectionInTree(blocks: Block[], sectionId: string): Block | null {
  for (const block of blocks) {
    if (block.id === sectionId && block.type === 'section') {
      return block
    }

    if (block.type === 'section') {
      for (const column of ['default', 'primary', 'secondary'] as BlockColumn[]) {
        const found = findSectionInTree(getSectionColumnChildren(block, column), sectionId)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        const found = findSectionInTree(slide.children, sectionId)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        const found = findSectionInTree(panel.children, sectionId)

        if (found) {
          return found
        }
      }
    }
  }

  return null
}

function findCarouselInTree(blocks: Block[], carouselId: string): Block | null {
  for (const block of blocks) {
    if (block.id === carouselId && block.type === 'carousel') {
      return block
    }

    if (block.type === 'section') {
      for (const column of ['default', 'primary', 'secondary'] as BlockColumn[]) {
        const found = findCarouselInTree(getSectionColumnChildren(block, column), carouselId)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        const found = findCarouselInTree(slide.children, carouselId)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        const found = findCarouselInTree(panel.children, carouselId)

        if (found) {
          return found
        }
      }
    }
  }

  return null
}

function findTabsInTree(blocks: Block[], tabsId: string): Block | null {
  for (const block of blocks) {
    if (block.id === tabsId && block.type === 'tabs') {
      return block
    }

    if (block.type === 'section') {
      for (const column of ['default', 'primary', 'secondary'] as BlockColumn[]) {
        const found = findTabsInTree(getSectionColumnChildren(block, column), tabsId)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        const found = findTabsInTree(slide.children, tabsId)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        const found = findTabsInTree(panel.children, tabsId)

        if (found) {
          return found
        }
      }
    }
  }

  return null
}

export function findBlockInTree(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) {
      return block
    }

    if (block.type === 'section') {
      for (const column of ['default', 'primary', 'secondary'] as BlockColumn[]) {
        const found = findBlockInTree(getSectionColumnChildren(block, column), id)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        const found = findBlockInTree(slide.children, id)

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        const found = findBlockInTree(panel.children, id)

        if (found) {
          return found
        }
      }
    }
  }

  return null
}

type BlockParent =
  | { container: 'section'; sectionId: string; column: BlockColumn }
  | { container: 'carousel'; carouselId: string; slideId: string }
  | { container: 'tabs'; tabsId: string; panelId: string }

function findBlockLocationInList(
  blocks: Block[],
  id: string,
  parent?: BlockParent
): BlockLocation | null {
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]

    if (block.id === id) {
      if (parent?.container === 'section') {
        return { container: 'section', sectionId: parent.sectionId, column: parent.column, index }
      }

      if (parent?.container === 'carousel') {
        return {
          container: 'carousel',
          carouselId: parent.carouselId,
          slideId: parent.slideId,
          index
        }
      }

      if (parent?.container === 'tabs') {
        return {
          container: 'tabs',
          tabsId: parent.tabsId,
          panelId: parent.panelId,
          index
        }
      }

      return { container: 'root', index }
    }

    if (block.type === 'section') {
      for (const column of ['default', 'primary', 'secondary'] as BlockColumn[]) {
        const found = findBlockLocationInList(getSectionColumnChildren(block, column), id, {
          container: 'section',
          sectionId: block.id,
          column
        })

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        const found = findBlockLocationInList(slide.children, id, {
          container: 'carousel',
          carouselId: block.id,
          slideId: slide.id
        })

        if (found) {
          return found
        }
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        const found = findBlockLocationInList(panel.children, id, {
          container: 'tabs',
          tabsId: block.id,
          panelId: panel.id
        })

        if (found) {
          return found
        }
      }
    }
  }

  return null
}

export function findBlockLocation(blocks: Block[], id: string): BlockLocation | null {
  return findBlockLocationInList(blocks, id)
}

export function extractBlockFromTree(blocks: Block[], id: string): { blocks: Block[]; block: Block | null } {
  const location = findBlockLocation(blocks, id)

  if (!location) {
    return { blocks, block: null }
  }

  if (location.container === 'root') {
    const block = blocks[location.index]

    return {
      blocks: blocks.filter((_, index) => index !== location.index),
      block: block ?? null
    }
  }

  if (location.container === 'section') {
    const section = findSectionInTree(blocks, location.sectionId)

    if (!section) {
      return { blocks, block: null }
    }

    const children = getSectionColumnChildren(section, location.column)
    const block = children[location.index]

    if (!block) {
      return { blocks, block: null }
    }

    const nextChildren = children.filter((_, index) => index !== location.index)

    return {
      blocks: updateSectionById(blocks, location.sectionId, sectionProps =>
        setSectionColumnChildren(sectionProps, location.column, nextChildren)
      ),
      block
    }
  }

  if (location.container === 'carousel') {
    const carousel = findCarouselInTree(blocks, location.carouselId)

    if (!carousel) {
      return { blocks, block: null }
    }

    const children = getCarouselSlideChildren(carousel, location.slideId)
    const block = children[location.index]

    if (!block) {
      return { blocks, block: null }
    }

    const nextChildren = children.filter((_, index) => index !== location.index)

    return {
      blocks: updateCarouselById(blocks, location.carouselId, carouselProps => ({
        ...carouselProps,
        slides: carouselProps.slides.map(slide =>
          slide.id === location.slideId ? { ...slide, children: nextChildren } : slide
        )
      })),
      block
    }
  }

  const tabsBlock = findTabsInTree(blocks, location.tabsId)

  if (!tabsBlock) {
    return { blocks, block: null }
  }

  const children = getTabPanelChildren(tabsBlock, location.panelId)
  const block = children[location.index]

  if (!block) {
    return { blocks, block: null }
  }

  const nextChildren = children.filter((_, index) => index !== location.index)

  return {
    blocks: updateTabsById(blocks, location.tabsId, tabsProps => ({
      ...tabsProps,
      tabs: tabsProps.tabs.map(panel =>
        panel.id === location.panelId ? { ...panel, children: nextChildren } : panel
      )
    })),
    block
  }
}

export function insertBlockAtLocation(blocks: Block[], block: Block, location: BlockLocation): Block[] {
  if (location.container === 'root') {
    const next = [...blocks]

    next.splice(location.index, 0, block)

    return next
  }

  if (location.container === 'section') {
    return updateSectionById(blocks, location.sectionId, props => {
      const children = getSectionColumnChildren(
        { type: 'section', id: location.sectionId, props },
        location.column
      )
      const nextChildren = [...children]

      nextChildren.splice(location.index, 0, block)

      return setSectionColumnChildren(props, location.column, nextChildren)
    })
  }

  if (location.container === 'carousel') {
    return updateCarouselById(blocks, location.carouselId, props => ({
      ...props,
      slides: props.slides.map(slide => {
        if (slide.id !== location.slideId) {
          return slide
        }

        const nextChildren = [...slide.children]
        nextChildren.splice(location.index, 0, block)

        return { ...slide, children: nextChildren }
      })
    }))
  }

  return updateTabsById(blocks, location.tabsId, props => ({
    ...props,
    tabs: props.tabs.map(panel => {
      if (panel.id !== location.panelId) {
        return panel
      }

      const nextChildren = [...panel.children]
      nextChildren.splice(location.index, 0, block)

      return { ...panel, children: nextChildren }
    })
  }))
}

function getInsertIndexAfterBlock(blocks: Block[], blockId: string): BlockLocation {
  const location = findBlockLocation(blocks, blockId)

  if (!location) {
    return { container: 'root', index: blocks.length }
  }

  return { ...location, index: location.index + 1 }
}

function canPlaceTypeAtLocation(type: BlockType, location: BlockLocation): boolean {
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

/**
 * Click-to-insert from the palette — mirrors drag/drop intent:
 * - Nest containers (section / carousel / tabs): append into the active slot when allowed
 * - Otherwise: insert after the selected block in the same container
 * - Fallback: append at the end of the page
 */
export function resolvePaletteClickTarget(
  blocks: Block[],
  type: BlockType,
  selectedBlockId: string | null,
  nestHints?: NestTargetHints
): BlockLocation {
  if (!selectedBlockId) {
    return { container: 'root', index: blocks.length }
  }

  const selected = findBlockInTree(blocks, selectedBlockId)

  if (!selected) {
    return { container: 'root', index: blocks.length }
  }

  if (selected.type === 'section' && canNestInSection(type)) {
    const props = selected.props as SectionBlockProps
    const hint = nestHints?.[selected.id]
    const column =
      hint?.kind === 'section' ? hint.column : getDefaultSectionColumn(props.layout)
    const children = getSectionColumnChildren(selected, column)

    return {
      container: 'section',
      sectionId: selected.id,
      column,
      index: children.length
    }
  }

  if (selected.type === 'carousel' && canNestInCarousel(type)) {
    const props = selected.props as CarouselBlockProps
    const hint = nestHints?.[selected.id]
    const slide =
      hint?.kind === 'carousel'
        ? props.slides.find(entry => entry.id === hint.slotId) ?? props.slides[0]
        : props.slides[0]

    if (slide) {
      return {
        container: 'carousel',
        carouselId: selected.id,
        slideId: slide.id,
        index: slide.children.length
      }
    }
  }

  if (selected.type === 'tabs' && canNestInTabs(type)) {
    const props = selected.props as TabsBlockProps
    const hint = nestHints?.[selected.id]
    const panel =
      hint?.kind === 'tabs'
        ? props.tabs.find(entry => entry.id === hint.slotId) ?? props.tabs[0]
        : props.tabs[0]

    if (panel) {
      return {
        container: 'tabs',
        tabsId: selected.id,
        panelId: panel.id,
        index: panel.children.length
      }
    }
  }

  const after = getInsertIndexAfterBlock(blocks, selected.id)

  if (canPlaceTypeAtLocation(type, after)) {
    return after
  }

  return { container: 'root', index: blocks.length }
}

/** Hints for which nested slot is currently visible (active slide/tab/column). */
export type NestTargetHints = Record<
  string,
  | { kind: 'carousel'; slotId: string; label?: string }
  | { kind: 'tabs'; slotId: string; label?: string }
  | { kind: 'section'; column: BlockColumn; label?: string }
>

export function resolveDropTarget(
  blocks: Block[],
  overId: string | number,
  movingBlock?: Block | BlockType,
  nestHints?: NestTargetHints
): BlockLocation {
  const movingType = typeof movingBlock === 'string' ? movingBlock : movingBlock?.type
  const insertTarget = parseInsertDropId(overId)

  if (insertTarget) {
    return insertTarget
  }

  if (overId === 'canvas-drop-zone' || overId === 'canvas-append-zone') {
    return { container: 'root', index: blocks.length }
  }

  const sectionDrop = parseSectionDropId(overId)

  if (sectionDrop) {
    const section = findSectionInTree(blocks, sectionDrop.sectionId)

    if (section) {
      const children = getSectionColumnChildren(section, sectionDrop.column)

      return {
        container: 'section',
        sectionId: sectionDrop.sectionId,
        column: sectionDrop.column,
        index: children.length
      }
    }
  }

  const carouselDrop = parseCarouselDropId(overId)

  if (carouselDrop) {
    const carousel = findCarouselInTree(blocks, carouselDrop.carouselId)

    if (carousel) {
      const children = getCarouselSlideChildren(carousel, carouselDrop.slideId)

      return {
        container: 'carousel',
        carouselId: carouselDrop.carouselId,
        slideId: carouselDrop.slideId,
        index: children.length
      }
    }
  }

  const tabsDrop = parseTabsDropId(overId)

  if (tabsDrop) {
    const tabsBlock = findTabsInTree(blocks, tabsDrop.tabsId)

    if (tabsBlock) {
      const children = getTabPanelChildren(tabsBlock, tabsDrop.panelId)

      return {
        container: 'tabs',
        tabsId: tabsDrop.tabsId,
        panelId: tabsDrop.panelId,
        index: children.length
      }
    }
  }

  const overBlock = findBlockInTree(blocks, String(overId))

  if (overBlock?.type === 'section') {
    const props = overBlock.props as SectionBlockProps
    const hint = nestHints?.[overBlock.id]
    const column =
      hint?.kind === 'section'
        ? hint.column
        : props.layout === 'default'
          ? 'default'
          : 'primary'
    const children = getSectionColumnChildren(overBlock, column)

    if (movingType && canNestInSection(movingType)) {
      return {
        container: 'section',
        sectionId: overBlock.id,
        column,
        index: children.length
      }
    }

    return getInsertIndexAfterBlock(blocks, overBlock.id)
  }

  if (overBlock?.type === 'carousel') {
    const props = overBlock.props as CarouselBlockProps
    const hint = nestHints?.[overBlock.id]
    const slide =
      hint?.kind === 'carousel'
        ? props.slides.find(entry => entry.id === hint.slotId) ?? props.slides[0]
        : props.slides[0]

    if (slide && movingType && canNestInCarousel(movingType)) {
      return {
        container: 'carousel',
        carouselId: overBlock.id,
        slideId: slide.id,
        index: slide.children.length
      }
    }

    return getInsertIndexAfterBlock(blocks, overBlock.id)
  }

  if (overBlock?.type === 'tabs') {
    const props = overBlock.props as TabsBlockProps
    const hint = nestHints?.[overBlock.id]
    const panel =
      hint?.kind === 'tabs'
        ? props.tabs.find(entry => entry.id === hint.slotId) ?? props.tabs[0]
        : props.tabs[0]

    if (panel && movingType && canNestInTabs(movingType)) {
      return {
        container: 'tabs',
        tabsId: overBlock.id,
        panelId: panel.id,
        index: panel.children.length
      }
    }

    return getInsertIndexAfterBlock(blocks, overBlock.id)
  }

  const overLocation = findBlockLocation(blocks, String(overId))

  if (overLocation) {
    return overLocation
  }

  return { container: 'root', index: blocks.length }
}

export function moveBlockInTree(
  blocks: Block[],
  activeId: string,
  overId: string | number,
  nestHints?: NestTargetHints
): Block[] {
  if (activeId === String(overId)) {
    return blocks
  }

  const { blocks: withoutActive, block } = extractBlockFromTree(blocks, activeId)

  if (!block) {
    return blocks
  }

  const target = resolveDropTarget(withoutActive, overId, block, nestHints)

  if (!canNestInSection(block.type) && target.container === 'section') {
    return insertBlockAtLocation(withoutActive, block, { container: 'root', index: withoutActive.length })
  }

  if (!canNestInCarousel(block.type) && target.container === 'carousel') {
    return insertBlockAtLocation(withoutActive, block, { container: 'root', index: withoutActive.length })
  }

  if (!canNestInTabs(block.type) && target.container === 'tabs') {
    return insertBlockAtLocation(withoutActive, block, { container: 'root', index: withoutActive.length })
  }

  return insertBlockAtLocation(withoutActive, block, target)
}

export function addBlockToTree(blocks: Block[], block: Block, target: BlockLocation): Block[] {
  if (!canNestInSection(block.type) && target.container === 'section') {
    return insertBlockAtLocation(blocks, block, { container: 'root', index: blocks.length })
  }

  if (!canNestInCarousel(block.type) && target.container === 'carousel') {
    return insertBlockAtLocation(blocks, block, { container: 'root', index: blocks.length })
  }

  if (!canNestInTabs(block.type) && target.container === 'tabs') {
    return insertBlockAtLocation(blocks, block, { container: 'root', index: blocks.length })
  }

  return insertBlockAtLocation(blocks, block, target)
}

export function deleteBlockFromTree(blocks: Block[], id: string): Block[] {
  const { blocks: next } = extractBlockFromTree(blocks, id)

  return next
}

function updateBlockInList(blocks: Block[], id: string, props: Partial<Block['props']>): Block[] {
  return blocks.map(block => {
    if (block.id === id) {
      return { ...block, props: { ...block.props, ...props } as Block['props'] }
    }

    if (block.type === 'section' || block.type === 'carousel' || block.type === 'tabs') {
      return mapNestedChildren(block, children => updateBlockInList(children, id, props))
    }

    return block
  })
}

export function updateBlockInTree(blocks: Block[], id: string, props: Partial<Block['props']>): Block[] {
  return updateBlockInList(blocks, id, props)
}

export function getRootSortableIds(blocks: Block[]): string[] {
  return blocks.map(block => block.id)
}

export function flattenBlocks(blocks: Block[]): Block[] {
  const result: Block[] = []

  for (const block of blocks) {
    result.push(block)

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps

      result.push(
        ...flattenBlocks(props.children ?? []),
        ...flattenBlocks(props.primaryChildren ?? []),
        ...flattenBlocks(props.secondaryChildren ?? [])
      )
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        result.push(...flattenBlocks(slide.children))
      }
    }

    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        result.push(...flattenBlocks(panel.children))
      }
    }
  }

  return result
}

export function findParentSectionId(blocks: Block[], targetId: string): string | null {
  for (const block of blocks) {
    if (block.type !== 'section') {
      continue
    }

    const props = block.props as SectionBlockProps
    const columnLists = [props.children ?? [], props.primaryChildren ?? [], props.secondaryChildren ?? []]

    for (const columnChildren of columnLists) {
      if (columnChildren.some(child => child.id === targetId)) {
        return block.id
      }

      for (const child of columnChildren) {
        if (child.type === 'section') {
          const nestedSectionId = findParentSectionId([child], targetId)

          if (nestedSectionId) {
            return nestedSectionId
          }
        }
      }
    }
  }

  return null
}

export function findParentCarouselId(blocks: Block[], targetId: string): string | null {
  for (const block of blocks) {
    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        if (slide.children.some(child => child.id === targetId)) {
          return block.id
        }

        for (const child of slide.children) {
          if (child.type === 'carousel') {
            const nestedCarouselId = findParentCarouselId([child], targetId)

            if (nestedCarouselId) {
              return nestedCarouselId
            }
          }
        }
      }
    }

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps
      const columnLists = [props.children ?? [], props.primaryChildren ?? [], props.secondaryChildren ?? []]

      for (const columnChildren of columnLists) {
        for (const child of columnChildren) {
          const carouselId = findParentCarouselId([child], targetId)

          if (carouselId) {
            return carouselId
          }
        }
      }
    }
  }

  return null
}

export function findParentTabsId(blocks: Block[], targetId: string): string | null {
  for (const block of blocks) {
    if (block.type === 'tabs') {
      const props = block.props as TabsBlockProps

      for (const panel of props.tabs) {
        if (panel.children.some(child => child.id === targetId)) {
          return block.id
        }

        for (const child of panel.children) {
          if (child.type === 'tabs') {
            const nestedTabsId = findParentTabsId([child], targetId)

            if (nestedTabsId) {
              return nestedTabsId
            }
          }
        }
      }
    }

    if (block.type === 'section') {
      const props = block.props as SectionBlockProps
      const columnLists = [props.children ?? [], props.primaryChildren ?? [], props.secondaryChildren ?? []]

      for (const columnChildren of columnLists) {
        for (const child of columnChildren) {
          const tabsId = findParentTabsId([child], targetId)

          if (tabsId) {
            return tabsId
          }
        }
      }
    }

    if (block.type === 'carousel') {
      const props = block.props as CarouselBlockProps

      for (const slide of props.slides) {
        for (const child of slide.children) {
          const tabsId = findParentTabsId([child], targetId)

          if (tabsId) {
            return tabsId
          }
        }
      }
    }
  }

  return null
}
