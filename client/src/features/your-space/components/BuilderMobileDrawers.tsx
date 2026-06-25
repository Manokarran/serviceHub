'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { builderControlTrackSx } from '../constants/builderChrome'
import { ComponentPaletteContent } from './ComponentPalette'
import { PagesPanel } from './pages/PagesPanel'
import { PropertyPanelContent } from './PropertyPanel'
import type { PropertyPanelTab } from './property/PropertyPanelUi'
import { SiteStylesPanel } from './site-styles/SiteStylesPanel'

type Props = {
  pagesOpen: boolean
  paletteOpen: boolean
  propertiesOpen: boolean
  stylesOpen: boolean
  hasSelectedBlock: boolean
  propertyPanelFocusTab?: PropertyPanelTab | null
  onPropertyPanelFocusTabConsumed?: () => void
  onPagesOpen: () => void
  onPagesClose: () => void
  onPaletteOpen: () => void
  onPaletteClose: () => void
  onPropertiesOpen: () => void
  onPropertiesClose: () => void
  onStylesOpen: () => void
  onStylesClose: () => void
}

export function BuilderMobileDrawers({
  pagesOpen,
  paletteOpen,
  propertiesOpen,
  stylesOpen,
  hasSelectedBlock,
  propertyPanelFocusTab,
  onPropertyPanelFocusTabConsumed,
  onPagesOpen,
  onPagesClose,
  onPaletteOpen,
  onPaletteClose,
  onPropertiesOpen,
  onPropertiesClose,
  onStylesOpen,
  onStylesClose
}: Props) {
  const theme = useTheme()
  const anyDrawerOpen = pagesOpen || paletteOpen || propertiesOpen || stylesOpen

  const closeOtherDrawers = (keep: 'pages' | 'palette' | 'properties' | 'styles') => {
    if (keep !== 'pages') onPagesClose()
    if (keep !== 'palette') onPaletteClose()
    if (keep !== 'properties') onPropertiesClose()
    if (keep !== 'styles') onStylesClose()
  }

  return (
    <>
      {anyDrawerOpen && (
        <Box
          onClick={() => {
            onPagesClose()
            onPaletteClose()
            onPropertiesClose()
            onStylesClose()
          }}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme.zIndex.drawer - 1,
            backgroundColor: alpha(theme.palette.common.black, 0.4),
            display: { xs: 'block', lg: 'none' }
          }}
        />
      )}

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer,
          display: { xs: 'block', lg: 'none' },
          transform: pagesOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          maxHeight: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.12)}`
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
          <PagesPanel onClose={onPagesClose} />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer,
          display: { xs: 'block', lg: 'none' },
          transform: paletteOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          maxHeight: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.12)}`
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
          <ComponentPaletteContent onClose={onPaletteClose} />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer,
          display: { xs: 'block', lg: 'none' },
          transform: propertiesOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          maxHeight: '75vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.12)}`
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '75vh' }}>
          <PropertyPanelContent
            onClose={onPropertiesClose}
            focusTab={propertyPanelFocusTab}
            onFocusTabConsumed={onPropertyPanelFocusTabConsumed}
          />
        </Box>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.drawer,
          display: { xs: 'block', lg: 'none' },
          transform: stylesOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          maxHeight: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.12)}`
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
          <SiteStylesPanel onClose={onStylesClose} />
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          display: { xs: 'flex', lg: 'none' },
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: theme => theme.zIndex.drawer + 1,
          p: 0.5,
          gap: 0.25,
          borderRadius: 999,
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(12px)',
          border: 'none',
          ...builderControlTrackSx(theme),
          boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.1)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`
        }}
      >
        <Tooltip title='Pages'>
          <IconButton
            size='small'
            onClick={() => {
              if (pagesOpen) {
                onPagesClose()
              } else {
                closeOtherDrawers('pages')
                onPagesOpen()
              }
            }}
            aria-label='Pages'
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: pagesOpen ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              color: pagesOpen ? 'primary.main' : 'text.secondary'
            }}
          >
            <i className='ri-pages-line' style={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Add blocks'>
          <IconButton
            size='small'
            onClick={() => {
              if (paletteOpen) {
                onPaletteClose()
              } else {
                closeOtherDrawers('palette')
                onPaletteOpen()
              }
            }}
            aria-label='Add blocks'
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: paletteOpen ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              color: paletteOpen ? 'primary.main' : 'text.secondary'
            }}
          >
            <i className='ri-add-box-line' style={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Site styles'>
          <IconButton
            size='small'
            onClick={() => {
              if (stylesOpen) {
                onStylesClose()
              } else {
                closeOtherDrawers('styles')
                onStylesOpen()
              }
            }}
            aria-label='Site styles'
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: stylesOpen ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              color: stylesOpen ? 'primary.main' : 'text.secondary'
            }}
          >
            <i className='ri-palette-line' style={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Block settings'>
          <span>
            <IconButton
              size='small'
              onClick={() => {
                if (propertiesOpen) {
                  onPropertiesClose()
                } else {
                  closeOtherDrawers('properties')
                  onPropertiesOpen()
                }
              }}
              disabled={!hasSelectedBlock}
              aria-label='Block settings'
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: propertiesOpen ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                color: hasSelectedBlock ? (propertiesOpen ? 'primary.main' : 'text.secondary') : 'text.disabled'
              }}
            >
              <i className='ri-settings-3-line' style={{ fontSize: '1.15rem' }} />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>
    </>
  )
}
