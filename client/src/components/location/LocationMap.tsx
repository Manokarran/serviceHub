'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

import type { LocationMapStyle } from '@/lib/location/types'

const TILE_SIZE = 256
const DEFAULT_ZOOM = 3
const MIN_ZOOM = 1
const MAX_ZOOM = 19
const MAX_LATITUDE = 85.05112878

type Point = {
  latitude: number
  longitude: number
}

type Props = {
  latitude: number | null | undefined
  longitude: number | null | undefined
  zoom?: number
  interactive?: boolean
  onChange?: (point: Point) => void
  height?: number
  markerLabel?: string
  mapStyle?: LocationMapStyle
  showControls?: boolean
  accentColor?: string
  surfaceColor?: string
  textColor?: string
}

function clampLatitude(latitude: number) {
  return Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude))
}

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180
}

function toWorldPixel(point: Point, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom
  const latitude = clampLatitude(point.latitude)
  const sin = Math.sin((latitude * Math.PI) / 180)

  return {
    x: ((point.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  }
}

function fromWorldPixel(x: number, y: number, zoom: number): Point {
  const scale = TILE_SIZE * 2 ** zoom
  const longitude = normalizeLongitude((x / scale) * 360 - 180)
  const latitude = (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale))) * 180) / Math.PI

  return { latitude, longitude }
}

function tileUrl(x: number, y: number, zoom: number) {
  const count = 2 ** zoom
  const wrappedX = ((x % count) + count) % count

  return `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`
}

