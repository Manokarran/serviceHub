'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme, type SxProps, type Theme } from '@mui/material/styles'

import { FLOATING_PANEL_WIDTH, BUILDER_TYPOGRAPHY, builderPanelHeaderSx } from '../constants/builderLayout'
import { builderSidePanelSx } from '../constants/builderChrome'
import type { BuilderSidebarPanel } from '../types'
import { ComponentPaletteContent } from './ComponentPalette'
import { PagesPanel } from './pages/PagesPanel'
import { SiteStylesPanel } from './site-styles/SiteStylesPanel'

const PANEL_META: Record<BuilderSidebarPanel, { title: string; subtitle: string }> = {
  pages: { title: 'Pages', subtitle: 'Manage your site pages' },
  blocks: { title: 'Blocks', subtitle: 'Drag blocks onto the page' },
  design: { title: 'Site styles', subtitle: 'Global look and feel' }
}

type Props = {
  panel: BuilderSidebarPanel
  onClose: () => void
}

export function BuilderDockPanel({ panel, onClose }: Props) {
  const theme = useTheme()
  const meta = PANEL_META[panel]
  const panelSx: SxProps<Theme> = {
    width: FLOATING_PANEL_WIDTH,
    flexShrink: 0,
    display: { xs: 'none', lg: 'flex' },
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
    ...builderSidePanelSx(theme, 'right')
  }

  return (
    <Box sx={panelSx}>
      <Box sx={{ ...builderPanelHeaderSx(theme), px: 1.5, py: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...BUILDER_TYPOGRAPHY.title }}>{meta.title}</Typography>
          </Box>
          <Tooltip title='Close panel'>
            <IconButton
              size='small'
              onClick={onClose}
              aria-label={`Close ${meta.title} panel`}
              sx={{ width: 26, height: 26, flexShrink: 0, color: 'text.secondary' }}
            >
              <i className='ri-close-line' style={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography
          variant='caption'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', mt: 0.5, display: 'block' }}
        >
          {meta.subtitle}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {panel === 'pages' && <PagesPanel embedded />}
        {panel === 'blocks' && <ComponentPaletteContent embedded />}
        {panel === 'design' && <SiteStylesPanel />}
      </Box>
    </Box>
  )
}
