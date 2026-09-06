import {
  BUILDER_FLOATING_PANEL_INSET,
  FLOATING_PANEL_WIDTH,
  FLOATING_PROPERTY_PANEL_WIDTH
} from '../constants/builderLayout'
import {
  BUILDER_PANEL_MIN_HEIGHT,
  BUILDER_PANEL_MIN_WIDTH,
  clampPanelRect,
  isMaximizedRect,
  type PanelRect,
  type PanelSize
} from './builderPanelFrame'

export type OverlayPanelId = 'left' | 'property' | 'ai'

export type OverlayPanelLayout = {
  id: OverlayPanelId
  rect: PanelRect
  corner: 'left' | 'right'
}

export function rectsOverlap(a: PanelRect, b: PanelRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

export function anyRectsOverlap(rects: PanelRect[]): boolean {
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      if (rectsOverlap(rects[i], rects[j])) {
        return true
      }
    }
  }

  return false
}

function columnWidthFor(panel: OverlayPanelLayout, viewport: PanelSize): number {
  if (isMaximizedRect(panel.rect, viewport)) {
    return panel.corner === 'right' ? FLOATING_PROPERTY_PANEL_WIDTH : FLOATING_PANEL_WIDTH
  }

  return Math.max(BUILDER_PANEL_MIN_WIDTH, panel.rect.width)
}

function columnX(corner: 'left' | 'right', width: number, viewport: PanelSize): number {
  const inset = BUILDER_FLOATING_PANEL_INSET

  return corner === 'left' ? inset : Math.max(inset, viewport.width - width - inset)
}

function sortFocusedFirst(panels: OverlayPanelLayout[], focusedId: OverlayPanelId): OverlayPanelLayout[] {
  const focused = panels.filter(panel => panel.id === focusedId)
  const rest = panels.filter(panel => panel.id !== focusedId)

  return [...focused, ...rest]
}

function splitColumn(
  panels: OverlayPanelLayout[],
  corner: 'left' | 'right',
  viewport: PanelSize
): OverlayPanelLayout[] {
  if (panels.length === 0) {
    return panels
  }

  const inset = BUILDER_FLOATING_PANEL_INSET
  const gap = inset
  const widths = panels.map(panel => columnWidthFor(panel, viewport))
  const width = Math.max(...widths)
  const x = columnX(corner, width, viewport)
  const usable = Math.max(BUILDER_PANEL_MIN_HEIGHT, viewport.height - inset * 2)
  const minTotal = panels.length * BUILDER_PANEL_MIN_HEIGHT + (panels.length - 1) * gap

  if (panels.length === 1 || usable >= minTotal) {
    const heightEach = Math.floor((usable - (panels.length - 1) * gap) / panels.length)
    let y = inset

    return panels.map((panel, index) => {
      const height = index === panels.length - 1 ? inset + usable - y : heightEach
      const nextWidth = columnWidthFor(panel, viewport)
      const nextX = corner === 'left' ? x : columnX(corner, nextWidth, viewport)
      const rect = clampPanelRect({ x: nextX, y, width: nextWidth, height }, viewport)

      y += height + gap

      return { ...panel, rect }
    })
  }

  let cursor = corner === 'left' ? inset : viewport.width - inset

  return panels.map(panel => {
    const nextWidth = Math.min(columnWidthFor(panel, viewport), Math.max(BUILDER_PANEL_MIN_WIDTH, viewport.width - inset * 2))
    const xPos = corner === 'left' ? cursor : cursor - nextWidth
    const rect = clampPanelRect({ x: xPos, y: inset, width: nextWidth, height: usable }, viewport)

    cursor = corner === 'left' ? xPos + nextWidth + gap : xPos - gap

    return { ...panel, rect }
  })
}

function resolveSideOverlap(left: OverlayPanelLayout[], right: OverlayPanelLayout[], viewport: PanelSize): OverlayPanelLayout[] {
  if (left.length === 0 || right.length === 0 || !anyRectsOverlap([...left, ...right].map(panel => panel.rect))) {
    return [...left, ...right]
  }

  const inset = BUILDER_FLOATING_PANEL_INSET
  const gap = inset
  const available = Math.max(BUILDER_PANEL_MIN_WIDTH * 2 + gap, viewport.width - inset * 2)
  const leftWidth = Math.max(...left.map(panel => panel.rect.width))
  const rightWidth = Math.max(...right.map(panel => panel.rect.width))
  const needed = leftWidth + rightWidth + gap

  let nextLeft = leftWidth
  let nextRight = rightWidth

  if (needed > available) {
    const scale = (available - gap) / (leftWidth + rightWidth)

    nextLeft = Math.max(BUILDER_PANEL_MIN_WIDTH, Math.floor(leftWidth * scale))
    nextRight = Math.max(BUILDER_PANEL_MIN_WIDTH, available - gap - nextLeft)
  }

  const leftX = inset
  const rightX = Math.max(inset, viewport.width - nextRight - inset)

  return [
    ...left.map(panel => ({
      ...panel,
      rect: clampPanelRect({ ...panel.rect, x: leftX, width: Math.min(panel.rect.width, nextLeft) }, viewport)
    })),
    ...right.map(panel => ({
      ...panel,
      rect: clampPanelRect({ ...panel.rect, x: rightX, width: Math.min(panel.rect.width, nextRight) }, viewport)
    }))
  ]
}

/**
 * When floating panels cover each other, share the viewport so the focused
 * panel and its neighbors stay usable instead of stacking in z-index only.
 */
export function tileOverlayRects(
  panels: OverlayPanelLayout[],
  viewport: PanelSize,
  focusedId: OverlayPanelId
): OverlayPanelLayout[] {
  if (panels.length < 2 || viewport.width < 80 || viewport.height < 80) {
    return panels
  }

  if (!anyRectsOverlap(panels.map(panel => panel.rect))) {
    return panels
  }

  const left = sortFocusedFirst(
    panels.filter(panel => panel.corner === 'left'),
    focusedId
  )
  const right = sortFocusedFirst(
    panels.filter(panel => panel.corner === 'right'),
    focusedId
  )

  const layoutGroup = (group: OverlayPanelLayout[], others: OverlayPanelLayout[], corner: 'left' | 'right') => {
    if (group.length === 0) {
      return group
    }

    const overlapsSelf = group.length > 1 && anyRectsOverlap(group.map(panel => panel.rect))
    const overlapsOthers = others.some(other => group.some(panel => rectsOverlap(panel.rect, other.rect)))

    if (!overlapsSelf && !overlapsOthers) {
      return group
    }

    return splitColumn(group, corner, viewport)
  }

  const nextLeft = layoutGroup(left, right, 'left')
  const nextRight = layoutGroup(right, nextLeft, 'right')

  return resolveSideOverlap(nextLeft, nextRight, viewport)
}
