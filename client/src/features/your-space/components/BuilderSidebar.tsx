'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_SIDEBAR_ITEMS, BUILDER_SIDEBAR_PANEL_WIDTH, BUILDER_SIDEBAR_RAIL_WIDTH, BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { builderEdgeSx, builderSidePanelSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import type { BuilderSidebarPanel } from '../types'
import { ComponentPaletteContent } from './ComponentPalette'
import { SiteStylesPanel } from './site-styles/SiteStylesPanel'

type Props = {
  panelOpen: boolean
  onPanelClose: () => void
  onPanelOpen: () => void
}

function SidebarPlaceholder({ panel }: { panel: BuilderSidebarPanel }) {
  const theme = useTheme()
  const item = BUILDER_SIDEBAR_ITEMS.find(entry => entry.id === panel)

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
        gap: 1.5
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          color: 'text.secondary'
        }}
      >
        <i className={item?.icon ?? 'ri-tools-line'} style={{ fontSize: '1.25rem' }} />
      </Box>
      <Typography variant='subtitle2' sx={BUILDER_TYPOGRAPHY.title}>
        {item?.label ?? 'Coming soon'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 200 }}>
        This panel is reserved for upcoming builder features.
      </Typography>
    </Box>
  )
}

export function BuilderSidebar({ panelOpen, onPanelClose, onPanelOpen }: Props) {
  const theme = useTheme()
  const { sidebarPanel, setSidebarPanel } = useBuilder()

  const handleRailClick = (panelId: typeof sidebarPanel, comingSoon: boolean) => {
    if (comingSoon) {
      return
    }

    if (sidebarPanel === panelId && panelOpen) {
      onPanelClose()
    } else {
      setSidebarPanel(panelId)
      onPanelOpen()
    }
  }

  return (
    <Box
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexShrink: 0,
        height: '100%',
        ...builderSidePanelSx(theme, 'right')
      }}
    >
      {/* Icon rail — extensible slot for future panels */}
      <Box
        sx={{
          width: BUILDER_SIDEBAR_RAIL_WIDTH,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          gap: 0.5,
          ...builderEdgeSx(theme, 'right'),
          backgroundColor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        {BUILDER_SIDEBAR_ITEMS.map(item => {
          const isActive = sidebarPanel === item.id

          return (
            <Tooltip key={item.id} title={item.comingSoon ? `${item.label} — coming soon` : item.label} placement='right'>
              <Box
                component='button'
                type='button'
                disabled={item.comingSoon}
                onClick={() => handleRailClick(item.id, item.comingSoon)}
                aria-label={item.label}
                aria-current={isActive ? 'true' : undefined}
                sx={{
                  width: 34,
                  height: 34,
                  border: 'none',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: item.comingSoon ? 'not-allowed' : 'pointer',
                  opacity: item.comingSoon ? 0.35 : 1,
                  backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'background-color 0.15s, color 0.15s',
                  '&:hover': item.comingSoon
                    ? {}
                    : {
                        backgroundColor: isActive
                          ? alpha(theme.palette.primary.main, 0.16)
                          : alpha(theme.palette.text.primary, 0.06),
                        color: isActive ? 'primary.main' : 'text.primary'
                      }
                }}
              >
                <i className={item.icon} style={{ fontSize: '1rem' }} />
              </Box>
            </Tooltip>
          )
        })}
      </Box>

      {/* Expandable panel */}
      <Box
        sx={{
          width: panelOpen ? BUILDER_SIDEBAR_PANEL_WIDTH : 0,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          opacity: panelOpen ? 1 : 0,
          transition: 'width 0.25s ease, opacity 0.2s ease',
          pointerEvents: panelOpen ? 'auto' : 'none'
        }}
      >
        {sidebarPanel === 'blocks' ? (
          <ComponentPaletteContent onClose={onPanelClose} />
        ) : sidebarPanel === 'design' ? (
          <SiteStylesPanel onClose={onPanelClose} />
        ) : (
          <SidebarPlaceholder panel={sidebarPanel} />
        )}
      </Box>
    </Box>
  )
}
