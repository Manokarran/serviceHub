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
  layout?: 'tile' | 'row'
  dragId?: string
  comfortable?: boolean
}

export function DraggablePaletteItem({ item, compact = false, layout, dragId, comfortable = false }: Props) {
  const itemLayout = layout ?? (compact ? 'tile' : 'row')
  const theme = useTheme()
  const { blocks, selectedBlockId, addBlock } = useBuilder()
  const nestTargets = useBuilderNestTargetsOptional()
  const dragStarted = useRef(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId ?? `palette-${item.id}`,
    data: { source: 'palette', type: item.type, paletteId: item.id }
  })

  useEffect(() => {
    if (isDragging) {
      dragStarted.current = true
    }
  }, [isDragging])

  const handleClick = () => {
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

  if (itemLayout === 'tile') {
    return (
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        title={`${item.label} · Click to insert, drag to place`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: comfortable ? 0.75 : 0.5,
          p: comfortable ? 1.125 : 0.75,
          minWidth: 0,
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
        <BlockThumbnail itemId={item.id} itemType={item.type} itemIcon={item.icon} height={comfortable ? 58 : 48} />
        <Typography
          variant='caption'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            fontSize: comfortable ? '0.75rem' : '0.6875rem',
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1.25,
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
      title={`${item.label} · Click to insert, drag to place`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: comfortable ? 1.25 : 1,
        px: comfortable ? 1.125 : 0.875,
        py: comfortable ? 0.875 : 0.625,
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
          width: comfortable ? 30 : 26,
          height: comfortable ? 30 : 26,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
          flexShrink: 0
        }}
      >
        <i className={item.icon} style={{ fontSize: '0.85rem' }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant='body2' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }} noWrap>
          {item.label}
        </Typography>
      </Box>
    </Box>
  )
}
