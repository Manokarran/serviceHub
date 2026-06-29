'use client'

import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { getPublicPagePath } from '@/lib/utils/public-site-url'
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

function CanvasAddressBar({
  host,
  path,
  pageTitle,
  isLoading
}: {
  host: string
  path: string
  pageTitle: string
  isLoading: boolean
}) {
  const theme = useTheme()

  return (
    <Tooltip title={`${pageTitle} · ${host}${path}`} placement='bottom'>
      <Box
        aria-label={`Page URL: ${host}${path}`}
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 0.75,
          width: '100%',
          maxWidth: 420,
          px: 1.25,
          py: 0.5,
          borderRadius: '100px',
          ...builderControlTrackSx(theme),
          opacity: isLoading ? 0.55 : 1,
          transition: 'opacity 0.2s ease',
          cursor: 'default'
        }}
      >
        <Box
          component='span'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.success.main, 0.12),
            color: 'success.main'
          }}
        >
          <i className='ri-lock-line' style={{ fontSize: '0.6rem' }} />
        </Box>
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            color: 'text.disabled',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.625rem',
            letterSpacing: 0,
            flexShrink: 0
          }}
          noWrap
        >
          {host}
        </Typography>
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            color: 'text.secondary',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: '0.6875rem',
            letterSpacing: 0,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {path}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export function BuilderCanvasToolbar() {
  const theme = useTheme()
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'))
  const { mode, setMode, viewport, setViewport, showGrid, setShowGrid, tenantSlug, currentPageSlug, currentPageTitle, isPageSwitching } =
    useBuilder()

  const pagePath = getPublicPagePath(tenantSlug, currentPageSlug)
  const displayHost = typeof window !== 'undefined' ? window.location.host : 'yoursite.com'

  return (
    <Box
      sx={{
        flexShrink: 0,
        minHeight: BUILDER_CANVAS_TOOLBAR_HEIGHT,
        height: { xs: 'auto', sm: BUILDER_CANVAS_TOOLBAR_HEIGHT },
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        py: { xs: 0.5, sm: 0 },
        px: { xs: 1.25, sm: 2 },
        ...builderToolbarSx(theme)
      }}
    >
      {/* Viewport switcher */}
      <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto', minWidth: 0 }}>
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
                <Box component='span' sx={{ display: 'flex', alignItems: 'center', px: isNarrow ? 0.25 : 0.125 }}>
                  <i className={option.icon} style={{ fontSize: '0.9rem' }} />
                </Box>
              </Tooltip>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Page URL — centered address bar */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flex: '1 1 0',
          minWidth: 0,
          justifyContent: 'center',
          px: 1
        }}
      >
        <CanvasAddressBar
          host={displayHost}
          path={pagePath}
          pageTitle={currentPageTitle}
          isLoading={isPageSwitching}
        />
      </Box>

      {/* Grid + Edit / Preview */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        {mode === 'edit' && (
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
                minWidth: 0,
                px: isNarrow ? 0.75 : 1,
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
              <Box component='span' sx={{ display: 'flex', alignItems: 'center', gap: 0.625 }}>
                <i className='ri-grid-line' style={{ fontSize: '0.875rem' }} />
                {!isNarrow && (
                  <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, fontSize: '0.6875rem' }}>
                    Grid
                  </Typography>
                )}
              </Box>
            </ToggleButton>
          </Box>
        </Tooltip>
        )}

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
