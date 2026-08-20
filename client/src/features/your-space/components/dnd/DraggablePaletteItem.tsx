'use client'

import { useEffect, useRef } from 'react'

import { useDraggable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { PaletteItem } from '../../types'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import { useBuilder } from '../../context/BuilderContext'
import { useBuilderNestTargetsOptional } from '../../context/BuilderNestTargetsContext'
import { resolvePaletteClickTarget } from '../../utils/blockTreeUtils'
import { BlockThumbnail } from './BlockThumbnail'

type Props = {
  item: PaletteItem
  compact?: boolean
}

export function DraggablePaletteItem({ item, compact = false }: Props) {
  const theme = useTheme()
  const { blocks, selectedBlockId, addBlock } = useBuilder()
  const nestTargets = useBuilderNestTargetsOptional()
  const dragStarted = useRef(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: { source: 'palette', type: item.type, paletteId: item.id }
  })

  useEffect(() => {
    if (isDragging) {
      dragStarted.current = true
    }
  }, [isDragging])

  const handleClick = () => {
    // Ignore the click that follows a completed drag
    if (dragStarted.current) {
      dragStarted.current = false

      return
    }

    const target = resolvePaletteClickTarget(
      blocks,
      item.type,
      selectedBlockId,
      nestTargets?.hints
    )

    addBlock(item.type, target, item.id)
  }

  if (compact) {
    return (
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        title='Click to insert · drag to place'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.625,
          p: 0.875,
          cursor: isDragging ? 'grabbing' : 'pointer',
          opacity: isDragging ? 0.4 : 1,
          transition: 'box-shadow 0.15s, transform 0.15s',
          touchAction: 'none',
          ...builderSoftCardSx(theme),
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.28)}`
          }
        }}
      >
        <BlockThumbnail itemId={item.id} itemType={item.type} itemIcon={item.icon} />
        <Typography
          variant='caption'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            lineHeight: 1.2,
            textAlign: 'center',
            px: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block'
          }}
        >
          {item.label}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      title='Click to insert · drag to place'
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        cursor: isDragging ? 'grabbing' : 'pointer',
        opacity: isDragging ? 0.4 : 1,
        transition: 'box-shadow 0.15s',
        touchAction: 'none',
        ...builderSoftCardSx(theme),
        '&:hover': {
          boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.28)}`
        }
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          flexShrink: 0
        }}
      >
        <i className={item.icon} style={{ fontSize: '1.05rem' }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant='body2' sx={{ ...BUILDER_TYPOGRAPHY.label, lineHeight: 1.3 }}>
          {item.label}
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.4 }}>
          {item.description}
        </Typography>
        <Typography
          variant='caption'
          sx={{
            display: 'block',
            mt: 0.5,
            color: 'text.disabled',
            fontSize: '0.65rem',
            lineHeight: 1.3
          }}
        >
          Click to insert · drag to place
        </Typography>
      </Box>
    </Box>
  )
}
