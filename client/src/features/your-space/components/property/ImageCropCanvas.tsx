'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import type { ImageCropSettings } from '@/features/your-space/types'
import {
  type CropHandle,
  type CropRectPx,
  type ImageLayout,
  clampRectToImage,
  computeImageLayout,
  cropToRectPx,
  moveCropRect,
  pointerToContainerCoords,
  rectPxToCrop,
  resizeCropRect
} from '@/lib/media/image-crop-interaction'
import { normalizeImageCrop } from '@/lib/media/image-edit'

const HANDLE_SIZE = 12
const CONTAINER_HEIGHT = 420

const HANDLE_POSITIONS: Array<{ handle: CropHandle; style: Record<string, string | number> }> = [
  { handle: 'nw', style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nwse-resize' } },
  { handle: 'n', style: { top: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2, cursor: 'ns-resize' } },
  { handle: 'ne', style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nesw-resize' } },
  { handle: 'e', style: { top: '50%', right: -HANDLE_SIZE / 2, marginTop: -HANDLE_SIZE / 2, cursor: 'ew-resize' } },
  { handle: 'se', style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'nwse-resize' } },
  { handle: 's', style: { bottom: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2, cursor: 'ns-resize' } },
  { handle: 'sw', style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nesw-resize' } },
  { handle: 'w', style: { top: '50%', left: -HANDLE_SIZE / 2, marginTop: -HANDLE_SIZE / 2, cursor: 'ew-resize' } }
]

type DragState = {
  handle: CropHandle
  startPointerX: number
  startPointerY: number
  startRect: CropRectPx
}

type Props = {
  src: string
  crop: ImageCropSettings
  filter?: string
  aspectRatio: number | null
  naturalWidth?: number
  naturalHeight?: number
  onCropChange: (crop: ImageCropSettings) => void
}

function CropOverlay({
  rect,
  containerHeight,
  containerWidth
}: {
  rect: CropRectPx
  containerHeight: number
  containerWidth: number
}) {
  const theme = useTheme()
  const shade = alpha(theme.palette.common.black, 0.55)

  return (
    <>
      <Box sx={{ position: 'absolute', left: 0, top: 0, right: 0, height: rect.y, bgcolor: shade, pointerEvents: 'none' }} />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: rect.y + rect.height,
          right: 0,
          height: Math.max(0, containerHeight - rect.y - rect.height),
          bgcolor: shade,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: rect.y,
          width: rect.x,
          height: rect.height,
          bgcolor: shade,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: rect.x + rect.width,
          top: rect.y,
          width: Math.max(0, containerWidth - rect.x - rect.width),
          height: rect.height,
          bgcolor: shade,
          pointerEvents: 'none'
        }}
      />
    </>
  )
}

