import {
  BUILDER_CANVAS_TOOLBAR_HEIGHT,
  BUILDER_FLOATING_PANEL_INSET,
  FLOATING_PANEL_EXPANDED_WIDTH,
  FLOATING_PANEL_WIDTH,
  FLOATING_PROPERTY_PANEL_WIDTH
} from '../constants/builderLayout'
import { readBuilderLeftChrome } from './builderContainerChrome'

export const BUILDER_PANEL_MIN_WIDTH = 240
export const BUILDER_PANEL_MIN_HEIGHT = 200
export const BUILDER_DOCKED_CANVAS_MIN = 240
export const BUILDER_LEFT_FRAME_KEY = 'servicehub-builder-left-frame'
export const BUILDER_PROPERTY_FRAME_KEY = 'servicehub-builder-property-frame'

export type PanelRect = {
  x: number
  y: number
  width: number
  height: number
}

export type PanelSize = {
  width: number
  height: number
}

export type PanelLayoutMode = 'overlay' | 'docked'

export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function defaultPanelRect(corner: 'left' | 'right', parent: PanelSize): PanelRect {
  const width = corner === 'left' ? FLOATING_PANEL_WIDTH : FLOATING_PROPERTY_PANEL_WIDTH
  const height = Math.max(
    BUILDER_PANEL_MIN_HEIGHT,
    parent.height - BUILDER_CANVAS_TOOLBAR_HEIGHT - BUILDER_FLOATING_PANEL_INSET * 2
  )
  const y = BUILDER_CANVAS_TOOLBAR_HEIGHT + BUILDER_FLOATING_PANEL_INSET
  const x =
    corner === 'left'
      ? BUILDER_FLOATING_PANEL_INSET
      : Math.max(BUILDER_FLOATING_PANEL_INSET, parent.width - width - BUILDER_FLOATING_PANEL_INSET)

  return { x, y, width, height }
}

export function maximizePanelRect(parent: PanelSize): PanelRect {
  return {
    x: BUILDER_FLOATING_PANEL_INSET,
    y: BUILDER_FLOATING_PANEL_INSET,
    width: Math.max(BUILDER_PANEL_MIN_WIDTH, parent.width - BUILDER_FLOATING_PANEL_INSET * 2),
    height: Math.max(BUILDER_PANEL_MIN_HEIGHT, parent.height - BUILDER_FLOATING_PANEL_INSET * 2)
  }
}

export function rectsEqual(a: PanelRect | null, b: PanelRect | null) {
  if (a === b) {
    return true
  }

  if (!a || !b) {
    return false
  }

  return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

export function isMaximizedRect(rect: PanelRect, parent: PanelSize) {
  const max = maximizePanelRect(parent)

  return (
    Math.abs(rect.width - max.width) < 24 &&
    Math.abs(rect.height - max.height) < 24 &&
    Math.abs(rect.x - max.x) < 24 &&
    Math.abs(rect.y - max.y) < 24
  )
}

export function clampDockedPanelWidth(width: number, parent: PanelSize): number {
  const maxWidth = Math.max(BUILDER_PANEL_MIN_WIDTH, parent.width - BUILDER_DOCKED_CANVAS_MIN)

  return Math.round(clamp(width, BUILDER_PANEL_MIN_WIDTH, maxWidth))
}

export function isDockedMaximized(rect: PanelRect, parent: PanelSize) {
  return Math.abs(rect.width - clampDockedPanelWidth(Number.POSITIVE_INFINITY, parent)) < 16
}

export function clampPanelRect(rect: PanelRect, parent: PanelSize): PanelRect {
  if (parent.width < BUILDER_PANEL_MIN_WIDTH || parent.height < BUILDER_PANEL_MIN_HEIGHT) {
    return rect
  }

  const maxWidth = Math.max(BUILDER_PANEL_MIN_WIDTH, parent.width - BUILDER_FLOATING_PANEL_INSET * 2)
  const maxHeight = Math.max(BUILDER_PANEL_MIN_HEIGHT, parent.height - BUILDER_FLOATING_PANEL_INSET * 2)
  const width = Math.round(clamp(rect.width, BUILDER_PANEL_MIN_WIDTH, maxWidth))
  const height = Math.round(clamp(rect.height, BUILDER_PANEL_MIN_HEIGHT, maxHeight))
  const x = Math.round(clamp(rect.x, BUILDER_FLOATING_PANEL_INSET, parent.width - width - BUILDER_FLOATING_PANEL_INSET))
  const y = Math.round(clamp(rect.y, BUILDER_FLOATING_PANEL_INSET, parent.height - height - BUILDER_FLOATING_PANEL_INSET))

  return { x, y, width, height }
}

export function resizePanelRect(origin: PanelRect, handle: ResizeHandle, dx: number, dy: number): PanelRect {
  let { x, y, width, height } = origin

  if (handle.includes('e')) {
    width += dx
  }

  if (handle.includes('s')) {
    height += dy
  }

  if (handle.includes('w')) {
    width -= dx
    x += dx
  }

  if (handle.includes('n')) {
    height -= dy
    y += dy
  }

  return { x, y, width, height }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function parsePanelRect(value: unknown): PanelRect | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>

  if (!isFiniteNumber(record.x) || !isFiniteNumber(record.y) || !isFiniteNumber(record.width) || !isFiniteNumber(record.height)) {
    return null
  }

  return {
    x: record.x,
    y: record.y,
    width: record.width,
    height: record.height
  }
}

export function readStoredPanelRect(storageKey: string): PanelRect | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = localStorage.getItem(storageKey)

    if (!raw) {
      return storageKey === BUILDER_LEFT_FRAME_KEY ? readLegacyLeftPanelRect() : null
    }

    return parsePanelRect(JSON.parse(raw)) ?? (storageKey === BUILDER_LEFT_FRAME_KEY ? readLegacyLeftPanelRect() : null)
  } catch {
    return storageKey === BUILDER_LEFT_FRAME_KEY ? readLegacyLeftPanelRect() : null
  }
}

export function writeStoredPanelRect(storageKey: string, rect: PanelRect) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(storageKey, JSON.stringify(rect))
}

function readLegacyLeftPanelRect(): PanelRect | null {
  const chrome = readBuilderLeftChrome()
  const hasLegacy = chrome.expanded || chrome.offset.x !== 0 || chrome.offset.y !== 0

  if (!hasLegacy) {
    return null
  }

  return {
    x: BUILDER_FLOATING_PANEL_INSET + chrome.offset.x,
    y: BUILDER_CANVAS_TOOLBAR_HEIGHT + BUILDER_FLOATING_PANEL_INSET + chrome.offset.y,
    width: chrome.expanded ? FLOATING_PANEL_EXPANDED_WIDTH : FLOATING_PANEL_WIDTH,
    height: BUILDER_PANEL_MIN_HEIGHT
  }
}
