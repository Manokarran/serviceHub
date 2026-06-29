'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block } from '../../types'
import { builderContainerChromeSx } from '../../utils/builderContainerChrome'
import { insertDropId, carouselDropId } from '../../utils/blockTreeUtils'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { SortableBlockList } from './SortableBlockList'

type Props = {
  carouselId: string
  slideId: string
  children: Block[]
  editMode: boolean
  emptyLabel: string
}

export function CarouselDropZone({ carouselId, slideId, children, editMode, emptyLabel }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const isDragging = Boolean(active)
  const { setNodeRef, isOver } = useDroppable({ id: carouselDropId(carouselId, slideId) })
  const location = { container: 'carousel' as const, carouselId, slideId }
  const isEmpty = children.length === 0

  if (!editMode) {
    return (
      <>
        {children.map(child => (
          <BlockRenderer key={child.id} block={child} preview />
        ))}
      </>
    )
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: isEmpty ? 120 : 56,
        height: isEmpty ? '100%' : undefined,
        flex: isEmpty ? 1 : undefined,
        ...builderContainerChromeSx(theme, { isOver, isDragging }),
        ...(!(isDragging && isOver) ? { backgroundColor: alpha(theme.palette.text.primary, 0.02) } : {}),
        p: isEmpty ? 2 : 0.75
      }}
    >
      {isEmpty ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 96,
            color: 'text.disabled',
            textAlign: 'center',
            px: 2
          }}
        >
          <BlockInsertDropZone id={insertDropId({ ...location, index: 0 })} />
          <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>{emptyLabel}</Typography>
        </Box>
      ) : (
        <SortableBlockList blocks={children} location={location} nested />
      )}
    </Box>
  )
}
