'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  BUILDER_CONTENT_PANEL_WIDTH,
  BUILDER_CONTENT_TABS,
  BUILDER_PAGE_NAV_WIDTH,
  BUILDER_TYPOGRAPHY,
  builderPanelHeaderSx,
  builderSegmentedControlSx
} from '../constants/builderLayout'
import { builderEdgeSx, builderSidePanelSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import type { BuilderSidebarPanel } from '../types'
import { ComponentPaletteContent } from './ComponentPalette'
import { PagesPanel } from './pages/PagesPanel'
import { SiteStylesPanel } from './site-styles/SiteStylesPanel'

type Props = {
  contentPanelOpen: boolean
  onContentPanelClose: () => void
  onContentPanelOpen: () => void
}

function ContentPanelTabs({
  activeTab,
  onTabChange
}: {
  activeTab: BuilderSidebarPanel
  onTabChange: (tab: BuilderSidebarPanel) => void
}) {
  const theme = useTheme()

  return (
    <Box
      role='tablist'
      aria-label='Page editing tools'
      sx={{
        display: 'flex',
        borderRadius: 1.25,
        ...builderSegmentedControlSx(theme),
        backgroundColor: alpha(theme.palette.text.primary, 0.04)
      }}
    >
      {BUILDER_CONTENT_TABS.map(tab => {
        const isActive = activeTab === tab.id

        return (
          <Box
            key={tab.id}
            component='button'
            type='button'
            role='tab'
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              border: 'none',
              borderRadius: '5px',
              py: 0.5,
              px: 0.75,
              cursor: 'pointer',
              backgroundColor: isActive ? 'background.paper' : 'transparent',
              color: isActive ? 'text.primary' : 'text.secondary',
              boxShadow: isActive
                ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.05)}`
                : 'none',
              transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
              '&:hover': {
                backgroundColor: isActive ? 'background.paper' : alpha(theme.palette.text.primary, 0.06),
                color: 'text.primary'
              }
            }}
          >
            <i className={tab.icon} style={{ fontSize: '0.8rem' }} />
            <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.tab, display: { xs: 'none', xl: 'inline' } }}>
              {tab.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

export function BuilderSidebar({ contentPanelOpen, onContentPanelClose, onContentPanelOpen }: Props) {
  const theme = useTheme()
  const { sidebarPanel, setSidebarPanel } = useBuilder()

  const handleTabChange = (tab: BuilderSidebarPanel) => {
    setSidebarPanel(tab)

    if (!contentPanelOpen) {
      onContentPanelOpen()
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
      {/* Level 1 — pages always visible */}
      <Box
        sx={{
          width: BUILDER_PAGE_NAV_WIDTH,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          ...builderEdgeSx(theme, 'right')
        }}
      >
        <PagesPanel embedded />
      </Box>

      {/* Level 2 — blocks / site styles (collapsible) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100%',
          width: contentPanelOpen ? BUILDER_CONTENT_PANEL_WIDTH : 40,
          overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'background.paper'
        }}
      >
        {contentPanelOpen ? (
          <>
            <Box sx={{ ...builderPanelHeaderSx(theme), px: 1.5, py: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ContentPanelTabs activeTab={sidebarPanel} onTabChange={handleTabChange} />
                </Box>
                <Tooltip title='Collapse panel'>
                  <IconButton
                    size='small'
                    onClick={onContentPanelClose}
                    aria-label='Collapse blocks panel'
                    sx={{ width: 26, height: 26, flexShrink: 0, color: 'text.secondary' }}
                  >
                    <i className='ri-sidebar-fold-line' style={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant='caption'
                sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', mt: 0.75, display: 'block' }}
              >
                {sidebarPanel === 'blocks' ? 'Drag blocks onto the page' : 'Global look and feel'}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              {sidebarPanel === 'blocks' ? (
                <ComponentPaletteContent embedded />
              ) : (
                <SiteStylesPanel />
              )}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 1.5,
              gap: 0.5,
              height: '100%',
              ...builderEdgeSx(theme, 'left')
            }}
          >
            <Tooltip title='Expand panel' placement='right'>
              <IconButton
                size='small'
                onClick={onContentPanelOpen}
                aria-label='Expand blocks panel'
                sx={{ width: 28, height: 28, color: 'text.secondary', mb: 0.5 }}
              >
                <i className='ri-sidebar-unfold-line' style={{ fontSize: '0.95rem' }} />
              </IconButton>
            </Tooltip>

            {BUILDER_CONTENT_TABS.map(tab => {
              const isActive = sidebarPanel === tab.id

              return (
                <Tooltip key={tab.id} title={tab.label} placement='right'>
                  <Box
                    component='button'
                    type='button'
                    onClick={() => handleTabChange(tab.id)}
                    aria-label={tab.label}
                    aria-current={isActive ? 'true' : undefined}
                    sx={{
                      width: 32,
                      height: 32,
                      border: 'none',
                      borderRadius: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      transition: 'background-color 0.18s, color 0.18s',
                      '&:hover': {
                        backgroundColor: isActive
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.text.primary, 0.06),
                        color: isActive ? 'primary.main' : 'text.primary'
                      }
                    }}
                  >
                    <i className={tab.icon} style={{ fontSize: '0.95rem' }} />
                  </Box>
                </Tooltip>
              )
            })}
          </Box>
        )}
      </Box>
    </Box>
  )
}
