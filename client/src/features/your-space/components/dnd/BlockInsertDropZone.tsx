'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

type Props = {
  id: string
}

export function BlockInsertDropZone({ id }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({ id })
  const isDragging = Boolean(active)

  if (!isDragging) {
    return <Box ref={setNodeRef} sx={{ height: 0 }} aria-hidden />
  }

  return (
    <Box
      ref={setNodeRef}
      aria-hidden
      sx={{
        height: isOver ? 28 : 12,
        my: 0.25,
        mx: 1,
        borderRadius: 1,
        transition: 'height 0.12s ease, background-color 0.12s ease, box-shadow 0.12s ease',
        backgroundColor: isOver ? alpha(theme.palette.primary.main, 0.28) : alpha(theme.palette.primary.main, 0.06),
        boxShadow: isOver ? `inset 0 0 0 2px ${alpha(theme.palette.primary.main, 0.55)}` : 'none'
      }}
    />
  )
}
