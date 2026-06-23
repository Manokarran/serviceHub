import type { SxProps, Theme } from '@mui/material/styles'

/** Container name for builder canvas / site preview — enables width-aware layout inside fixed preview frames. */
export const SITE_CANVAS_CONTAINER = 'site-canvas'

/** Below this width, side-by-side layouts stack vertically (matches MUI `sm` breakpoint). */
export const SITE_STACK_MAX_WIDTH = 640

type QueryStyles = Record<string, unknown>

export function siteCanvasBelow(styles: QueryStyles): Record<string, QueryStyles> {
  return {
    [`@container ${SITE_CANVAS_CONTAINER} (max-width: ${SITE_STACK_MAX_WIDTH}px)`]: styles
  }
}

export function siteCanvasAbove(styles: QueryStyles): Record<string, QueryStyles> {
  return {
    [`@container ${SITE_CANVAS_CONTAINER} (min-width: ${SITE_STACK_MAX_WIDTH + 1}px)`]: styles
  }
}

export function siteCanvasContainerSx(): SxProps<Theme> {
  return {
    containerType: 'inline-size',
    containerName: SITE_CANVAS_CONTAINER
  }
}
