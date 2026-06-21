'use client'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import { useBuilder } from '../../context/BuilderContext'

export function SectionEditChip({ sectionId }: { sectionId: string }) {
  const theme = useTheme()
  const { selectedBlockId, selectBlock } = useBuilder()

  if (selectedBlockId === sectionId) {
    return null
  }

  return (
    <Box
      component='button'
      type='button'
      onClick={e => {
        e.stopPropagation()
        selectBlock(sectionId)
      }}
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.375,
        border: 'none',
        borderRadius: 1,
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: 'text.secondary',
        backgroundColor: alpha(theme.palette.background.paper, 0.92),
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
        '&:hover': {
          color: 'primary.main',
          backgroundColor: 'background.paper'
        }
      }}
    >
      <i className='ri-layout-row-line' style={{ fontSize: '0.75rem' }} />
      Section
    </Box>
  )
}
