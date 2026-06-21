import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

/** Soft tint used across builder edges — adapts to light/dark */
function edgeColors(theme: Theme) {
  const isDark = theme.palette.mode === 'dark'

  return {
    primary: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.14),
    mid: alpha(theme.palette.divider, isDark ? 0.28 : 0.22),
    faint: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06)
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
  const boost = emphasis ? 0.08 : 0

  return `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18 + boost)} 0%, ${mid} 42%, ${faint} 68%, ${primary} 100%)`
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

/** Top toolbar / canvas toolbar bottom */
export function builderToolbarSx(theme: Theme): SxProps<Theme> {
  return {
    ...builderEdgeSx(theme, 'bottom'),
    backgroundColor: alpha(theme.palette.background.paper, 0.92),
    backdropFilter: 'blur(12px)',
    boxShadow: `0 1px 0 ${alpha(theme.palette.primary.main, 0.04)}`
  }
}

/** Side panel outer chrome */
export function builderSidePanelSx(theme: Theme, edge: 'left' | 'right'): SxProps<Theme> {
  return {
    ...builderEdgeSx(theme, edge),
    backgroundColor: alpha(theme.palette.background.paper, 0.96),
    backdropFilter: 'blur(8px)'
  }
}

/** Canvas preview frame — gradient ring via padding trick */
export function builderCanvasFrameOuterSx(theme: Theme, borderRadius: number): SxProps<Theme> {
  return {
    p: '1px',
    borderRadius,
    background: builderGradientRing(theme, true),
    boxShadow: `
      0 2px 8px ${alpha(theme.palette.common.black, 0.04)},
      0 12px 40px ${alpha(theme.palette.common.black, 0.07)}
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
      ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}, 0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`
      : `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}, 0 1px 2px ${alpha(theme.palette.common.black, 0.03)}`,
    transition: 'box-shadow 0.15s ease',
    '&:hover': {
      boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}, 0 4px 16px ${alpha(theme.palette.primary.main, 0.06)}`
    }
  }
}

/** Icon group / segmented control track */
export function builderControlTrackSx(theme: Theme): SxProps<Theme> {
  return {
    border: 'none',
    borderRadius: 1.25,
    background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.text.primary, 0.04)} 100%)`,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.07)}`
  }
}

/** MUI outlined field overrides for property panels */
export function builderFormOutlineSx(theme: Theme): SxProps<Theme> {
  const rest = alpha(theme.palette.primary.main, 0.12)
  const hover = alpha(theme.palette.primary.main, 0.22)
  const focus = alpha(theme.palette.primary.main, 0.42)

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

/** Canvas workspace background — subtle mesh */
export function builderCanvasWorkspaceSx(theme: Theme): SxProps<Theme> {
  const dot = alpha(theme.palette.primary.main, 0.07)

  return {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    backgroundImage: `
      radial-gradient(${dot} 1px, transparent 1px),
      linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 40%, ${alpha(theme.palette.background.default, 0.5)} 100%)
    `,
    backgroundSize: '20px 20px, 100% 100%'
  }
}
