'use client'

import { Fragment } from 'react'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { Block } from '../../types'
import type { BlockColumn } from '../../utils/blockTreeUtils'
import { insertDropId } from '../../utils/blockTreeUtils'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { SortableCanvasItem } from './SortableCanvasItem'

type RootLocation = { container: 'root' }
type SectionLocation = { container: 'section'; sectionId: string; column: BlockColumn }
type CarouselLocation = { container: 'carousel'; carouselId: string; slideId: string }
type TabsLocation = { container: 'tabs'; tabsId: string; panelId: string }

type Props = {
  blocks: Block[]
  location: RootLocation | SectionLocation | CarouselLocation | TabsLocation
  nested?: boolean
}

function getInsertId(location: RootLocation | SectionLocation | CarouselLocation | TabsLocation, index: number): string {
  if (location.container === 'root') {
    return insertDropId({ container: 'root', index })
  }

  if (location.container === 'section') {
    return insertDropId({
      container: 'section',
      sectionId: location.sectionId,
      column: location.column,
      index
    })
  }

  if (location.container === 'carousel') {
    return insertDropId({
      container: 'carousel',
      carouselId: location.carouselId,
      slideId: location.slideId,
      index
    })
  }

  return insertDropId({
    container: 'tabs',
    tabsId: location.tabsId,
    panelId: location.panelId,
    index
  })
}

export function SortableBlockList({ blocks, location, nested = false }: Props) {
  return (
    <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
      {blocks.map((block, index) => (
        <Fragment key={block.id}>
          <BlockInsertDropZone id={getInsertId(location, index)} />
          <SortableCanvasItem
            block={block}
            nested={nested}
            preferToolbarBelow={index === 0}
          />
        </Fragment>
      ))}
      <BlockInsertDropZone id={getInsertId(location, blocks.length)} />
    </SortableContext>
  )
}
