'use client'

import { useRef, type RefObject } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

import { useBuilder } from '../../context/BuilderContext'
import { useBuilderShell } from '../../context/BuilderShellContext'
import { BUILDER_Z_INDEX } from '../../constants/builderLayout'
import type { Block } from '../../types'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { CanvasBlockEditProvider, useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { BlockInlineToolbar } from '../inline/BlockInlineToolbar'
import { useSmartInlineToolbarPlacement } from '../inline/useSmartInlineToolbarPlacement'

type Props = {
  block: Block
  nested?: boolean
  preview?: boolean
  preferToolbarBelow?: boolean
}

function SelectedBlockToolbar({
  block,
  nested,
  blockRef,
  onDelete,
  dragHandleProps,
  preferToolbarBelow = false
}: {
  block: Block
  nested: boolean
  blockRef: RefObject<HTMLElement | null>
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
  preferToolbarBelow?: boolean
}) {
  const editContext = useCanvasBlockEdit()
  const isInlineEditing = Boolean(editContext?.inlineEditingField)
  const toolbarPlacement = useSmartInlineToolbarPlacement(
    blockRef,
    block,
    true,
    isInlineEditing,
    preferToolbarBelow
  )

  return (
    <Box
      className='block-inline-toolbar'
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: BUILDER_Z_INDEX.blockToolbar,
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' }
      }}
    >
      <BlockInlineToolbar
        block={block}
        nested={nested}
        toolbarPlacement={toolbarPlacement}
        onDelete={onDelete}
        dragHandleProps={dragHandleProps}
      />
    </Box>
  )
}

export function SortableCanvasItem({
  block,
  nested = false,
  preview = false,
  preferToolbarBelow = false
}: Props) {
  const { selectedBlockId, mode, selectBlock, deleteBlock, updateBlock } = useBuilder()
  const shell = useBuilderShell()
  const blockRef = useRef<HTMLElement | null>(null)
  const isSelected = selectedBlockId === block.id
  const isEditMode = mode === 'edit'

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { source: 'canvas', type: block.type, blockId: block.id }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const setBlockRef = (node: HTMLElement | null) => {
    setNodeRef(node)
    blockRef.current = node
  }

  if (preview) {
    return <BlockRenderer block={block} preview />
  }

  return (
    <Box
      ref={setBlockRef}
      style={style}
      onClick={e => {
        e.stopPropagation()
        if (isEditMode) {
          selectBlock(block.id)
          shell?.openPropertyPanel()
        }
      }}
      sx={{
        position: 'relative',
        overflow: 'visible',
        opacity: isDragging ? 0.5 : 1,
        zIndex: isSelected
          ? BUILDER_Z_INDEX.canvasBlockSelected
          : isDragging
            ? BUILDER_Z_INDEX.canvasBlockDragging
            : undefined,
        outline: isEditMode && isSelected ? '2px solid' : '2px solid transparent',
        outlineColor: isEditMode && isSelected ? 'primary.main' : 'transparent',
        outlineOffset: -2,
        ...(isEditMode && !isSelected
          ? {
              '&:hover': {
                zIndex: BUILDER_Z_INDEX.canvasBlockHover
              }
            }
          : {}),
        '&:hover .block-inline-toolbar': isEditMode && !isSelected ? { opacity: 1, pointerEvents: 'auto' } : {}
      }}
    >
      <CanvasBlockEditProvider block={block} updateProps={changes => updateBlock(block.id, changes)}>
        <BlockRenderer block={block} preview={mode === 'preview'} />
        {isEditMode && isSelected && (
          <SelectedBlockToolbar
            block={block}
            nested={nested}
            blockRef={blockRef}
            onDelete={() => deleteBlock(block.id)}
            dragHandleProps={{ ...attributes, ...listeners }}
            preferToolbarBelow={preferToolbarBelow}
          />
        )}
      </CanvasBlockEditProvider>
      {isEditMode && !isSelected && (
        <Box
          className='block-inline-toolbar'
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: BUILDER_Z_INDEX.blockToolbar,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.15s'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              ...(preferToolbarBelow
                ? {
                    top: 'auto',
                    bottom: -8,
                    transform: 'translate(-50%, 100%)'
                  }
                : {
                    top: -8,
                    transform: 'translate(-50%, -100%)'
                  }),
              zIndex: BUILDER_Z_INDEX.blockToolbar,
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              px: 0.75,
              py: 0.375,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              boxShadow: 1
            }}
            onClick={e => {
              e.stopPropagation()
              selectBlock(block.id)
              shell?.openPropertyPanel()
            }}
          >
            <Tooltip title='Select block'>
              <IconButton size='small' sx={{ width: 24, height: 24 }}>
                <i className='ri-focus-3-line' style={{ fontSize: '0.8rem' }} />
              </IconButton>
            </Tooltip>
            <Box
              {...attributes}
              {...listeners}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 0.5,
                cursor: 'grab',
                touchAction: 'none',
                color: 'text.secondary'
              }}
            >
              <i className='ri-draggable' style={{ fontSize: '0.85rem' }} />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
