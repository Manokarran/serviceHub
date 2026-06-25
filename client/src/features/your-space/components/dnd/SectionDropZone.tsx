'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block, SectionBlockProps } from '../../types'
import type { BlockColumn } from '../../utils/blockTreeUtils'
import {
  getSectionColumnBackground,
  getBlockBackgroundOpacity,
  applyBackgroundAlpha,
  isMediaBackground,
  isSimpleColor
} from '../../utils/sectionStyleHelpers'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { SortableBlockList } from './SortableBlockList'
import { insertDropId, sectionDropId } from '../../utils/blockTreeUtils'

type Props = {
  sectionId: string
  column: BlockColumn
  children: Block[]
  sectionProps: SectionBlockProps
  editMode: boolean
  emptyLabel: string
}

export function SectionDropZone({ sectionId, column, children, sectionProps, editMode, emptyLabel }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const isDragging = Boolean(active)
  const { setNodeRef, isOver } = useDroppable({ id: sectionDropId(sectionId, column) })
  const columnBg = getSectionColumnBackground(sectionProps, column === 'default' ? 'primary' : column)
  const splitStyle = sectionProps.splitStyle ?? 'gap'
  const showBuilderChrome = editMode && splitStyle !== 'contrast'
  const backgroundOpacity = getBlockBackgroundOpacity(sectionProps)
  const isTransparentSection = backgroundOpacity < 100
  const hasMediaBackground = isMediaBackground(sectionProps)
  const location = { container: 'section' as const, sectionId, column }
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
        borderRadius: sectionProps.borderRadius ? Math.max(0, sectionProps.borderRadius - 4) : 1,
        border: showBuilderChrome ? '1px dashed' : '1px solid transparent',
        borderColor:
          isDragging && isOver
            ? alpha(theme.palette.primary.main, 0.45)
            : showBuilderChrome
              ? alpha(theme.palette.primary.main, 0.14)
              : 'transparent',
        ...(columnBg
          ? isSimpleColor(columnBg)
            ? { backgroundColor: applyBackgroundAlpha(columnBg, backgroundOpacity) }
            : {}
          : hasMediaBackground || isTransparentSection
            ? { backgroundColor: 'transparent' }
            : showBuilderChrome
              ? { backgroundColor: alpha(theme.palette.text.primary, 0.02) }
              : { backgroundColor: 'transparent' }),
        transition: 'border-color 0.15s, background-color 0.15s',
        ...(isDragging && isOver
          ? { backgroundColor: alpha(theme.palette.primary.main, 0.06) }
          : {}),
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
