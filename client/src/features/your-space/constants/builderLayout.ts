import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import { builderControlTrackSx, builderHairlineHorizontal } from './builderChrome'

import type { BuilderViewport } from '../types'

export const VIEWPORT_WIDTHS: Record<BuilderViewport, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 390
}

export const BUILDER_ICON_RAIL_WIDTH = 64
export const BUILDER_PAGE_NAV_WIDTH = 168
export const BUILDER_CONTENT_PANEL_WIDTH = 236

/** @deprecated Use BUILDER_PAGE_NAV_WIDTH + BUILDER_CONTENT_PANEL_WIDTH */
export const BUILDER_SIDEBAR_RAIL_WIDTH = 52

/** @deprecated Use BUILDER_CONTENT_PANEL_WIDTH */
export const BUILDER_SIDEBAR_PANEL_WIDTH = 300
export const BUILDER_PROPERTY_PANEL_WIDTH = 320
export const BUILDER_TOP_BAR_HEIGHT = 56
export const BUILDER_CANVAS_TOOLBAR_HEIGHT = 40
export const BUILDER_TOOLBAR_CONTROL_SIZE = 32

/** Stacking order for canvas blocks and inline editing chrome */
export const BUILDER_Z_INDEX = {
  sectionEditChip: 15,
  blockInsert: 40,
  canvasBlockHover: 50,
  canvasBlockSelected: 100,
  canvasBlockDragging: 110,
  blockToolbar: 120,
  dockOverlay: 24,
  propertyOverlay: 25
} as const

export const BUILDER_CONTENT_TABS = [
  { id: 'pages' as const, icon: 'ri-pages-line', label: 'Pages', shortcut: 'P' },
  { id: 'blocks' as const, icon: 'ri-layout-grid-line', label: 'Blocks', shortcut: 'B' },
  { id: 'design' as const, icon: 'ri-palette-line', label: 'Styles', shortcut: 'S' }
]

export const FLOATING_PANEL_WIDTH = 264
export const FLOATING_PANEL_EXPANDED_WIDTH = 400
export const FLOATING_PROPERTY_PANEL_WIDTH = 280
export const BUILDER_FLOATING_PANEL_INSET = 8
export const BUILDER_FLOATING_PANEL_MIN_HEIGHT = 320

/** Typography tokens for builder chrome — readable UI labels */
export const BUILDER_TYPOGRAPHY = {
  title: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '0.875rem', lineHeight: 1.3 },
  sectionLabel: {
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    fontSize: '0.6875rem',
    lineHeight: 1.35
  },
  label: { fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' },
  subtle: { fontWeight: 400, fontSize: '0.8125rem', lineHeight: 1.5, letterSpacing: '-0.01em' },
  action: { fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.4, letterSpacing: '-0.01em' },
  input: { fontWeight: 500, fontSize: '0.8125rem', lineHeight: 1.5, letterSpacing: '-0.01em' },
  tab: { fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' }
} as const

/** Compact pill-style segmented control — used in canvas toolbar, tabs, etc. */
export const builderSegmentedControlSx = (theme: Theme) => ({
  ...builderControlTrackSx(theme),
  p: '2px',
  gap: 0,
  '& .MuiToggleButtonGroup-grouped': {
    border: 'none !important',
    borderRadius: '5px !important',
    mx: 0
  },
  '& .MuiToggleButton-root': {
    border: 'none',
    minWidth: 0,
    px: 1,
    py: 0.375,
    textTransform: 'none',
    ...BUILDER_TYPOGRAPHY.label,
    fontSize: '0.6875rem',
    color: 'text.secondary',
    lineHeight: 1,
    transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
    '&.Mui-selected': {
      backgroundColor: 'background.paper',
      color: 'text.primary',
      boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.05)}`
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.text.primary, 0.06)
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'background.paper'
    }
  }
})

/** Shared panel header chrome */
export const builderPanelHeaderSx = (theme: Theme) => ({
  flexShrink: 0,
  px: 2,
  py: 1.5,
  borderBottom: 'none',
  position: 'relative' as const,
  backgroundColor: alpha(theme.palette.background.paper, 0.97),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: builderHairlineHorizontal(theme),
    pointerEvents: 'none'
  }
})

/** Icon-only toolbar button group container */
export const builderIconGroupSx = (theme: Theme) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.25,
  p: '3px',
  ...builderControlTrackSx(theme)
})

export const builderToolbarIconButtonSx = (theme: Theme) => ({
  position: 'relative' as const,
  width: BUILDER_TOOLBAR_CONTROL_SIZE,
  height: BUILDER_TOOLBAR_CONTROL_SIZE,
  color: 'text.secondary',
  fontSize: '1.05rem',
  borderRadius: 1.25,
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.06),
    color: 'text.primary'
  }
})

export const builderToolbarDividerSx = (theme: Theme) => ({
  width: '1px',
  height: 18,
  flexShrink: 0,
  alignSelf: 'center',
  backgroundColor: alpha(theme.palette.divider, 0.95)
})

export const BUILDER_FONT_SMOOTHING = {
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  textRendering: 'optimizeLegibility'
} as const

/** Cascading form typography for property / style editor panels */
export const BUILDER_PROPERTY_PANEL_SX = {
  ...BUILDER_FONT_SMOOTHING,
  '& .MuiFormLabel-root, & .MuiInputLabel-root': {
    ...BUILDER_TYPOGRAPHY.label,
    color: 'text.secondary'
  },
  '& .MuiInputLabel-shrink': {
    ...BUILDER_TYPOGRAPHY.label
  },
  '& .MuiInputBase-input, & .MuiSelect-select': {
    ...BUILDER_TYPOGRAPHY.input,
    py: 1.125
  },
  '& .MuiInputBase-root': {
    minHeight: 40
  },
  '& .MuiFormControl-root': {
    gap: 0.5
  },
  '& .MuiMenuItem-root': {
    ...BUILDER_TYPOGRAPHY.input,
    minHeight: 32
  },
  '& .MuiToggleButton-root': {
    ...BUILDER_TYPOGRAPHY.label,
    textTransform: 'none'
  },
  '& .MuiButton-sizeSmall': {
    ...BUILDER_TYPOGRAPHY.action,
    textTransform: 'none'
  },
  '& .MuiFormHelperText-root': {
    ...BUILDER_TYPOGRAPHY.label,
    fontWeight: 400
  },
  '& .MuiSlider-root': {
    height: 4,
    py: 1.25,
    mt: 0.5,
    '& .MuiSlider-thumb': {
      width: 12,
      height: 12,
      '&:hover, &.Mui-focusVisible': {
        boxShadow: 'none'
      }
    },
    '& .MuiSlider-rail': {
      opacity: 0.25
    }
  }
} as const
