'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { Block, SectionBlockProps } from '../../types'
import type { BlockColumn } from '../../utils/blockTreeUtils'
import { getSectionColumnBackground, isSimpleColor } from '../../utils/sectionStyleHelpers'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { BlockInsertDropZone } from './BlockInsertDropZone'
import { SortableBlockList } from './SortableBlockList'
import { insertDropId } from '../../utils/blockTreeUtils'

type Props = {
  sectionId: string
  column: BlockColumn
  children: Block[]
  sectionProps: SectionBlockProps
  editMode: boolean
  emptyLabel: string
}

export function SectionDropZone({ sectionId, column, children, sectionProps, editMode, emptyLabel }: Props) {
  const theme = useTheme()
  const columnBg = getSectionColumnBackground(sectionProps, column === 'default' ? 'primary' : column)
  const splitStyle = sectionProps.splitStyle ?? 'gap'
  const showBuilderChrome = editMode && splitStyle !== 'contrast'
  const location = { container: 'section' as const, sectionId, column }

  if (!editMode) {
    return (
      <>
        {children.map(child => (
          <BlockRenderer key={child.id} block={child} preview />
        ))}
      </>
    )
  }

  return (
    <Box
      sx={{
        minHeight: children.length === 0 ? 120 : 48,
        borderRadius: sectionProps.borderRadius ? Math.max(0, sectionProps.borderRadius - 4) : 1,
        border: showBuilderChrome ? '1px dashed' : '1px solid transparent',
        borderColor: showBuilderChrome ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
        ...(columnBg
          ? isSimpleColor(columnBg)
            ? { backgroundColor: columnBg }
            : {}
          : {
              backgroundColor: alpha(theme.palette.text.primary, 0.02)
            }),
        transition: 'border-color 0.15s, background-color 0.15s',
        p: children.length === 0 ? 2 : 0.75
      }}
    >
      {children.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 96,
            color: 'text.disabled',
            textAlign: 'center',
            px: 2
          }}
        >
          <BlockInsertDropZone id={insertDropId({ ...location, index: 0 })} />
          <Typography sx={{ fontSize: '0.75rem', lineHeight: 1.5 }}>{emptyLabel}</Typography>
        </Box>
      ) : (
        <SortableBlockList blocks={children} location={location} nested />
      )}
    </Box>
  )
}
