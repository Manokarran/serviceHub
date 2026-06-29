import type { Theme } from '@mui/material/styles'
import type { SxProps } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

import type { BlockType } from '../types'

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
    borderRadius: '1px',
    border: '1px solid',
    borderColor,
    transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
    ...(isDragging && isOver
      ? {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`
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

export function readBuilderGridMode(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(BUILDER_GRID_MODE_KEY) === 'true'
}