export function LocationMap({
  latitude,
  longitude,
  zoom = DEFAULT_ZOOM,
  interactive = false,
  onChange,
  height = 260,
  markerLabel,
  mapStyle = 'theme',
  showControls = true,
  accentColor = '#2563eb',
  surfaceColor = 'rgb(255 255 255 / 92%)',
  textColor = '#0f172a'
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height })
  const [mapZoom, setMapZoom] = useState(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)))
  const [tileState, setTileState] = useState({ loaded: 0, failed: 0 })
  const activeZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, mapZoom))

  useEffect(() => {
    setMapZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)))
  }, [zoom])

  const center = {
    latitude: latitude ?? 20,
    longitude: longitude ?? 0
  }

  const hasPoint = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined
  const centerPixel = toWorldPixel(center, activeZoom)

  const centerTileX = Math.floor(centerPixel.x / TILE_SIZE)
  const centerTileY = Math.floor(centerPixel.y / TILE_SIZE)

  const tiles = useMemo(() => {
    const entries: { key: string; x: number; y: number }[] = []

    for (let y = centerTileY - 2; y <= centerTileY + 2; y += 1) {
      if (y < 0 || y >= 2 ** activeZoom) {
        continue
      }

      for (let x = centerTileX - 4; x <= centerTileX + 4; x += 1) {
        entries.push({ key: `${x}:${y}`, x, y })
      }
    }

    return entries
  }, [centerTileX, centerTileY, activeZoom])

  const tileSetKey = tiles.map(tile => tile.key).join('|')

  useEffect(() => {
    setTileState({ loaded: 0, failed: 0 })
  }, [tileSetKey])

  useEffect(() => {
    const element = containerRef.current

    if (!element) {
      return
    }

    const updateSize = () => setSize({ width: element.clientWidth, height: element.clientHeight })

    updateSize()

    const observer = new ResizeObserver(updateSize)

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onChange || !size.width) {
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()

    const point = fromWorldPixel(
      centerPixel.x + event.clientX - bounds.left - bounds.width / 2,
      centerPixel.y + event.clientY - bounds.top - bounds.height / 2,
      activeZoom
    )

    onChange(point)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !interactive ||
      !onChange ||
      event.target !== event.currentTarget ||
      (event.key !== 'Enter' && event.key !== ' ')
    ) {
      return
    }

    event.preventDefault()
    onChange(center)
  }

  const markerLeft = size.width / 2 + toWorldPixel(center, activeZoom).x - centerPixel.x
  const markerTop = size.height / 2 + toWorldPixel(center, activeZoom).y - centerPixel.y
  const tilesUnavailable = size.width > 0 && tiles.length > 0 && tileState.failed >= tiles.length
  const tilesLoading = size.width > 0 && !tilesUnavailable && tileState.loaded === 0

  const tileFilter =
    mapStyle === 'monochrome'
      ? 'grayscale(1) saturate(0.2) contrast(0.92)'
      : mapStyle === 'muted'
        ? 'saturate(0.7) contrast(0.95) brightness(1.03)'
        : mapStyle === 'warm'
          ? 'sepia(0.16) saturate(1.08) hue-rotate(-8deg)'
          : mapStyle === 'theme'
            ? 'saturate(0.86) contrast(0.96)'
            : undefined

  const adjustZoom = (amount: number) => {
    setMapZoom(current => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, current + amount)))
  }

  return (
    <Box
      ref={containerRef}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={
        interactive
          ? 'Select a location on the map'
          : markerLabel
            ? `Location map showing ${markerLabel}`
            : 'Location map'
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        position: 'relative',
        height,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: surfaceColor,
        cursor: interactive ? 'crosshair' : 'default'
      }}
    >
      {size.width > 0 &&
        tiles.map(tile => (
          <Box
            key={tile.key}
            component='img'
            src={tileUrl(tile.x, tile.y, activeZoom)}
            alt=''
            draggable={false}
            onLoad={() => setTileState(current => ({ ...current, loaded: current.loaded + 1 }))}
            onError={() => setTileState(current => ({ ...current, failed: current.failed + 1 }))}
            sx={{
              position: 'absolute',
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: tile.x * TILE_SIZE - centerPixel.x + size.width / 2,
              top: tile.y * TILE_SIZE - centerPixel.y + size.height / 2,
              maxWidth: 'none',
              userSelect: 'none',
              filter: tileFilter
            }}
          />
        ))}
      {mapStyle === 'theme' && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 18%, transparent), transparent 68%)`,
            mixBlendMode: 'color',
            opacity: 0.7
          }}
        />
      )}
      {tilesLoading ? (
        <Box
          role='status'
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            bgcolor: surfaceColor,
            color: textColor,
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          <CircularProgress size={22} aria-label='Loading map' />
          <Typography variant='caption' sx={{ fontWeight: 600 }}>
            Loading map…
          </Typography>
        </Box>
      ) : null}
      {tilesUnavailable ? (
        <Box
          role='alert'
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            bgcolor: surfaceColor,
            color: textColor,
            zIndex: 2,
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <Typography variant='caption' sx={{ fontWeight: 600 }}>
            Map tiles are unavailable. The location pin is still shown.
          </Typography>
        </Box>
      ) : null}
      {hasPoint ? (
        <Box
          aria-label={markerLabel ? `Selected location: ${markerLabel}` : 'Selected location'}
          sx={{
            position: 'absolute',
            left: markerLeft,
            top: markerTop,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 2
          }}
        >
          {markerLabel ? (
            <Typography
              variant='caption'
              noWrap
              sx={{
                maxWidth: { xs: 180, sm: 260 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 0.5,
                px: 1,
                py: 0.35,
                borderRadius: 1,
                bgcolor: surfaceColor,
                color: textColor,
                fontWeight: 700,
                boxShadow: `0 2px 8px color-mix(in srgb, ${accentColor} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 22%, transparent)`
              }}
            >
              {markerLabel}
            </Typography>
          ) : null}
          <Box
            aria-hidden
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50% 50% 50% 0',
              rotate: '-45deg',
              backgroundColor: accentColor,
              border: `2px solid ${surfaceColor}`,
              boxShadow: `0 2px 8px color-mix(in srgb, ${accentColor} 45%, transparent)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'white',
                rotate: '45deg'
              }}
            />
          </Box>
        </Box>
      ) : null}
      {showControls && (
        <Box
          onClick={event => event.stopPropagation()}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            p: 0.5,
            borderRadius: 1.5,
            bgcolor: surfaceColor,
            color: textColor,
            border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
            boxShadow: `0 4px 14px color-mix(in srgb, ${accentColor} 20%, transparent)`,
            zIndex: 3,
            '& .MuiIconButton-root': {
              color: textColor,
              '&:hover': {
                backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                color: accentColor
              }
            }
          }}
        >
          <Tooltip title='Zoom in'>
            <span>
              <IconButton
                size='small'
                onClick={() => adjustZoom(1)}
                disabled={activeZoom >= MAX_ZOOM}
                aria-label='Zoom in'
                sx={{ width: 28, height: 28 }}
              >
                <i className='ri-add-line' aria-hidden='true' />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Zoom out'>
            <span>
              <IconButton
                size='small'
                onClick={() => adjustZoom(-1)}
                disabled={activeZoom <= MIN_ZOOM}
                aria-label='Zoom out'
                sx={{ width: 28, height: 28 }}
              >
                <i className='ri-subtract-line' aria-hidden='true' />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Reset map view'>
            <IconButton
              size='small'
              onClick={() => setMapZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)))}
              aria-label='Reset map view'
              sx={{ width: 28, height: 28 }}
            >
              <i className='ri-focus-3-line' aria-hidden='true' />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {interactive && (
        <Typography
          variant='caption'
          sx={{
            position: 'absolute',
            left: 8,
            bottom: 8,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: surfaceColor,
            color: textColor,
            border: `1px solid color-mix(in srgb, ${accentColor} 22%, transparent)`,
            fontWeight: 600,
            pointerEvents: 'none'
          }}
        >
          Click the map to place your pin
        </Typography>
      )}
      <Typography
        component='a'
        href='https://www.openstreetmap.org/copyright'
        target='_blank'
        rel='noreferrer'
        onClick={event => event.stopPropagation()}
        variant='caption'
        sx={{
          position: 'absolute',
          right: 4,
          bottom: 2,
          color: textColor,
          bgcolor: surfaceColor,
          px: 0.5,
          fontSize: '0.625rem',
          lineHeight: 1.2,
          zIndex: 3
        }}
      >
        © OpenStreetMap
      </Typography>
    </Box>
  )
}
