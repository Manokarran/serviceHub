'use client'

import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { useBuilder } from '../../context/BuilderContext'
import { useCanvasBlockEdit } from './CanvasBlockEditContext'

type Props = {
  value: string
  field: 'text'
  multiline?: boolean
  sx?: Record<string, unknown>
  placeholder?: string
}

export function InlineEditableText({ value, field, multiline = false, sx, placeholder }: Props) {
  const theme = useTheme()
  const editContext = useCanvasBlockEdit()
  const { selectedBlockId } = useBuilder()
  const isBlockSelected = editContext ? selectedBlockId === editContext.blockId : false
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing) {
      setDraft(value)
    }
  }, [value, isEditing])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  if (!editContext) {
    return <Box component='span' sx={sx}>{value}</Box>
  }

  const commit = () => {
    setIsEditing(false)
    const trimmed = draft.trim()

    if (trimmed !== value) {
      editContext.updateProps({ [field]: trimmed || placeholder || value })
    }
  }

  const cancel = () => {
    setDraft(value)
    setIsEditing(false)
  }

  if (isEditing) {
    const sharedSx = {
      ...sx,
      width: '100%',
      border: 'none',
      outline: 'none',
      resize: 'none' as const,
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
      borderRadius: 0.5,
      px: 0.5,
      py: 0.25,
      font: 'inherit',
      color: 'inherit',
      lineHeight: 'inherit',
      letterSpacing: 'inherit',
      textAlign: 'inherit'
    }

    if (multiline) {
      return (
        <Box
          component='textarea'
          ref={inputRef as RefObject<HTMLTextAreaElement>}
          value={draft}
          rows={4}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              e.preventDefault()
              cancel()
            }
          }}
          sx={sharedSx}
        />
      )
    }

    return (
      <Box
        component='input'
        ref={inputRef as RefObject<HTMLInputElement>}
        type='text'
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }

          if (e.key === 'Escape') {
            e.preventDefault()
            cancel()
          }
        }}
        sx={sharedSx}
      />
    )
  }

  const startEditing = (e: MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  return (
    <Box
      component='span'
      onClick={e => {
        if (isBlockSelected) {
          startEditing(e)
        }
      }}
      onDoubleClick={startEditing}
      sx={{
        ...sx,
        cursor: 'text',
        borderRadius: 0.5,
        transition: 'background-color 0.12s',
        ...(isBlockSelected && {
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.06)
          }
        })
      }}
    >
      {value || placeholder}
    </Box>
  )
}
