'use client'

import { useState, type MouseEvent } from 'react'

import { useDndContext, useDroppable } from '@dnd-kit/core'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_Z_INDEX } from '../../constants/builderLayout'
import { builderContainerBorderColor } from '../../utils/builderContainerChrome'
import type { QuickAddLocation } from '../../utils/quickAddHelpers'
import { BlockQuickAddPicker } from './BlockQuickAddPicker'

type Props = {
  id: string
  location: QuickAddLocation
  index: number
  /** Fill the parent column/slot so empty containers are easy drop targets. */
  fill?: boolean
}

export function BlockInsertDropZone({ id, location, index, fill = false }: Props) {
  const theme = useTheme()
  const { active } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({ id })
  const isDragging = Boolean(active)
  const [hovered, setHovered] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const pickerOpen = Boolean(anchorEl)

  const openPicker = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const closePicker = () => {
    setAnchorEl(null)
    setHovered(false)
  }

  if (isDragging) {
    const borderColor = builderContainerBorderColor(theme, isOver)

    if (fill) {
      return (
        <Box
          ref={setNodeRef}
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1px',
            transition: 'background-color 0.14s ease, box-shadow 0.14s ease',
            backgroundColor: isOver ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
            boxShadow: isOver ? `inset 0 0 0 2px ${borderColor}` : 'none'
          }}
        />
      )
    }

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
          backgroundColor: isOver
            ? alpha(theme.palette.primary.main, 0.2)
            : alpha(theme.palette.primary.main, 0.07),
          boxShadow: `inset 0 0 0 1px ${borderColor}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 16,
            right: 16,
            height: isOver ? 2 : 1,
            borderRadius: '1px',
            backgroundColor: isOver
              ? theme.palette.primary.main
              : alpha(theme.palette.primary.main, 0.45),
            transition: 'height 0.14s ease, background-color 0.14s ease'
          }
        }}
      />
    )
  }

  if (fill) {
    return <Box ref={setNodeRef} sx={{ display: 'none' }} aria-hidden />
  }

  const showControls = hovered || pickerOpen

  return (
    <>
      <Box
        ref={setNodeRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          if (!pickerOpen) {
            setHovered(false)
          }
        }}
        sx={{
          position: 'relative',
          zIndex: showControls ? BUILDER_Z_INDEX.blockInsert : 1,
          height: showControls ? 28 : 10,
          my: showControls ? 0.25 : 0,
          mx: 0.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'height 0.14s ease, margin 0.14s ease'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 12,
            right: 12,
            height: 1,
            borderRadius: 1,
            backgroundColor: showControls
              ? alpha(theme.palette.primary.main, 0.35)
              : 'transparent',
            transition: 'background-color 0.14s ease'
          }}
        />
        <Tooltip title='Add block' placement='top' disableInteractive>
          <Box
            component='button'
            type='button'
            aria-label='Add block here'
            onClick={openPicker}
            sx={{
              position: 'relative',
              zIndex: 1,
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: `1px solid ${alpha(theme.palette.primary.main, showControls ? 0.45 : 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: showControls ? 1 : 0,
              transform: showControls ? 'scale(1)' : 'scale(0.85)',
              transition: 'opacity 0.14s ease, transform 0.14s ease, background-color 0.14s ease',
              backgroundColor: showControls ? theme.palette.primary.main : 'background.paper',
              color: showControls ? theme.palette.primary.contrastText : 'primary.main',
              boxShadow: showControls
                ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.35)}`
                : 'none',
              p: 0,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                color: theme.palette.primary.contrastText
              }
            }}
          >
            <i className='ri-add-line' style={{ fontSize: '0.85rem' }} />
          </Box>
        </Tooltip>
      </Box>
      <BlockQuickAddPicker
        anchorEl={anchorEl}
        open={pickerOpen}
        onClose={closePicker}
        location={location}
        index={index}
        title='Add block here'
      />
    </>
  )
}
