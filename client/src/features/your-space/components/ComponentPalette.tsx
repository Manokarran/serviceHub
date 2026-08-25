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
import { useFrequentPaletteItems } from '../hooks/useFrequentPaletteItems'
import type { PaletteCategory, PaletteItem } from '../types'
import { PropertyPanelHeader } from './property/PropertyPanelUi'
import { DraggablePaletteItem } from './dnd/DraggablePaletteItem'

type PaletteContentProps = {
  onClose?: () => void
  /** Hides the panel header when the parent sidebar already shows tabs */
  embedded?: boolean
}

type PaletteCategoryConfig = (typeof PALETTE_CATEGORIES)[number]
type CategoryFilter = 'all' | PaletteCategory

const PALETTE_TILE_MIN = 112
const paletteTileGridSx = {
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(${PALETTE_TILE_MIN}px, 1fr))`,
  gap: 1,
  width: '100%',
  minWidth: 0
} as const

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
  const [open, setOpen] = useState(category.defaultExpanded ?? true)
  const isExpanded = forceExpanded || open
  const isRow = category.itemLayout === 'row'

  return (
    <Box>
      <Box
        component='button'
        type='button'
        onClick={() => setOpen(v => !v)}
        aria-expanded={isExpanded}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          px: 0.5,
          py: 0.75,
          mb: isExpanded ? 1 : 0,
          border: 'none',
          borderRadius: 1.25,
          background: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'text.primary',
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.04)
          }
        }}
      >
        <Box
          component='span'
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            color: 'text.secondary'
          }}
        >
          <i className='ri-arrow-right-s-line' style={{ fontSize: '1rem' }} />
        </Box>
        <i className={category.icon} style={{ fontSize: '0.95rem', flexShrink: 0, color: theme.palette.primary.main }} />
        <Typography
          component='span'
          sx={{
            flex: 1,
            ...BUILDER_TYPOGRAPHY.sectionLabel,
            color: 'text.primary',
            m: 0
          }}
        >
          {category.label}
        </Typography>
        <Typography
          component='span'
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'text.secondary',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.text.primary, 0.08),
            lineHeight: 1.4
          }}
        >
          {items.length}
        </Typography>
      </Box>

      {isExpanded && (
        <Box
          sx={
            isRow
              ? { display: 'flex', flexDirection: 'column', gap: 0.75 }
              : paletteTileGridSx
          }
        >
          {items.map(item => (
            <DraggablePaletteItem key={item.id} item={item} layout={isRow ? 'row' : 'tile'} comfortable />
          ))}
        </Box>
      )}
    </Box>
  )
}

export function ComponentPaletteContent({ onClose, embedded = false }: PaletteContentProps) {
  const theme = useTheme()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const frequentItems = useFrequentPaletteItems(6)

  const query = search.trim().toLowerCase()
  const isSearching = query.length > 0

  const grouped = useMemo(() => {
    return PALETTE_CATEGORIES.map(category => ({
      ...category,
      items: PALETTE_ITEMS.filter(item => {
        if (item.category !== category.id) {
          return false
        }

        if (filter !== 'all' && item.category !== filter) {
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
  }, [filter, query])

  const visibleFrequent = useMemo(() => {
    if (isSearching || filter !== 'all') {
      return []
    }

    return frequentItems
  }, [filter, frequentItems, isSearching])

  const showGroupedAccordion = filter === 'all' || isSearching

  return (
    <>
      {!embedded && (
        <PropertyPanelHeader title='Add blocks' subtitle='Drag onto your page' icon='ri-layout-grid-line' onClose={onClose} />
      )}

      <Box
        sx={{
          px: 1.75,
          pt: 1.5,
          pb: 1.25,
          flexShrink: 0,
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
                  <i className='ri-search-line' style={{ fontSize: '1rem', opacity: 0.55 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1.25,
                fontSize: '0.8125rem',
                fontWeight: 500,
                py: 0.375,
                ...builderControlTrackSx(theme),
                boxShadow: 'none'
              }
            }
          }}
        />

        {!isSearching && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              mt: 1.25,
              pb: 0.25
            }}
          >
            {[{ id: 'all' as const, chipLabel: 'All' }, ...PALETTE_CATEGORIES].map(chip => {
              const id = chip.id
              const selected = filter === id

              return (
                <Box
                  key={id}
                  component='button'
                  type='button'
                  onClick={() => setFilter(id)}
                  aria-pressed={selected}
                  sx={{
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    border: 'none',
                    cursor: 'pointer',
                    px: 1.25,
                    py: 0.625,
                    borderRadius: 5,
                    ...BUILDER_TYPOGRAPHY.label,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.text.primary, 0.06),
                    color: selected ? 'primary.main' : 'text.primary',
                    boxShadow: selected ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
                    '&:hover': {
                      color: selected ? 'primary.main' : 'text.primary',
                      backgroundColor: selected
                        ? alpha(theme.palette.primary.main, 0.22)
                        : alpha(theme.palette.text.primary, 0.1)
                    }
                  }}
                >
                  {chip.chipLabel}
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.75, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visibleFrequent.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.primary' }}>
              <i className='ri-sparkling-line' style={{ fontSize: '0.95rem', color: theme.palette.primary.main }} />
              <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.sectionLabel, color: 'text.primary', m: 0, flex: 1 }}>
                Frequently used
              </Typography>
            </Box>
            <Box sx={paletteTileGridSx}>
              {visibleFrequent.map(item => (
                <DraggablePaletteItem
                  key={`frequent-${item.id}`}
                  item={item}
                  layout='tile'
                  comfortable
                  dragId={`palette-frequent-${item.id}`}
                />
              ))}
            </Box>
          </Box>
        )}

        {grouped.length === 0 ? (
          <Typography variant='body2' color='text.secondary' sx={{ py: 2, textAlign: 'center', fontWeight: 600 }}>
            No blocks match your search
          </Typography>
        ) : showGroupedAccordion ? (
          grouped.map(category => (
            <PaletteCategorySection
              key={category.id}
              category={category}
              items={category.items}
              forceExpanded={isSearching}
            />
          ))
        ) : (
          grouped.map(category => {
            const isRow = category.itemLayout === 'row'

            return (
              <Box
                key={category.id}
                sx={isRow ? { display: 'flex', flexDirection: 'column', gap: 0.75 } : paletteTileGridSx}
              >
                {category.items.map(item => (
                  <DraggablePaletteItem
                    key={item.id}
                    item={item}
                    layout={isRow ? 'row' : 'tile'}
                    comfortable
                  />
                ))}
              </Box>
            )
          })
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
