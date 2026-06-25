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
import type { PaletteItem } from '../types'
import { PropertyPanelHeader } from './property/PropertyPanelUi'
import { DraggablePaletteItem } from './dnd/DraggablePaletteItem'

type PaletteContentProps = {
  onClose?: () => void
  /** Hides the panel header when the parent sidebar already shows tabs */
  embedded?: boolean
}

type PaletteCategoryConfig = (typeof PALETTE_CATEGORIES)[number]

function PaletteCategorySection({
  category,
  items,
  forceExpanded
}: {
  category: PaletteCategoryConfig
  items: PaletteItem[]
  forceExpanded: boolean
}) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(category.defaultExpanded ?? true)
  const isExpanded = forceExpanded || expanded

  return (
    <Box>
      <Box
        component='button'
        type='button'
        onClick={() => setExpanded(v => !v)}
        aria-expanded={isExpanded}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          width: '100%',
          p: 0,
          mb: isExpanded ? 1 : 0,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'text.disabled',
          '&:hover': {
            color: 'text.secondary'
          }
        }}
      >
        <Box
          component='span'
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
          }}
        >
          <i className='ri-arrow-right-s-line' style={{ fontSize: '0.8rem' }} />
        </Box>
        <i className={category.icon} style={{ fontSize: '0.8rem', flexShrink: 0, opacity: 0.85 }} />
        <Typography
          component='span'
          sx={{
            flex: 1,
            ...BUILDER_TYPOGRAPHY.sectionLabel,
            color: 'inherit',
            m: 0
          }}
        >
          {category.label}
        </Typography>
        <Typography
          component='span'
          sx={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'text.disabled',
            px: 0.625,
            py: 0.125,
            borderRadius: 0.75,
            backgroundColor: alpha(theme.palette.text.primary, 0.05),
            lineHeight: 1.4
          }}
        >
          {items.length}
        </Typography>
      </Box>

      {isExpanded && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75, pl: 0.25 }}>
          {items.map(item => (
            <DraggablePaletteItem key={item.id} item={item} compact />
          ))}
        </Box>
      )}
    </Box>
  )
}

export function ComponentPaletteContent({ onClose, embedded = false }: PaletteContentProps) {
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

  const isSearching = search.trim().length > 0

  return (
    <>
      {!embedded && (
        <PropertyPanelHeader title='Add blocks' subtitle='Drag onto your page' icon='ri-layout-grid-line' onClose={onClose} />
      )}

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

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {grouped.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>
            No blocks match your search
          </Typography>
        ) : (
          grouped.map(category => (
            <PaletteCategorySection
              key={category.id}
              category={category}
              items={category.items}
              forceExpanded={isSearching}
            />
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
