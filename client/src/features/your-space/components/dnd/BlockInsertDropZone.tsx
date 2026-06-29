'use client'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { builderContainerBorderColor } from '../../utils/builderContainerChrome'

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

  const borderColor = builderContainerBorderColor(theme, isOver)

  return (
    <Box
      ref={setNodeRef}
      aria-hidden
      sx={{
        position: 'relative',
        height: isOver ? 44 : 22,
        my: 0.5,
        mx: 0.75,
        borderRadius: '1px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'height 0.14s ease, background-color 0.14s ease, box-shadow 0.14s ease',
        backgroundColor: isOver ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.07),
        boxShadow: `inset 0 0 0 1px ${borderColor}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 16,
          right: 16,
          height: isOver ? 2 : 1,
          borderRadius: '1px',
          backgroundColor: isOver ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.45),
          transition: 'height 0.14s ease, background-color 0.14s ease'
        }
      }}
    />
  )
}
