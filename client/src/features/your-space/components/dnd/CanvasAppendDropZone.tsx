'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderContainerBorderColor } from '../../utils/builderContainerChrome'

type Props = {
  index: number
}

/** Tall end-of-page append target so long pages stay easy to extend. */
export function CanvasAppendDropZone({ index }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const isDragging = Boolean(active)
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-append-zone',
    data: { container: 'root', index }
  })

  if (!isDragging) {
    return (
      <Box
        ref={setNodeRef}
        sx={{
          mt: 2,
          mb: 1,
          mx: 1.5,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          border: `1px dashed ${alpha(theme.palette.text.primary, 0.12)}`,
          color: 'text.disabled'
        }}
      >
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 500, color: 'inherit' }}>
          Drop blocks here to add at the end of the page
        </Typography>
      </Box>
    )
  }

  const borderColor = builderContainerBorderColor(theme, isOver)

  return (
    <Box
      ref={setNodeRef}
      sx={{
        mt: 2,
        mb: 3,
        mx: 1.5,
        minHeight: isOver ? 96 : 72,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        borderRadius: 1,
        border: `2px dashed ${borderColor}`,
        backgroundColor: isOver
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.primary.main, 0.04),
        color: isOver ? 'primary.main' : 'text.secondary',
        transition: 'min-height 0.15s ease, background-color 0.15s ease, border-color 0.15s ease'
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, isOver ? 0.18 : 0.1),
          color: 'primary.main'
        }}
      >
        <i className='ri-add-line' style={{ fontSize: '1.15rem' }} />
      </Box>
      <Typography sx={{ ...BUILDER_TYPOGRAPHY.title, color: 'inherit', fontSize: '0.8rem' }}>
        {isOver ? 'Release to add at end of page' : 'Drop here to add at end of page'}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', lineHeight: 1.3 }}>
        Keeps long pages easy to extend without scrolling back up
      </Typography>
    </Box>
  )
}
