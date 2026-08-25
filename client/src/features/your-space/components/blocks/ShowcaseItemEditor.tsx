'use client'

import { useRef, type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { useBuilderOptional } from '../../context/BuilderContext'
import { useBuilderShell } from '../../context/BuilderShellContext'
import type { ShowcaseItem } from '../../types'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { ShowcaseItemFields } from '../property/blocks/ShowcaseItemFields'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  item: ShowcaseItem
  index: number
  onChange: (changes: Partial<ShowcaseItem>) => void
  children: ReactNode
}

export function ShowcaseItemEditor({ item, index, onChange, children }: Props) {
  const theme = useTheme()
  const editContext = useCanvasBlockEdit()
  const builder = useBuilderOptional()
  const shell = useBuilderShell()
  const siteStyles = useSiteStyles()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const isEditMode = Boolean(editContext) && builder?.mode === 'edit'
  const isSelected =
    isEditMode &&
    builder?.selectedBlockId === editContext?.blockId &&
    builder?.selectedNestedItemId === item.id
  const isInlineEditing = Boolean(editContext?.inlineEditingField)
  const label = `Panel ${index + 1}`

  if (!isEditMode) {
    return children
  }

  const selectThisPanel = () => {
    if (!editContext || !builder) {
      return
    }

    builder.selectBlock(editContext.blockId)
    builder.selectNestedItem(item.id)
    shell?.openPropertyPanel('design')
  }

  return (
    <Box
      ref={cardRef}
      onClick={event => {
        event.stopPropagation()
        selectThisPanel()
      }}
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: 1.5,
        outline: '2px solid',
        outlineColor: isSelected ? 'primary.main' : 'transparent',
        outlineOffset: 6,
        cursor: 'pointer',
        transition: 'outline-color 0.15s',
        '&:hover': {
          outlineColor: isSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.32)
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 3,
          px: 0.85,
          py: 0.35,
          borderRadius: 999,
          backgroundColor: isSelected
            ? theme.palette.primary.main
            : alpha(theme.palette.common.black, 0.55),
          color: '#fff',
          pointerEvents: 'none',
          ...BUILDER_TYPOGRAPHY.label,
          fontSize: '0.625rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}
      >
        {label}
      </Box>
      {children}
      <Popover
        open={isSelected && !isInlineEditing}
        anchorEl={cardRef.current}
        onClose={() => builder?.selectNestedItem(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disableScrollLock
        slotProps={{
          paper: {
            sx: {
              ml: 1.5,
              width: 320,
              maxHeight: 'min(560px, calc(100vh - 96px))',
              overflow: 'auto',
              p: 1.75,
              borderRadius: 1.5,
              boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.18)}`
            }
          }
        }}
        onClick={event => event.stopPropagation()}
      >
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.sectionLabel, color: 'text.secondary', m: 0, mb: 1.5 }}>
          {label} properties
        </Typography>
        <ShowcaseItemFields item={item} accentColor={siteStyles.colors.accent} onChange={onChange} />
      </Popover>
    </Box>
  )
}
