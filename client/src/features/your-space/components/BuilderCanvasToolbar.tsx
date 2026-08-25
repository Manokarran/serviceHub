'use client'

import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import {
  BUILDER_CANVAS_TOOLBAR_HEIGHT,
  BUILDER_TYPOGRAPHY,
  builderSegmentedControlSx,
  builderToolbarDividerSx
} from '../constants/builderLayout'
import { builderCanvasToolbarSx, builderControlTrackSx } from '../constants/builderChrome'
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
  const { mode, setMode, viewport, setViewport, showGrid, setShowGrid } = useBuilder()

  return (
    <Box
      sx={{
        flexShrink: 0,
        minHeight: BUILDER_CANVAS_TOOLBAR_HEIGHT,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        py: { xs: 0.5, sm: 0 },
        px: { xs: 1.25, sm: 2 },
        ...builderCanvasToolbarSx(theme)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
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
                <Box component='span' sx={{ display: 'flex', alignItems: 'center', px: 0.125 }}>
                  <i className={option.icon} style={{ fontSize: '0.9rem' }} />
                </Box>
              </Tooltip>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {mode === 'edit' && (
          <>
            <Box sx={{ ...builderToolbarDividerSx(theme), display: { xs: 'none', sm: 'block' } }} />
            <Tooltip title={showGrid ? 'Hide placement grid' : 'Show placement grid'}>
              <Box sx={{ ...builderControlTrackSx(theme), p: '2px', borderRadius: 1.25 }}>
                <ToggleButton
                  value='grid'
                  selected={showGrid}
                  onChange={() => setShowGrid(!showGrid)}
                  size='small'
                  aria-label={showGrid ? 'Hide placement grid' : 'Show placement grid'}
                  sx={{
                    border: 'none',
                    minWidth: 32,
                    px: 0.75,
                    py: 0.375,
                    borderRadius: '5px !important',
                    textTransform: 'none',
                    ...BUILDER_TYPOGRAPHY.label,
                    fontSize: '0.6875rem',
                    color: showGrid ? 'text.primary' : 'text.secondary',
                    backgroundColor: showGrid ? 'background.paper' : 'transparent',
                    boxShadow: showGrid
                      ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.05)}`
                      : 'none',
                    '&:hover': {
                      backgroundColor: showGrid ? 'background.paper' : alpha(theme.palette.primary.main, 0.06)
                    }
                  }}
                >
                  <i className='ri-grid-line' style={{ fontSize: '0.875rem' }} />
                </ToggleButton>
              </Box>
            </Tooltip>
          </>
        )}
      </Box>

      <ToggleButtonGroup
        exclusive
        size='small'
        value={mode}
        onChange={(_, value: BuilderMode | null) => value && setMode(value)}
        sx={builderSegmentedControlSx(theme)}
      >
        <ToggleButton value='edit' aria-label='Edit mode'>
          <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 0.625, px: isNarrow ? 0.25 : 0.5 }}>
            <i className='ri-edit-line' style={{ fontSize: '0.875rem' }} />
            {!isNarrow && (
              <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, fontSize: '0.6875rem' }}>
                Edit
              </Typography>
            )}
          </Box>
        </ToggleButton>
        <ToggleButton value='preview' aria-label='Preview mode'>
          <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 0.625, px: isNarrow ? 0.25 : 0.5 }}>
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
  )
}
