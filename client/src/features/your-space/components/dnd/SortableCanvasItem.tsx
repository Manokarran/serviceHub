'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { useBuilder } from '../../context/BuilderContext'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import type { Block } from '../../types'
import { BlockRenderer, getBlockLabel } from '../blocks/BlockRenderer'

type Props = {
  block: Block
  nested?: boolean
  preview?: boolean
}

export function SortableCanvasItem({ block, nested = false, preview = false }: Props) {
  const { selectedBlockId, mode, selectBlock, deleteBlock } = useBuilder()
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

  if (preview) {
    return <BlockRenderer block={block} preview />
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={e => {
        e.stopPropagation()
        if (isEditMode) {
          selectBlock(block.id)
        }
      }}
      sx={{
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        outline: isEditMode && isSelected ? '2px solid' : '2px solid transparent',
        outlineColor: isEditMode && isSelected ? 'primary.main' : 'transparent',
        outlineOffset: -2,
        '&:hover .block-toolbar': isEditMode ? { opacity: 1 } : {}
      }}
    >
      {isEditMode && (
        <Box
          className='block-toolbar'
          sx={{
            position: 'absolute',
            top: nested ? 4 : 8,
            right: nested ? 4 : 8,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            opacity: isSelected ? 1 : 0,
            transition: 'opacity 0.15s',
            backgroundColor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            px: 0.5,
            py: 0.25
          }}
        >
          <Box
            {...attributes}
            {...listeners}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              cursor: 'grab',
              touchAction: 'none',
              color: 'text.secondary'
            }}
          >
            <i className='ri-draggable' style={{ fontSize: '1rem' }} />
            <Typography variant='caption' sx={BUILDER_TYPOGRAPHY.label}>
              {getBlockLabel(block.type)}
            </Typography>
          </Box>
          <Tooltip title='Delete'>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                deleteBlock(block.id)
              }}
            >
              <i className='ri-delete-bin-line' style={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <BlockRenderer block={block} preview={mode === 'preview'} />
    </Box>
  )
}
