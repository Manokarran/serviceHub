'use client'

import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { useBuilderOptional } from '../../context/BuilderContext'
import { useCanvasBlockEdit } from './CanvasBlockEditContext'

type Props = {
  value: string
  field?: string
  onCommit?: (value: string) => void
  multiline?: boolean
  sx?: Record<string, unknown>
  placeholder?: string
}

export function InlineEditableText({ value, field, onCommit, multiline = false, sx, placeholder }: Props) {
  const theme = useTheme()
  const editContext = useCanvasBlockEdit()
  const builder = useBuilderOptional()
  const isBlockSelected = editContext && builder ? builder.selectedBlockId === editContext.blockId : false
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

  useEffect(() => {
    if (!editContext) {
      return
    }

    if (isEditing) {
      editContext.setInlineEditingField(field ?? 'text')
    } else {
      editContext.setInlineEditingField(null)
    }

    return () => {
      editContext.setInlineEditingField(null)
    }
  }, [editContext, field, isEditing])

  if (!editContext) {
    return <Box component='span' sx={sx}>{value}</Box>
  }

  const commit = () => {
    setIsEditing(false)
    const trimmed = draft.trim()
    const next = trimmed || placeholder || value

    if (next !== value) {
      if (onCommit) {
        onCommit(next)
      } else if (field) {
        editContext.updateProps({ [field]: next })
      }
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

  const handleTextClick = (e: MouseEvent) => {
    if (!builder || !editContext || builder.mode !== 'edit') {
      return
    }

    e.stopPropagation()

    if (builder.selectedBlockId !== editContext.blockId) {
      builder.selectBlock(editContext.blockId)
    }

    startEditing(e)
  }

  return (
    <Box
      component='span'
      onClick={handleTextClick}
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
