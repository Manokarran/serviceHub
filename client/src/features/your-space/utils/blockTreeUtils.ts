import type { Block, BlockType, SectionBlockProps } from '../types'

export type BlockColumn = 'default' | 'primary' | 'secondary'

export type BlockLocation =
  | { container: 'root'; index: number }
  | { container: 'section'; sectionId: string; column: BlockColumn; index: number }

/** Blocks allowed inside a section (including nested sections) */
export const SECTION_CHILD_TYPES: BlockType[] = ['section', 'heading', 'text', 'button', 'image', 'video', 'logo']

/** Full-width blocks that must stay at the page root */
export const ROOT_ONLY_BLOCK_TYPES: BlockType[] = ['header', 'footer', 'hero']

export function canNestInSection(type: BlockType): boolean {
  return SECTION_CHILD_TYPES.includes(type)
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

export function sectionDropId(sectionId: string, column: BlockColumn = 'default'): string {
  return column === 'default' ? `section-drop:${sectionId}` : `section-drop:${sectionId}:${column}`
}

export function insertDropId(location: BlockLocation): string {
  if (location.container === 'root') {
    return `insert:root:${location.index}`
  }

  return `insert:section:${location.sectionId}:${location.column}:${location.index}`
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

function updateSectionById(
  blocks: Block[],
  sectionId: string,
  updater: (props: SectionBlockProps) => SectionBlockProps
): Block[] {
  return blocks.map(block => {
    if (block.id === sectionId && block.type === 'section') {
      return { ...block, props: updater(block.props as SectionBlockProps) }
    }

    if (block.type !== 'section') {
      return block
    }

    return mapSectionColumns(block, children => updateSectionById(children, sectionId, updater))
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
  }

  return null
}

function findBlockLocationInList(
  blocks: Block[],
  id: string,
  parent?: { sectionId: string; column: BlockColumn }
): BlockLocation | null {
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]

    if (block.id === id) {
      if (parent) {
        return { container: 'section', sectionId: parent.sectionId, column: parent.column, index }
      }

      return { container: 'root', index }
    }

    if (block.type === 'section') {
      for (const column of ['default', 'primary', 'secondary'] as BlockColumn[]) {
        const found = findBlockLocationInList(getSectionColumnChildren(block, column), id, {
          sectionId: block.id,
          column
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

export function insertBlockAtLocation(blocks: Block[], block: Block, location: BlockLocation): Block[] {
  if (location.container === 'root') {
    const next = [...blocks]

    next.splice(location.index, 0, block)

    return next
  }

  return updateSectionById(blocks, location.sectionId, props => {
    const children = getSectionColumnChildren({ type: 'section', id: location.sectionId, props }, location.column)
    const nextChildren = [...children]

    nextChildren.splice(location.index, 0, block)

    return setSectionColumnChildren(props, location.column, nextChildren)
  })
}

function getInsertIndexAfterBlock(blocks: Block[], blockId: string): BlockLocation {
  const location = findBlockLocation(blocks, blockId)

  if (!location) {
    return { container: 'root', index: blocks.length }
  }

  return { ...location, index: location.index + 1 }
}

export function resolveDropTarget(
  blocks: Block[],
  overId: string | number,
  movingBlock?: Block | BlockType
): BlockLocation {
  const movingType = typeof movingBlock === 'string' ? movingBlock : movingBlock?.type
  const insertTarget = parseInsertDropId(overId)

  if (insertTarget) {
    return insertTarget
  }

  if (overId === 'canvas-drop-zone') {
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

  const overBlock = findBlockInTree(blocks, String(overId))

  if (overBlock?.type === 'section') {
    const props = overBlock.props as SectionBlockProps
    const column = props.layout === 'default' ? 'default' : 'primary'
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

  const overLocation = findBlockLocation(blocks, String(overId))

  if (overLocation) {
    return overLocation
  }

  return { container: 'root', index: blocks.length }
}

export function moveBlockInTree(blocks: Block[], activeId: string, overId: string | number): Block[] {
  if (activeId === String(overId)) {
    return blocks
  }

  const { blocks: withoutActive, block } = extractBlockFromTree(blocks, activeId)

  if (!block) {
    return blocks
  }

  const target = resolveDropTarget(withoutActive, overId, block)

  if (!canNestInSection(block.type) && target.container === 'section') {
    return insertBlockAtLocation(withoutActive, block, { container: 'root', index: withoutActive.length })
  }

  return insertBlockAtLocation(withoutActive, block, target)
}

export function addBlockToTree(blocks: Block[], block: Block, target: BlockLocation): Block[] {
  if (!canNestInSection(block.type) && target.container === 'section') {
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

    if (block.type !== 'section') {
      return block
    }

    return mapSectionColumns(block, children => updateBlockInList(children, id, props))
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
