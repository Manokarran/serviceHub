'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { PALETTE_CATEGORIES, PALETTE_ITEMS } from '../constants'
import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { builderControlTrackSx, builderHairlineHorizontal } from '../constants/builderChrome'
import { PropertyPanelHeader } from './property/PropertyPanelUi'
import { DraggablePaletteItem } from './dnd/DraggablePaletteItem'

type PaletteContentProps = {
  onClose?: () => void
}

export function ComponentPaletteContent({ onClose }: PaletteContentProps) {
  const theme = useTheme()
  const [search, setSearch] = useState('')

  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase()

    return PALETTE_CATEGORIES.map(category => ({
      ...category,
      items: PALETTE_ITEMS.filter(item => {
        if (item.category !== category.id) {
          return false
        }

        if (!query) {
          return true
        }

        return (
          item.label.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          category.label.toLowerCase().includes(query)
        )
      })
    })).filter(category => category.items.length > 0)
  }, [search])

  return (
    <>
      <PropertyPanelHeader title='Add blocks' subtitle='Drag onto your page' icon='ri-layout-grid-line' onClose={onClose} />

      <Box
        sx={{
          px: 1.75,
          py: 1.25,
          borderBottom: 'none',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: builderHairlineHorizontal(theme),
            pointerEvents: 'none'
          }
        }}
      >
        <TextField
          size='small'
          fullWidth
          placeholder='Search blocks...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' style={{ fontSize: '0.875rem', opacity: 0.45 }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 1, fontSize: '0.75rem', py: 0.125, ...builderControlTrackSx(theme), boxShadow: 'none' }
            }
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {grouped.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>
            No blocks match your search
          </Typography>
        ) : (
          grouped.map(category => (
            <Box key={category.id}>
              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  ...BUILDER_TYPOGRAPHY.sectionLabel,
                  color: 'text.disabled',
                  mb: 1
                }}
              >
                {category.label}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75 }}>
                {category.items.map(item => (
                  <DraggablePaletteItem key={item.id} item={item} compact />
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </>
  )
}

type Props = {
  onClose?: () => void
}

/** @deprecated Use BuilderSidebar instead — kept for backward compatibility */
export function ComponentPalette({ onClose }: Props) {
  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <ComponentPaletteContent onClose={onClose} />
    </Box>
  )
}