export function ImageCropCanvas({
  src,
  crop,
  filter,
  aspectRatio,
  naturalWidth,
  naturalHeight,
  onCropChange
}: Props) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const layoutRef = useRef<ImageLayout | null>(null)
  const [layout, setLayout] = useState<ImageLayout | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [loadedSize, setLoadedSize] = useState({ width: naturalWidth ?? 0, height: naturalHeight ?? 0 })
  const [dragRect, setDragRect] = useState<CropRectPx | null>(null)
  const dragRectRef = useRef<CropRectPx | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const aspectRatioRef = useRef(aspectRatio)

  aspectRatioRef.current = aspectRatio

  useEffect(() => {
    if (naturalWidth && naturalHeight) {
      setLoadedSize({ width: naturalWidth, height: naturalHeight })
    }
  }, [naturalWidth, naturalHeight])

  const recomputeLayout = useCallback(() => {
    const container = containerRef.current

    if (!container || !loadedSize.width || !loadedSize.height) {
      return
    }

    const width = container.clientWidth
    const nextLayout = computeImageLayout(width, CONTAINER_HEIGHT, loadedSize.width, loadedSize.height)

    layoutRef.current = nextLayout
    setContainerWidth(width)
    setLayout(nextLayout)
  }, [loadedSize.height, loadedSize.width])

  useEffect(() => {
    recomputeLayout()

    const container = containerRef.current

    if (!container) {
      return
    }

    const observer = new ResizeObserver(() => {
      recomputeLayout()
    })

    observer.observe(container)

    return () => observer.disconnect()
  }, [recomputeLayout])

  const cropRect = layout ? cropToRectPx(crop, layout) : null
  const displayRect = dragRect ?? cropRect

  const commitRect = useCallback((rect: CropRectPx) => {
    const activeLayout = layoutRef.current

    if (!activeLayout) {
      return
    }

    onCropChange(rectPxToCrop(clampRectToImage(rect, activeLayout), activeLayout))
  }, [onCropChange])

  const getPointerInContainer = (clientX: number, clientY: number) => {
    const bounds = containerRef.current?.getBoundingClientRect()

    if (!bounds) {
      return { x: clientX, y: clientY }
    }

    return pointerToContainerCoords(clientX, clientY, bounds)
  }

  const handlePointerDown = (handle: CropHandle) => (event: React.PointerEvent) => {
    const activeLayout = layoutRef.current

    if (!activeLayout || !displayRect || !containerRef.current) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    containerRef.current.setPointerCapture(event.pointerId)

    dragRef.current = {
      handle,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startRect: displayRect
    }
    dragRectRef.current = displayRect
    setDragRect(displayRect)
  }

  const updateDragRect = (rect: CropRectPx) => {
    dragRectRef.current = rect
    setDragRect(rect)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current
    const activeLayout = layoutRef.current

    if (!drag || !activeLayout) {
      return
    }

    event.preventDefault()

    const deltaX = event.clientX - drag.startPointerX
    const deltaY = event.clientY - drag.startPointerY

    if (drag.handle === 'move') {
      updateDragRect(moveCropRect(drag.startRect, deltaX, deltaY, activeLayout))

      return
    }

    const pointer = getPointerInContainer(event.clientX, event.clientY)

    updateDragRect(
      resizeCropRect(
        drag.startRect,
        drag.handle,
        pointer.x,
        pointer.y,
        activeLayout,
        aspectRatioRef.current
      )
    )
  }

  const handlePointerUp = (event: React.PointerEvent) => {
    const drag = dragRef.current

    if (!drag) {
      return
    }

    if (dragRectRef.current) {
      commitRect(dragRectRef.current)
    }

    dragRef.current = null
    dragRectRef.current = null
    setDragRect(null)

    if (containerRef.current?.hasPointerCapture(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <Box
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      sx={{
        position: 'relative',
        width: '100%',
        height: CONTAINER_HEIGHT,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.text.primary, 0.06),
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {!loadedSize.width || !loadedSize.height ? (
        <Box
          component='img'
          src={src}
          alt=''
          onLoad={event => {
            const image = event.currentTarget
            setLoadedSize({
              width: naturalWidth || image.naturalWidth,
              height: naturalHeight || image.naturalHeight
            })
          }}
          sx={{ display: 'none' }}
        />
      ) : null}

      {layout && displayRect ? (
        <>
          <Box
            component='img'
            src={src}
            alt=''
            aria-hidden
            draggable={false}
            sx={{
              position: 'absolute',
              left: layout.offsetX,
              top: layout.offsetY,
              width: layout.displayWidth,
              height: layout.displayHeight,
              objectFit: 'fill',
              opacity: 0.4,
              pointerEvents: 'none',
              ...(filter ? { filter } : {})
            }}
          />

          <CropOverlay rect={displayRect} containerHeight={CONTAINER_HEIGHT} containerWidth={containerWidth} />

          <Box
            sx={{
              position: 'absolute',
              left: displayRect.x,
              top: displayRect.y,
              width: displayRect.width,
              height: displayRect.height,
              overflow: 'hidden',
              border: `2px solid ${theme.palette.common.white}`,
              boxSizing: 'border-box',
              cursor: 'move',
              zIndex: 1
            }}
            onPointerDown={handlePointerDown('move')}
          >
            <Box
              component='img'
              src={src}
              alt='Crop preview'
              draggable={false}
              sx={{
                position: 'absolute',
                left: -(displayRect.x - layout.offsetX),
                top: -(displayRect.y - layout.offsetY),
                width: layout.displayWidth,
                height: layout.displayHeight,
                pointerEvents: 'none',
                ...(filter ? { filter } : {})
              }}
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: displayRect.x,
              top: displayRect.y,
              width: displayRect.width,
              height: displayRect.height,
              zIndex: 2,
              pointerEvents: 'none'
            }}
          >
            {HANDLE_POSITIONS.map(item => (
              <Box
                key={item.handle}
                onPointerDown={handlePointerDown(item.handle)}
                sx={{
                  position: 'absolute',
                  width: HANDLE_SIZE,
                  height: HANDLE_SIZE,
                  borderRadius: '50%',
                  bgcolor: 'common.white',
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: theme.shadows[2],
                  pointerEvents: 'auto',
                  ...item.style
                }}
              />
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  )
}

export function createDefaultCropRect(): ImageCropSettings {
  return normalizeImageCrop({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8
  })
}
