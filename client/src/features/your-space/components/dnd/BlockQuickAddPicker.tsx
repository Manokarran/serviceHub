'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { PALETTE_CATEGORIES } from '../../constants'
import { BUILDER_TYPOGRAPHY, BUILDER_Z_INDEX } from '../../constants/builderLayout'
import { useBuilder } from '../../context/BuilderContext'
import type { PaletteItem } from '../../types'
import { getQuickAddPaletteItems, toBlockLocation, type QuickAddLocation } from '../../utils/quickAddHelpers'

type Props = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  location: QuickAddLocation
  index: number
  title?: string
}

export function BlockQuickAddPicker({
  anchorEl,
  open,
  onClose,
  location,
  index,
  title = 'Add block'
}: Props) {
  const theme = useTheme()
  const { addBlock } = useBuilder()
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    const all = getQuickAddPaletteItems(location)
    const q = query.trim().toLowerCase()

    if (!q) {
      return all
    }

    return all.filter(
      item =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    )
  }, [location, query])

  const grouped = useMemo(() => {
    return PALETTE_CATEGORIES.map(category => ({
      category,
      items: items.filter(item => item.category === category.id)
    })).filter(group => group.items.length > 0)
  }, [items])

  const handlePick = (item: PaletteItem) => {
    addBlock(item.type, toBlockLocation(location, index), item.id)
    setQuery('')
    onClose()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        setQuery('')
        onClose()
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            width: 300,
            maxHeight: 380,
            mt: 0.75,
            borderRadius: 1.5,
            overflow: 'hidden',
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.16)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            zIndex: BUILDER_Z_INDEX.blockToolbar + 20
          }
        }
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 1, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}` }}>
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.title, mb: 0.75 }}>{title}</Typography>
        <Box
          component='input'
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Search blocks…'
          autoFocus
          sx={{
            width: '100%',
            border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
            borderRadius: 1,
            px: 1,
            py: 0.75,
            fontSize: '0.8rem',
            outline: 'none',
            backgroundColor: alpha(theme.palette.text.primary, 0.03),
            color: 'text.primary',
            '&:focus': {
              borderColor: alpha(theme.palette.primary.main, 0.55),
              backgroundColor: 'background.paper'
            }
          }}
        />
      </Box>
      <Box sx={{ overflowY: 'auto', maxHeight: 300, py: 0.75 }}>
        {grouped.length === 0 ? (
          <Typography sx={{ px: 1.5, py: 2, color: 'text.disabled', fontSize: '0.8rem' }}>
            No blocks match
          </Typography>
        ) : (
          grouped.map(({ category, items: groupItems }) => (
            <Box key={category.id} sx={{ mb: 0.75 }}>
              <Typography
                sx={{
                  ...BUILDER_TYPOGRAPHY.sectionLabel,
                  px: 1.5,
                  py: 0.5,
                  color: 'text.disabled'
                }}
              >
                {category.label}
              </Typography>
              {groupItems.map(item => (
                <Box
                  key={item.id}
                  component='button'
                  type='button'
                  onClick={() => handlePick(item)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    px: 1.5,
                    py: 0.75,
                    cursor: 'pointer',
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 0.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main'
                    }}
                  >
                    <i className={item.icon} style={{ fontSize: '0.9rem' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2 }}>
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        color: 'text.disabled',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ))
        )}
      </Box>
    </Popover>
  )
}
