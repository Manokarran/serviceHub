'use client'

import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import {
  BUILDER_CANVAS_TOOLBAR_HEIGHT,
  BUILDER_TYPOGRAPHY,
  builderSegmentedControlSx
} from '../constants/builderLayout'
import { builderToolbarSx, builderControlTrackSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import type { BuilderMode, BuilderViewport } from '../types'

const VIEWPORT_OPTIONS: { value: BuilderViewport; icon: string; label: string }[] = [
  { value: 'desktop', icon: 'ri-computer-line', label: 'Desktop' },
  { value: 'tablet', icon: 'ri-tablet-line', label: 'Tablet' },
  { value: 'mobile', icon: 'ri-smartphone-line', label: 'Mobile' }
]

export function BuilderCanvasToolbar() {
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'))
  const { mode, setMode, viewport, setViewport } = useBuilder()

  return (
    <Box
      sx={{
        flexShrink: 0,
        height: BUILDER_CANVAS_TOOLBAR_HEIGHT,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 1.25, sm: 2 },
        ...builderToolbarSx(theme)
      }}
    >
      {/* Viewport switcher */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifySelf: 'start' }}>
        <ToggleButtonGroup
          exclusive
          size='small'
          value={viewport}
          onChange={(_, value: BuilderViewport | null) => value && setViewport(value)}
          sx={builderSegmentedControlSx(theme)}
        >
          {VIEWPORT_OPTIONS.map(option => (
            <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
              <Tooltip title={option.label}>
                <Box component='span' sx={{ display: 'flex', alignItems: 'center', px: isNarrow ? 0.25 : 0 }}>
                  <i className={option.icon} style={{ fontSize: '0.875rem' }} />
                </Box>
              </Tooltip>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Page path — read-only breadcrumb */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.375,
          borderRadius: 1,
          ...builderControlTrackSx(theme),
          maxWidth: 280,
          minWidth: 140
        }}
      >
        <i className='ri-home-4-line' style={{ fontSize: '0.75rem', opacity: 0.45 }} />
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            color: 'text.secondary',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.6875rem',
            letterSpacing: 0
          }}
          noWrap
        >
          /home
        </Typography>
      </Box>

      {/* Edit / Preview */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifySelf: 'end' }}>
        <ToggleButtonGroup
          exclusive
          size='small'
          value={mode}
          onChange={(_, value: BuilderMode | null) => value && setMode(value)}
          sx={builderSegmentedControlSx(theme)}
        >
          <ToggleButton value='edit' aria-label='Edit mode'>
            <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 0.625, px: isNarrow ? 0.25 : 0 }}>
              <i className='ri-edit-line' style={{ fontSize: '0.875rem' }} />
              {!isNarrow && (
                <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, fontSize: '0.6875rem' }}>
                  Edit
                </Typography>
              )}
            </Box>
          </ToggleButton>
          <ToggleButton value='preview' aria-label='Preview mode'>
            <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 0.625, px: isNarrow ? 0.25 : 0 }}>
              <i className='ri-eye-line' style={{ fontSize: '0.875rem' }} />
              {!isNarrow && (
                <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, fontSize: '0.6875rem' }}>
                  Preview
                </Typography>
              )}
            </Box>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  )
}
