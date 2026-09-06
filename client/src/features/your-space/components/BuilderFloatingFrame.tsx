'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_Z_INDEX } from '../constants/builderLayout'
import { builderFloatingCardSx, builderSidePanelSx } from '../constants/builderChrome'
import { useBuilderOverlay } from '../context/BuilderOverlayContext'
import type { OverlayPanelId } from '../utils/builderOverlayLayout'
import {
  resizePanelRect,
  viewportPanelSize,
  type PanelRect,
  type PanelSize,
  type ResizeHandle
} from '../utils/builderPanelFrame'

const OVERLAY_HANDLES: { id: ResizeHandle; cursor: string; sx: Record<string, string | number> }[] = [
  { id: 'n', cursor: 'ns-resize', sx: { top: 0, left: 10, right: 10, height: 8 } },
  { id: 's', cursor: 'ns-resize', sx: { bottom: 0, left: 10, right: 10, height: 8 } },
  { id: 'e', cursor: 'ew-resize', sx: { top: 10, right: 0, bottom: 10, width: 8 } },
  { id: 'w', cursor: 'ew-resize', sx: { top: 10, left: 0, bottom: 10, width: 8 } },
  { id: 'ne', cursor: 'nesw-resize', sx: { top: 0, right: 0, width: 16, height: 16 } },
  { id: 'nw', cursor: 'nwse-resize', sx: { top: 0, left: 0, width: 16, height: 16 } },
  { id: 'se', cursor: 'nwse-resize', sx: { bottom: 0, right: 0, width: 18, height: 18 } },
  { id: 'sw', cursor: 'nesw-resize', sx: { bottom: 0, left: 0, width: 16, height: 16 } }
]

export function DockToolButton({
  title,
  icon,
  onClick,
  active = false,
  disabled = false,
  ariaLabel
}: {
  title: string
  icon: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  ariaLabel: string
}) {
  const theme = useTheme()

  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size='small'
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-pressed={active}
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            color: active ? 'primary.main' : 'text.primary',
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.14) : alpha(theme.palette.text.primary, 0.05),
            '&:hover': {
              backgroundColor: active
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.text.primary, 0.1)
            },
            '&.Mui-disabled': {
              color: 'text.disabled'
            }
          }}
        >
          <i className={icon} style={{ fontSize: '1rem' }} />
        </IconButton>
      </span>
    </Tooltip>
  )
}

type Props = {
  overlay: boolean
  rect: PanelRect | null
  zIndex?: number
  overlayId?: OverlayPanelId
  /** Which side of the canvas a docked panel sits on */
  side?: 'left' | 'right'
  onCommit: (next: PanelRect, parent: PanelSize) => void
  onEnsureLayout: (parent: PanelSize) => void
  children: ReactNode
}

