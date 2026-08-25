import type { SxProps, Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

/** Soft tint used across builder edges — adapts to light/dark */
function edgeColors(theme: Theme) {
  const isDark = theme.palette.mode === 'dark'

  return {
    primary: alpha(theme.palette.primary.main, isDark ? 0.26 : 0.16),
    mid: alpha(theme.palette.divider, isDark ? 0.32 : 0.26),
    faint: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.07)
  }
}

/** Horizontal 1px gradient hairline (toolbar footers, panel headers) */
export function builderHairlineHorizontal(theme: Theme): string {
  const { primary, mid, faint } = edgeColors(theme)

  return `linear-gradient(90deg, transparent 0%, ${faint} 8%, ${primary} 35%, ${mid} 50%, ${primary} 65%, ${faint} 92%, transparent 100%)`
}

/** Vertical 1px gradient hairline (panel splits) */
export function builderHairlineVertical(theme: Theme): string {
  const { primary, mid, faint } = edgeColors(theme)

  return `linear-gradient(180deg, transparent 0%, ${faint} 6%, ${primary} 30%, ${mid} 50%, ${primary} 70%, ${faint} 94%, transparent 100%)`
}

/** Diagonal gradient ring for frames & cards */
export function builderGradientRing(theme: Theme, emphasis = false): string {
  const { primary, mid, faint } = edgeColors(theme)
  const boost = emphasis ? 0.1 : 0

  return `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.20 + boost)} 0%, ${mid} 42%, ${faint} 68%, ${primary} 100%)`
}

type Edge = 'top' | 'bottom' | 'left' | 'right'

const EDGE_POSITION: Record<Edge, Record<string, string | number>> = {
  top: { top: 0, left: 0, right: 0, height: '1px' },
  bottom: { bottom: 0, left: 0, right: 0, height: '1px' },
  left: { top: 0, left: 0, bottom: 0, width: '1px' },
  right: { top: 0, right: 0, bottom: 0, width: '1px' }
}

/** Pseudo-element gradient edge — replaces solid borderColor: 'divider' */
export function builderEdgeSx(theme: Theme, edge: Edge): SxProps<Theme> {
  const horizontal = edge === 'top' || edge === 'bottom'

  return {
    position: 'relative',
    ...(edge === 'top' && { borderTop: 'none' }),
    ...(edge === 'bottom' && { borderBottom: 'none' }),
    ...(edge === 'left' && { borderLeft: 'none' }),
    ...(edge === 'right' && { borderRight: 'none' }),
    '&::after': {
      content: '""',
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 2,
      ...EDGE_POSITION[edge],
      background: horizontal ? builderHairlineHorizontal(theme) : builderHairlineVertical(theme)
    }
  }
}

/** Outer shell top edge when embedded in dashboard */
export function builderShellSx(theme: Theme, isFullscreen: boolean): SxProps<Theme> {
  if (isFullscreen) {
    return {}
  }

  return builderEdgeSx(theme, 'top')
}

/** Top app chrome */
export function builderToolbarSx(theme: Theme): SxProps<Theme> {
  return {
    ...builderEdgeSx(theme, 'bottom'),
    backgroundColor: alpha(theme.palette.background.paper, 0.92),
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)'
  }
}

/** Quieter canvas instrument bar — sits under the app chrome */
export function builderCanvasToolbarSx(theme: Theme): SxProps<Theme> {
  return {
    ...builderEdgeSx(theme, 'bottom'),
    backgroundColor: alpha(theme.palette.background.paper, 0.64)
  }
}

/** Side panel outer chrome */
export function builderSidePanelSx(theme: Theme, edge: 'left' | 'right'): SxProps<Theme> {
  return {
    ...builderEdgeSx(theme, edge),
    backgroundColor: alpha(theme.palette.background.paper, 0.94),
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)'
  }
}

/** Canvas preview frame — gradient ring via padding trick */
export function builderCanvasFrameOuterSx(theme: Theme, borderRadius: number): SxProps<Theme> {
  return {
    p: '1px',
    borderRadius,
    background: builderGradientRing(theme, true),
    boxShadow: `
      0 1px 3px ${alpha(theme.palette.common.black, 0.04)},
      0 4px 16px ${alpha(theme.palette.common.black, 0.07)},
      0 20px 56px ${alpha(theme.palette.common.black, 0.10)},
      0 40px 96px ${alpha(theme.palette.common.black, 0.05)}
    `
  }
}

export function builderCanvasFrameInnerSx(theme: Theme, borderRadius: number): SxProps<Theme> {
  return {
    borderRadius: Math.max(0, borderRadius - 1),
    backgroundColor: 'transparent',
    overflow: 'hidden',
    minHeight: 'inherit',
    width: '100%'
  }
}

/** Soft ring for nested cards (link editor, palette items) */
export function builderSoftCardSx(theme: Theme, selected = false): SxProps<Theme> {
  return {
    border: 'none',
    borderRadius: 1.25,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    boxShadow: selected
      ? `inset 0 0 0 1.5px ${alpha(theme.palette.primary.main, 0.4)}, 0 2px 12px ${alpha(theme.palette.primary.main, 0.12)}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.06)}`
      : `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.09)}, 0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
    transition: 'box-shadow 0.15s ease',
    '&:hover': {
      boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}, 0 4px 16px ${alpha(theme.palette.primary.main, 0.08)}`
    }
  }
}

/** Floating overlay card that sits on the canvas instead of shrinking it */
export function builderFloatingCardSx(theme: Theme): SxProps<Theme> {
  return {
    backgroundColor: alpha(theme.palette.background.paper, 0.97),
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: 2.5,
    boxShadow: `
      0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)},
      0 16px 48px ${alpha(theme.palette.common.black, 0.16)},
      0 4px 12px ${alpha(theme.palette.common.black, 0.06)}
    `,
    overflow: 'hidden'
  }
}

/** Icon group / segmented control track */
export function builderControlTrackSx(theme: Theme): SxProps<Theme> {
  return {
    border: 'none',
    borderRadius: 1.25,
    background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.055)} 0%, ${alpha(theme.palette.text.primary, 0.035)} 100%)`,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.09)}, inset 0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`
  }
}

/** MUI outlined field overrides for property panels */
export function builderFormOutlineSx(theme: Theme): SxProps<Theme> {
  const rest = alpha(theme.palette.primary.main, 0.14)
  const hover = alpha(theme.palette.primary.main, 0.24)
  const focus = alpha(theme.palette.primary.main, 0.45)

  return {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: rest,
      transition: 'border-color 0.15s ease'
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: hover
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: focus,
      borderWidth: 1
    }
  }
}

/** Canvas workspace background — refined dot mesh */
export function builderCanvasWorkspaceSx(theme: Theme): SxProps<Theme> {
  const dot = alpha(theme.palette.primary.main, 0.09)

  return {
    backgroundColor: alpha(theme.palette.primary.main, 0.018),
    backgroundImage: `
      radial-gradient(circle, ${dot} 0.75px, transparent 0.75px),
      linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.025)} 0%, transparent 35%, ${alpha(theme.palette.background.default, 0.4)} 100%)
    `,
    backgroundSize: '18px 18px, 100% 100%'
  }
}
