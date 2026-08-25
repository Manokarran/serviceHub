'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_CONTENT_TABS, BUILDER_ICON_RAIL_WIDTH } from '../constants/builderLayout'
import { builderEdgeSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import type { BuilderSidebarPanel } from '../types'

type Props = {
  activePanel: BuilderSidebarPanel | null
  onToggle: (panel: BuilderSidebarPanel) => void
}

export function BuilderSidebar({ activePanel, onToggle }: Props) {
  const theme = useTheme()
  const { pages } = useBuilder()

  return (
    <Box
      component='nav'
      aria-label='Builder tools'
      sx={{
        width: BUILDER_ICON_RAIL_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
                py: 1,
                px: 0.5,
                gap: 0.75,
        height: '100%',
        zIndex: 12,
        backgroundColor: alpha(theme.palette.background.paper, 0.97),
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        ...builderEdgeSx(theme, 'right')
      }}
    >
      {BUILDER_CONTENT_TABS.map(tab => {
        const isActive = activePanel === tab.id
        const badge = tab.id === 'pages' ? pages.length : null

        return (
          <Tooltip
            key={tab.id}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{tab.id === 'design' ? 'Site styles' : tab.label}</span>
                <Box
                  component='kbd'
                  sx={{
                    px: 0.5,
                    py: 0.125,
                    borderRadius: 0.5,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    backgroundColor: alpha(theme.palette.common.white, 0.16)
                  }}
                >
                  {tab.shortcut}
                </Box>
              </Box>
            }
            placement='right'
          >
            <Box
              component='button'
              type='button'
              onClick={() => onToggle(tab.id)}
              aria-label={`${tab.id === 'design' ? 'Site styles' : tab.label} (${tab.shortcut})`}
              aria-pressed={isActive}
              sx={{
                width: '100%',
                minHeight: 58,
                border: 'none',
                borderRadius: 1.75,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                cursor: 'pointer',
                px: 0.25,
                py: 0.875,
                position: 'relative',
                backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.16) : 'transparent',
                color: isActive ? 'primary.main' : 'text.primary',
                boxShadow: isActive ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.28)}` : 'none',
                transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.18)
                    : alpha(theme.palette.text.primary, 0.06),
                  color: isActive ? 'primary.main' : 'text.primary'
                }
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex', lineHeight: 0 }}>
                <i className={tab.icon} style={{ fontSize: '1.15rem' }} />
                {badge !== null && (
                  <Box
                    component='span'
                    sx={{
                      position: 'absolute',
                      top: -7,
                      right: -9,
                      minWidth: 14,
                      height: 14,
                      px: 0.25,
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      backgroundColor: isActive ? 'primary.main' : alpha(theme.palette.text.primary, 0.18),
                      color: isActive ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    {badge}
                  </Box>
                )}
              </Box>
              <Typography
                component='span'
                sx={{
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.02em',
                  color: 'inherit',
                  lineHeight: 1.15
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}