export function BuilderFloatingFrame({
  overlay,
  rect,
  zIndex = BUILDER_Z_INDEX.dockOverlay,
  overlayId,
  side = 'left',
  onCommit,
  onEnsureLayout,
  children
}: Props) {
  const overlayStack = useBuilderOverlay()
  const frameZIndex = overlayId && overlayStack ? overlayStack.zIndexFor(overlayId) : zIndex
  const theme = useTheme()
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    kind: 'move' | ResizeHandle
    startX: number
    startY: number
    origin: PanelRect
  } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const rectRef = useRef(rect)
  const onCommitRef = useRef(onCommit)
  rectRef.current = rect
  onCommitRef.current = onCommit

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const getParentSize = useCallback((): PanelSize => {
    if (overlay) {
      return viewportPanelSize()
    }

    const el = frameRef.current

    if (!el?.parentElement) {
      return { width: 0, height: 0 }
    }

    return { width: el.parentElement.clientWidth, height: el.parentElement.clientHeight }
  }, [overlay])

  useEffect(() => {
    const sync = () => onEnsureLayout(getParentSize())

    sync()

    window.addEventListener('resize', sync)

    if (overlay) {
      return () => {
        window.removeEventListener('resize', sync)
      }
    }

    const parent = frameRef.current?.parentElement
    const observer = parent ? new ResizeObserver(sync) : null

    observer?.observe(parent as Element)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', sync)
    }
  }, [getParentSize, onEnsureLayout, overlay])

  const activateFrame = () => {
    if (overlayId) {
      overlayStack?.focus(overlayId)
    }
  }

  const beginGesture = (event: React.PointerEvent<HTMLElement>, kind: 'move' | ResizeHandle) => {
    if (!rectRef.current || event.button !== 0) {
      return
    }

    if (kind === 'move' && !overlay) {
      return
    }

    if (kind !== 'move' && !overlay && kind !== (side === 'right' ? 'w' : 'e')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragRef.current = {
      kind,
      startX: event.clientX,
      startY: event.clientY,
      origin: rectRef.current
    }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) {
      return
    }

    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current

      if (!drag) {
        return
      }

      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      const parent = getParentSize()

      if (drag.kind === 'move') {
        onCommitRef.current(
          {
            ...drag.origin,
            x: drag.origin.x + dx,
            y: drag.origin.y + dy
          },
          parent
        )

        return
      }

      onCommitRef.current(resizePanelRect(drag.origin, drag.kind, dx, dy), parent)
    }

    const onUp = () => {
      dragRef.current = null
      setDragging(false)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragging, getParentSize])

  const overlaySx = rect
    ? {
        display: { xs: 'none' as const, lg: 'flex' as const },
        flexDirection: 'column' as const,
        position: 'fixed' as const,
        top: rect.y,
        left: rect.x,
        width: rect.width,
        height: rect.height,
        zIndex: frameZIndex,
        userSelect: dragging ? ('none' as const) : undefined,
        transition: dragging ? undefined : 'top 180ms ease, left 180ms ease, width 180ms ease, height 180ms ease',
        ...builderFloatingCardSx(theme)
      }
    : {
        display: { xs: 'none' as const, lg: 'flex' as const },
        flexDirection: 'column' as const,
        position: 'fixed' as const,
        inset: 8,
        zIndex: frameZIndex,
        ...builderFloatingCardSx(theme)
      }

  const dockedSx = {
    position: 'relative' as const,
    width: rect?.width ?? 280,
    flexShrink: 0,
    display: { xs: 'none' as const, lg: 'flex' as const },
    flexDirection: 'column' as const,
    overflow: 'hidden',
    height: '100%',
    ...(overlayId === 'ai'
      ? {
          borderRadius: 2.5,
          ...builderFloatingCardSx(theme)
        }
      : builderSidePanelSx(theme, side === 'right' ? 'left' : 'right'))
  }

  const dockedHandle: ResizeHandle = side === 'right' ? 'w' : 'e'
  const handles = overlay ? OVERLAY_HANDLES : OVERLAY_HANDLES.filter(handle => handle.id === dockedHandle)

  const frame = (
    <Box ref={frameRef} sx={overlay ? overlaySx : dockedSx}>
      <Box
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
        onPointerDown={event => {
          activateFrame()

          if ((event.target as HTMLElement).closest('[data-panel-drag]')) {
            beginGesture(event, 'move')
          }
        }}
      >
        {children}
      </Box>

      {handles.map(handle => (
        <Box
          key={handle.id}
          onPointerDown={event => {
            activateFrame()
            beginGesture(event, handle.id)
          }}
          sx={{
            position: 'absolute',
            ...handle.sx,
            cursor: handle.cursor,
            zIndex: 4,
            touchAction: 'none',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, handle.id.length === 2 ? 0.2 : 0.1)
            }
          }}
          aria-label={`Resize ${handle.id}`}
        />
      ))}

      {overlay && (
        <Box
          sx={{
            position: 'absolute',
            right: 7,
            bottom: 7,
            width: 11,
            height: 11,
            pointerEvents: 'none',
            borderRight: `2px solid ${alpha(theme.palette.text.primary, 0.32)}`,
            borderBottom: `2px solid ${alpha(theme.palette.text.primary, 0.32)}`,
            borderRadius: '0 0 2px 0',
            opacity: dragging ? 1 : 0.6
          }}
        />
      )}

      {!overlay && (
        <Box
          sx={{
            position: 'absolute',
            ...(side === 'right' ? { left: 3 } : { right: 3 }),
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 36,
            borderRadius: 1,
            pointerEvents: 'none',
            backgroundColor: alpha(theme.palette.text.primary, dragging ? 0.35 : 0.18)
          }}
        />
      )}
    </Box>
  )

  if (overlay) {
    if (!portalReady) {
      return null
    }

    return createPortal(frame, document.body)
  }

  return frame
}
