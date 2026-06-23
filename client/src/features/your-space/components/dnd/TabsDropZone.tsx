'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block } from '../../types'
import { insertDropId, tabsDropId } from '../../utils/blockTreeUtils'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { SortableBlockList } from './SortableBlockList'

type Props = {
  tabsId: string
  panelId: string
  children: Block[]
  editMode: boolean
  emptyLabel: string
}

export function TabsDropZone({ tabsId, panelId, children, editMode, emptyLabel }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const isDragging = Boolean(active)
  const { setNodeRef, isOver } = useDroppable({ id: tabsDropId(tabsId, panelId) })
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
        minHeight: isEmpty ? 120 : 48,
        height: isEmpty ? '100%' : undefined,
        flex: isEmpty ? 1 : undefined,
        borderRadius: 1,
        border: '1px dashed',
        borderColor: isDragging && isOver ? alpha(theme.palette.primary.main, 0.45) : alpha(theme.palette.primary.main, 0.14),
        backgroundColor: isDragging && isOver ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
        transition: 'border-color 0.15s, background-color 0.15s',
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
