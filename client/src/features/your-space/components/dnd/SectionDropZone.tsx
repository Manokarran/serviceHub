'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getSectionColumnShortLabel, type SectionSplitColumn } from '../../constants/sectionLayout'
import type { Block, SectionBlockProps } from '../../types'
import type { BlockColumn } from '../../utils/blockTreeUtils'
import {
  getSectionColumnBackground,
  getBlockBackgroundOpacity,
  applyBackgroundAlpha,
  isMediaBackground,
  isSimpleColor
} from '../../utils/sectionStyleHelpers'
import { useBuilderNestTargetsOptional } from '../../context/BuilderNestTargetsContext'
import { builderContainerChromeSx } from '../../utils/builderContainerChrome'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { DropTargetCue } from './DropTargetCue'
import { SortableBlockList } from './SortableBlockList'
import { sectionDropId } from '../../utils/blockTreeUtils'

type Props = {
  sectionId: string
  column: BlockColumn
  children: Block[]
  sectionProps: SectionBlockProps
  editMode: boolean
  emptyLabel: string
}

function resolveContrastColumn(column: BlockColumn): SectionSplitColumn | 'default' {
  if (column === 'default') {
    return 'default'
  }

  return column
}

export function SectionDropZone({ sectionId, column, children, sectionProps, editMode, emptyLabel }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const nestTargets = useBuilderNestTargetsOptional()
  const isDragging = Boolean(active)
  const droppableId = sectionDropId(sectionId, column)
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { container: 'section', sectionId, column }
  })
  const columnBg = getSectionColumnBackground(sectionProps, resolveContrastColumn(column))
  const splitStyle = sectionProps.splitStyle ?? 'gap'
  const showBuilderChrome = editMode && splitStyle !== 'contrast'
  const backgroundOpacity = getBlockBackgroundOpacity(sectionProps)
  const isTransparentSection = backgroundOpacity < 100
  const hasMediaBackground = isMediaBackground(sectionProps)
  const location = { container: 'section' as const, sectionId, column }
  const isEmpty = children.length === 0
  const isStacked = sectionProps.layout === 'split-vertical'
  const columnLabel =
    column === 'default'
      ? 'section'
      : getSectionColumnShortLabel(sectionProps.layout ?? 'default', column)

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
      data-builder-section-id={sectionId}
      data-builder-section-column={column}
      onPointerEnter={() => {
        nestTargets?.setNestTarget(sectionId, {
          kind: 'section',
          column,
          label: columnLabel
        })
      }}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: isEmpty ? (isStacked ? 100 : 120) : 56,
        height: isEmpty ? '100%' : undefined,
        flex: isEmpty ? 1 : undefined,
        alignSelf: isEmpty ? 'stretch' : undefined,
        ...(showBuilderChrome
          ? builderContainerChromeSx(theme, { isOver, isDragging })
          : { border: '1px solid transparent', borderRadius: '1px' }),
        ...(columnBg
          ? isSimpleColor(columnBg)
            ? { backgroundColor: applyBackgroundAlpha(columnBg, backgroundOpacity) }
            : {}
          : hasMediaBackground || isTransparentSection
            ? { backgroundColor: 'transparent' }
            : showBuilderChrome && !(isDragging && isOver)
              ? { backgroundColor: alpha(theme.palette.text.primary, 0.02) }
              : { backgroundColor: 'transparent' }),
        // Quiet sibling zones while dragging; only the active target lights up
        ...(isDragging && !isOver
          ? {
              borderColor: alpha(theme.palette.primary.main, 0.12),
              backgroundColor: alpha(theme.palette.text.primary, 0.015),
              boxShadow: 'none',
              opacity: 0.72
            }
          : {}),
        p: isEmpty ? 2 : 0.75,
        transition: 'opacity 0.14s ease, background-color 0.14s ease, border-color 0.14s ease'
      }}
    >
      {isDragging && isOver && <DropTargetCue label={`Drop in ${columnLabel}`} emphasized />}
      {isEmpty ? (
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: isStacked ? 80 : 96,
            color: isOver ? 'primary.main' : 'text.disabled',
            textAlign: 'center',
            px: 2
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5, fontWeight: isOver ? 700 : 400 }}>
            {isDragging
              ? isOver
                ? `Release to place in ${columnLabel}`
                : columnLabel
              : emptyLabel}
          </Typography>
        </Box>
      ) : (
        <SortableBlockList blocks={children} location={location} nested />
      )}
    </Box>
  )
}
