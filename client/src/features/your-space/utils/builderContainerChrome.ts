import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import type { BlockType, BuilderSidebarPanel } from '../types'
import {
  BUILDER_CANVAS_TOOLBAR_HEIGHT,
  BUILDER_FLOATING_PANEL_INSET,
  BUILDER_FLOATING_PANEL_MIN_HEIGHT
} from '../constants/builderLayout'

export const CONTAINER_BLOCK_TYPES = new Set<BlockType>(['section', 'carousel', 'tabs', 'hero'])

export function isContainerBlockType(type: BlockType): boolean {
  return CONTAINER_BLOCK_TYPES.has(type)
}

/** Default 1px solid outline for container blocks and drop zones in edit mode. */
export function builderContainerBorderColor(theme: Theme, emphasis = false): string {
  return alpha(theme.palette.primary.main, emphasis ? 0.55 : 0.22)
}

export function builderContainerChromeSx(
  theme: Theme,
  options?: { isOver?: boolean; isDragging?: boolean }
): SxProps<Theme> {
  const { isOver = false, isDragging = false } = options ?? {}
  const borderColor = builderContainerBorderColor(theme, isOver && isDragging)

  return {
    position: 'relative',
    borderRadius: '1px',
    border: '1px solid',
    borderColor,
    transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
    ...(isDragging && !isOver
      ? {
          borderColor: alpha(theme.palette.primary.main, 0.28),
          backgroundColor: alpha(theme.palette.primary.main, 0.03)
        }
      : {}),
    ...(isDragging && isOver
      ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`,
          borderColor: alpha(theme.palette.primary.main, 0.55)
        }
      : {})
  }
}

/** Subtle outline on the outer wrapper of container blocks in edit mode. */
export function builderContainerOutlineSx(theme: Theme, selected = false): SxProps<Theme> {
  if (selected) {
    return {}
  }

  return {
    borderRadius: '1px',
    boxShadow: `inset 0 0 0 1px ${builderContainerBorderColor(theme)}`
  }
}

/** Grid overlay for canvas placement guides in edit mode. */
export function builderCanvasGridOverlaySx(theme: Theme): SxProps<Theme> {
  const line = alpha(theme.palette.primary.main, 0.14)
  const majorLine = alpha(theme.palette.primary.main, 0.22)

  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    backgroundImage: `
      linear-gradient(${line} 1px, transparent 1px),
      linear-gradient(90deg, ${line} 1px, transparent 1px),
      linear-gradient(${majorLine} 1px, transparent 1px),
      linear-gradient(90deg, ${majorLine} 1px, transparent 1px)
    `,
    backgroundSize: '8px 8px, 8px 8px, 64px 64px, 64px 64px'
  }
}

export const BUILDER_GRID_MODE_KEY = 'servicehub-builder-show-grid'
export const BUILDER_AUTOSAVE_KEY = 'servicehub-builder-autosave'
export const BUILDER_LEFT_CHROME_KEY = 'servicehub-builder-left-chrome'
export const BUILDER_PROPERTY_CHROME_KEY = 'servicehub-builder-property-chrome'

const LEFT_PANELS: BuilderSidebarPanel[] = ['pages', 'blocks', 'design']

export type DockOffset = {
  x: number
  y: number
}

type LeftChromeState = {
  panel: BuilderSidebarPanel | null
  pinned: boolean
  expanded: boolean
  offset: DockOffset
}

type StoredLeftChrome = {
  panel?: unknown
  pinned?: unknown
  open?: unknown
  expanded?: unknown
  offsetX?: unknown
  offsetY?: unknown
}

function readOffset(parsed: StoredLeftChrome): DockOffset {
  const x = typeof parsed.offsetX === 'number' && Number.isFinite(parsed.offsetX) ? parsed.offsetX : 0
  const y = typeof parsed.offsetY === 'number' && Number.isFinite(parsed.offsetY) ? parsed.offsetY : 0

  return { x, y }
}

function isSidebarPanel(value: unknown): value is BuilderSidebarPanel {
  return typeof value === 'string' && LEFT_PANELS.includes(value as BuilderSidebarPanel)
}

export function readBuilderLeftChrome(): LeftChromeState {
  if (typeof window === 'undefined') {
    return { panel: 'blocks', pinned: false, expanded: false, offset: { x: 0, y: 0 } }
  }

  try {
    const raw = localStorage.getItem(BUILDER_LEFT_CHROME_KEY)

    if (!raw) {
      return { panel: 'blocks', pinned: false, expanded: false, offset: { x: 0, y: 0 } }
    }

    const parsed = JSON.parse(raw) as StoredLeftChrome
    const pinned = parsed.pinned === true
    const panel = isSidebarPanel(parsed.panel) ? parsed.panel : 'blocks'
    const open = pinned || parsed.open === true

    return {
      pinned,
      panel: open ? panel : null,
      expanded: parsed.expanded === true,
      offset: readOffset(parsed)
    }
  } catch {
    return { panel: 'blocks', pinned: false, expanded: false, offset: { x: 0, y: 0 } }
  }
}

export function writeBuilderLeftChrome(state: LeftChromeState) {
  if (typeof window === 'undefined') {
    return
  }

  let previousPanel: BuilderSidebarPanel = 'blocks'

  try {
    const raw = localStorage.getItem(BUILDER_LEFT_CHROME_KEY)

    if (raw) {
      const parsed = JSON.parse(raw) as StoredLeftChrome

      if (isSidebarPanel(parsed.panel)) {
        previousPanel = parsed.panel
      }
    }
  } catch {
    previousPanel = 'blocks'
  }

  localStorage.setItem(
    BUILDER_LEFT_CHROME_KEY,
    JSON.stringify({
      pinned: state.pinned,
      open: state.panel !== null,
      panel: state.panel ?? previousPanel,
      expanded: state.expanded,
      offsetX: state.offset.x,
      offsetY: state.offset.y
    })
  )
}

export function clampDockOffset(
  offset: DockOffset,
  panelWidth: number,
  parentSize: { width: number; height: number }
): DockOffset {
  const maxX = Math.max(0, parentSize.width - panelWidth - BUILDER_FLOATING_PANEL_INSET * 2)
  const maxY = Math.max(
    0,
    parentSize.height - BUILDER_CANVAS_TOOLBAR_HEIGHT - BUILDER_FLOATING_PANEL_MIN_HEIGHT - BUILDER_FLOATING_PANEL_INSET * 2
  )

  return {
    x: Math.min(maxX, Math.max(0, offset.x)),
    y: Math.min(maxY, Math.max(-BUILDER_CANVAS_TOOLBAR_HEIGHT + BUILDER_FLOATING_PANEL_INSET, offset.y))
  }
}

export function readBuilderGridMode(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(BUILDER_GRID_MODE_KEY) === 'true'
}

export function readBuilderAutosave(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(BUILDER_AUTOSAVE_KEY) === 'true'
}

export function readBuilderPropertyChrome(): { pinned: boolean } {
  if (typeof window === 'undefined') {
    return { pinned: false }
  }

  try {
    const raw = localStorage.getItem(BUILDER_PROPERTY_CHROME_KEY)

    if (!raw) {
      return { pinned: false }
    }

    const parsed = JSON.parse(raw) as { pinned?: unknown }

    return { pinned: parsed.pinned === true }
  } catch {
    return { pinned: false }
  }
}

export function writeBuilderPropertyChrome(state: { pinned: boolean }) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(BUILDER_PROPERTY_CHROME_KEY, JSON.stringify({ pinned: state.pinned }))
}
