'use client'

import { useCallback } from 'react'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY, builderPanelHeaderSx } from '../constants/builderLayout'
import { useBuilder } from '../context/BuilderContext'
import type { BuilderSidebarPanel } from '../types'
import {
  isDockedMaximized,
  isMaximizedRect,
  type PanelLayoutMode,
  type PanelRect,
  type PanelSize
} from '../utils/builderPanelFrame'
import { ComponentPaletteContent } from './ComponentPalette'
import { PagesPanel } from './pages/PagesPanel'
import { SiteStylesPanel } from './site-styles/SiteStylesPanel'
import { BuilderFloatingFrame, DockToolButton } from './BuilderFloatingFrame'

const PANEL_META: Record<BuilderSidebarPanel, { title: string; icon: string }> = {
  pages: { title: 'Pages', icon: 'ri-pages-line' },
  blocks: { title: 'Blocks', icon: 'ri-layout-grid-line' },
  design: { title: 'Site styles', icon: 'ri-palette-line' }
}

type Props = {
  panel: BuilderSidebarPanel
  onClose: () => void
  pinned: boolean
  onPinToggle: () => void
  overlay?: boolean
  rect: PanelRect | null
  parentSize: PanelSize
  onCommit: (next: PanelRect, parent: PanelSize, mode: PanelLayoutMode) => void
  onEnsureLayout: (parent: PanelSize, mode: PanelLayoutMode) => void
  onMaximize: (mode: PanelLayoutMode) => void
}

export function BuilderDockPanel({
  panel,
  onClose,
  pinned,
  onPinToggle,
  overlay = false,
  rect,
  parentSize,
  onCommit,
  onEnsureLayout,
  onMaximize
}: Props) {
  const theme = useTheme()
  const { pages } = useBuilder()
  const meta = PANEL_META[panel]
  const layoutMode: PanelLayoutMode = overlay ? 'overlay' : 'docked'
  const showMoveLabel = Boolean(rect && rect.width >= 320)
  const maximized = Boolean(
    rect &&
      parentSize.width > 80 &&
      (overlay ? isMaximizedRect(rect, parentSize) : isDockedMaximized(rect, parentSize))
  )

  const subtitle =
    panel === 'pages'
      ? `${pages.length} page${pages.length === 1 ? '' : 's'}`
      : panel === 'blocks'
        ? 'Drag or click to insert'
        : 'Colors, type, and theme'

  const handleCommit = useCallback(
    (next: PanelRect, parent: PanelSize) => onCommit(next, parent, layoutMode),
    [layoutMode, onCommit]
  )

  const handleEnsureLayout = useCallback(
    (parent: PanelSize) => onEnsureLayout(parent, layoutMode),
    [layoutMode, onEnsureLayout]
  )

  return (
    <BuilderFloatingFrame
      overlay={overlay}
      overlayId='left'
      rect={rect}
      onCommit={handleCommit}
      onEnsureLayout={handleEnsureLayout}
    >
      <Box
        sx={{
          ...builderPanelHeaderSx(theme),
          px: 1.5,
          py: 1.25
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {overlay && (
            <Tooltip title='Drag to move'>
              <Box
                component='span'
                data-panel-drag
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.primary',
                  flexShrink: 0,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 1,
                  cursor: 'grab',
                  touchAction: 'none',
                  backgroundColor: alpha(theme.palette.text.primary, 0.06)
                }}
              >
                <i className='ri-draggable' style={{ fontSize: '1.15rem' }} />
                {showMoveLabel && (
                  <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 700, pr: 0.25 }}>
                    Move
                  </Typography>
                )}
              </Box>
            </Tooltip>
          )}
          <Box
            data-panel-drag={overlay ? true : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flex: 1,
              minWidth: 0,
              cursor: overlay ? 'grab' : 'default',
              touchAction: overlay ? 'none' : undefined
            }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: alpha(theme.palette.primary.main, 0.14),
                color: 'primary.main'
              }}
            >
              <i className={meta.icon} style={{ fontSize: '0.95rem' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.title, color: 'text.primary' }}>{meta.title}</Typography>
              <Typography
                variant='caption'
                sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', display: 'block', lineHeight: 1.3, fontWeight: 500 }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DockToolButton
              title={maximized ? 'Restore panel size' : overlay ? 'Fill window' : 'Widen panel'}
              icon={maximized ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}
              onClick={() => onMaximize(layoutMode)}
              active={maximized}
              ariaLabel={maximized ? 'Restore panel size' : overlay ? 'Fill window' : 'Widen panel'}
            />
            <DockToolButton
              title={pinned ? 'Float outside layout' : 'Pin to the side'}
              icon={pinned ? 'ri-pushpin-fill' : 'ri-pushpin-line'}
              onClick={onPinToggle}
              active={pinned}
              ariaLabel={pinned ? 'Unpin panel' : 'Pin panel'}
            />
            <DockToolButton title='Close panel' icon='ri-close-line' onClick={onClose} ariaLabel={`Close ${meta.title} panel`} />
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {panel === 'pages' && <PagesPanel embedded />}
        {panel === 'blocks' && <ComponentPaletteContent embedded />}
        {panel === 'design' && <SiteStylesPanel embedded />}
      </Box>
    </BuilderFloatingFrame>
  )
}
