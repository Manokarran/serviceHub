'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block } from '../../types'
import { builderContainerChromeSx } from '../../utils/builderContainerChrome'
import { insertDropId, tabsDropId } from '../../utils/blockTreeUtils'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { DropTargetCue } from './DropTargetCue'
import { SortableBlockList } from './SortableBlockList'

type Props = {
  tabsId: string
  panelId: string
  panelLabel: string
  children: Block[]
  editMode: boolean
  emptyLabel: string
}

export function TabsDropZone({
  tabsId,
  panelId,
  panelLabel,
  children,
  editMode,
  emptyLabel
}: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const isDragging = Boolean(active)
  const { setNodeRef, isOver } = useDroppable({
    id: tabsDropId(tabsId, panelId),
    data: { container: 'tabs', tabsId, panelId }
  })
  const location = { container: 'tabs' as const, tabsId, panelId }
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
        width: '100%',
        minHeight: isEmpty ? 140 : 56,
        height: isEmpty ? '100%' : undefined,
        flex: isEmpty ? 1 : undefined,
        ...builderContainerChromeSx(theme, { isOver, isDragging }),
        ...(!(isDragging && isOver) && !isDragging
          ? { backgroundColor: alpha(theme.palette.text.primary, 0.02) }
          : {}),
        p: isEmpty ? 2 : 0.75
      }}
    >
      {isDragging && isOver && <DropTargetCue label={`Drop in ${panelLabel}`} emphasized />}
      {isEmpty ? (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: 112,
            color: isOver ? 'primary.main' : 'text.disabled',
            textAlign: 'center',
            px: 2
          }}
        >
          <BlockInsertDropZone
            id={insertDropId({ ...location, index: 0 })}
            location={location}
            index={0}
            fill={isDragging}
          />
          <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5, position: 'relative', zIndex: 0, fontWeight: isOver ? 700 : 400 }}>
            {isDragging
              ? isOver
                ? `Release to place in ${panelLabel}`
                : panelLabel
              : emptyLabel}
          </Typography>
        </Box>
      ) : (
        <SortableBlockList blocks={children} location={location} nested />
      )}
    </Box>
  )
}
