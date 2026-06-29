'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_CONTENT_TABS, BUILDER_ICON_RAIL_WIDTH } from '../constants/builderLayout'
import { builderEdgeSx } from '../constants/builderChrome'
import type { BuilderSidebarPanel } from '../types'

type Props = {
  activePanel: BuilderSidebarPanel | null
  onToggle: (panel: BuilderSidebarPanel) => void
}

export function BuilderSidebar({ activePanel, onToggle }: Props) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        width: BUILDER_ICON_RAIL_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        py: 1.25,
        gap: 0.5,
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

        return (
          <Tooltip key={tab.id} title={tab.label} placement='right'>
            <Box
              component='button'
              type='button'
              onClick={() => onToggle(tab.id)}
              aria-label={tab.label}
              aria-pressed={isActive}
              sx={{
                width: 34,
                height: 34,
                border: 'none',
                borderRadius: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                transition: 'background-color 0.15s, color 0.15s',
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.text.primary, 0.06),
                  color: isActive ? 'primary.main' : 'text.primary'
                }
              }}
            >
              <i className={tab.icon} style={{ fontSize: '1rem' }} />
            </Box>
          </Tooltip>
        )
      })}
    </Box>
  )
}
