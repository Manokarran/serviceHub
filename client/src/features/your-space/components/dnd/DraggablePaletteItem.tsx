'use client'

import { useDraggable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { PaletteItem } from '../../types'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'

type Props = {
  item: PaletteItem
  compact?: boolean
}

export function DraggablePaletteItem({ item, compact = false }: Props) {
  const theme = useTheme()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: { source: 'palette', type: item.type, paletteId: item.id }
  })

  if (compact) {
    return (
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.625,
          p: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.4 : 1,
          transition: 'box-shadow 0.15s, transform 0.15s',
          touchAction: 'none',
          ...builderSoftCardSx(theme),
          '&:hover': {
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 0.875,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            flexShrink: 0
          }}
        >
          <i className={item.icon} style={{ fontSize: '0.9rem' }} />
        </Box>
        <Typography variant='caption' sx={{ ...BUILDER_TYPOGRAPHY.label, lineHeight: 1.2, textAlign: 'center' }}>
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
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : 1,
        transition: 'box-shadow 0.15s',
        touchAction: 'none',
        ...builderSoftCardSx(theme)
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
      <Box sx={{ minWidth: 0 }}>
        <Typography variant='body2' sx={{ ...BUILDER_TYPOGRAPHY.label, lineHeight: 1.3 }}>
          {item.label}
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.4 }}>
          {item.description}
        </Typography>
      </Box>
    </Box>
  )
}
