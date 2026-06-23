import type { ShapeBlockProps, ShapeLineStyle } from '../types'
import { getLineThickness, getShapeLineStyle } from './shapeBlockHelpers'

export const ARTISTIC_LINE_STYLES: ShapeLineStyle[] = ['feather', 'brush', 'sword', 'wave', 'flourish']
export const CLASSIC_LINE_STYLES: ShapeLineStyle[] = ['solid', 'dashed', 'dotted', 'double', 'fade', 'ornament']

export type LineViewBox = {
  width: number
  height: number
  centerY: number
}

const CRISP_ARTISTIC_STYLES: ShapeLineStyle[] = ['sword', 'feather', 'flourish']

export function isCrispArtisticLine(lineStyle: ShapeLineStyle): boolean {
  return CRISP_ARTISTIC_STYLES.includes(lineStyle)
}

export function getLineViewBox(lineStyle: ShapeLineStyle): LineViewBox {
  if (lineStyle === 'flourish') {
    return { width: 100, height: 36, centerY: 18 }
  }

  if (lineStyle === 'feather') {
    return { width: 100, height: 28, centerY: 14 }
  }

  if (lineStyle === 'sword') {
    return { width: 100, height: 24, centerY: 12 }
  }

  if (lineStyle === 'wave') {
    return { width: 100, height: 32, centerY: 16 }
  }

  if (lineStyle === 'brush') {
    return { width: 100, height: 28, centerY: 14 }
  }

  return { width: 100, height: 24, centerY: 12 }
}

export function getLineDisplayHeight(props: ShapeBlockProps): number {
  const lineStyle = getShapeLineStyle(props)
  const thickness = getLineThickness(props)
  const minHeight =
    lineStyle === 'flourish'
      ? 22
      : lineStyle === 'feather'
        ? 18
        : lineStyle === 'sword'
          ? 14
          : lineStyle === 'wave'
            ? 18
            : lineStyle === 'brush'
              ? 12
              : 4

  return Math.max(minHeight, Math.min(48, thickness || minHeight))
}

export function getLineThicknessInViewBox(props: ShapeBlockProps, viewBox: LineViewBox): number {
  const thickness = getLineThickness(props)
  const displayHeight = getLineDisplayHeight(props)

  return Math.max(2, (thickness / Math.max(displayHeight, 1)) * viewBox.height * 0.55)
}

/** Scale crisp artistic shapes — baseline tuned at 8px thickness */
export function getArtisticShapeScale(props: ShapeBlockProps): number {
  const thickness = getLineThickness(props)

  return Math.max(0.9, Math.min(1.6, thickness / 8))
}

export function getLineSolidColor(props: ShapeBlockProps): string {
  return props.fillColor || props.gradientStart || '#6366f1'
}

export function buildSolidBarPath(viewBox: LineViewBox, thickness: number): string {
  const y = viewBox.centerY - thickness / 2

  return `M 0 ${y} H 100 V ${y + thickness} H 0 Z`
}

export function buildBrushPath(viewBox: LineViewBox, thickness: number): string {
  const cy = viewBox.centerY
  const swell = thickness * 1.35
  const lean = thickness * 0.45

  return [
    `M 0 ${cy}`,
    `C 10 ${cy - lean} 22 ${cy - swell * 0.55} 36 ${cy - swell * 0.75}`,
    `C 50 ${cy - swell} 62 ${cy - swell * 0.35} 74 ${cy + lean * 0.35}`,
    `C 86 ${cy + swell * 0.55} 94 ${cy + lean * 0.15} 100 ${cy}`,
    `C 92 ${cy + lean * 0.55} 78 ${cy + swell * 0.45} 62 ${cy + swell * 0.2}`,
    `C 46 ${cy - lean * 0.15} 28 ${cy + swell * 0.35} 14 ${cy + lean * 0.25}`,
    `C 6 ${cy + lean * 0.1} 2 ${cy} 0 ${cy}`,
    'Z'
  ].join(' ')
}

export function buildWavePath(viewBox: LineViewBox, thickness: number): string {
  const cy = viewBox.centerY
  const amp = Math.max(2.5, thickness * 0.85)
  const band = Math.max(1.2, thickness * 0.42)

  return [
    `M 0 ${cy}`,
    `C 8 ${cy - amp} 16 ${cy + amp} 25 ${cy}`,
    `C 33 ${cy - amp} 42 ${cy + amp} 50 ${cy}`,
    `C 58 ${cy - amp} 67 ${cy + amp} 75 ${cy}`,
    `C 83 ${cy - amp} 92 ${cy + amp} 100 ${cy}`,
    `L 100 ${cy + band}`,
    `C 92 ${cy + amp + band} 83 ${cy - amp + band} 75 ${cy + band}`,
    `C 67 ${cy + amp + band} 58 ${cy - amp + band} 50 ${cy + band}`,
    `C 42 ${cy + amp + band} 33 ${cy - amp + band} 25 ${cy + band}`,
    `C 16 ${cy + amp + band} 8 ${cy - amp + band} 0 ${cy + band}`,
    'Z'
  ].join(' ')
}

export function buildFadePath(viewBox: LineViewBox, thickness: number): string {
  return buildSolidBarPath(viewBox, thickness)
}

export function usesFilledLinePath(lineStyle: ShapeLineStyle): boolean {
  return lineStyle === 'solid' || lineStyle === 'fade' || lineStyle === 'brush' || lineStyle === 'wave'
}

export function getFilledLinePath(lineStyle: ShapeLineStyle, viewBox: LineViewBox, thickness: number): string {
  switch (lineStyle) {
    case 'brush':
      return buildBrushPath(viewBox, thickness)
    case 'wave':
      return buildWavePath(viewBox, thickness)
    case 'fade':
      return buildFadePath(viewBox, thickness)
    default:
      return buildSolidBarPath(viewBox, thickness)
  }
}

export function getStrokeDashProps(lineStyle: ShapeLineStyle, thickness: number) {
  if (lineStyle === 'dashed') {
    return { strokeDasharray: `${Math.max(8, thickness * 2.4)} ${Math.max(5, thickness * 1.6)}` }
  }

  if (lineStyle === 'dotted') {
    return {
      strokeDasharray: `${Math.max(0.8, thickness * 0.35)} ${Math.max(4, thickness * 1.35)}`,
      strokeLinecap: 'round' as const
    }
  }

  return {}
}

/** Crisp sword blade — fixed coordinates in 100×24 viewBox, centerY=12 */
export function getSwordDividerElements(scale: number) {
  const s = scale
  const cy = 12

  return {
    bladePath: [
      `M 0 ${cy}`,
      `L ${10 * s} ${cy - 1.2 * s}`,
      `L 50 ${cy - 5.5 * s}`,
      `L ${100 - 10 * s} ${cy - 1.2 * s}`,
      `L 100 ${cy}`,
      `L ${100 - 10 * s} ${cy + 1.2 * s}`,
      `L 50 ${cy + 5.5 * s}`,
      `L ${10 * s} ${cy + 1.2 * s}`,
      'Z'
    ].join(' '),
    centerRidge: `M 50 ${cy - 4.5 * s} V ${cy + 4.5 * s}`
  }
}

/** Crisp quill feather — fixed coordinates in 100×28 viewBox, centerY=14 */
export function getFeatherDividerElements(scale: number) {
  const s = scale
  const cy = 14

  return {
    bodyPath: [
      `M 0 ${cy}`,
      `L ${8 * s} ${cy - 2.2 * s}`,
      `L ${22 * s} ${cy - 4.8 * s}`,
      `L 50 ${cy - 6 * s}`,
      `L ${100 - 22 * s} ${cy - 4.8 * s}`,
      `L ${100 - 8 * s} ${cy - 2.2 * s}`,
      `L 100 ${cy}`,
      `L ${100 - 8 * s} ${cy + 2.2 * s}`,
      `L ${100 - 22 * s} ${cy + 4.8 * s}`,
      `L 50 ${cy + 6 * s}`,
      `L ${22 * s} ${cy + 4.8 * s}`,
      `L ${8 * s} ${cy + 2.2 * s}`,
      'Z'
    ].join(' '),
    spine: { x1: 4, y1: cy, x2: 96, y2: cy },
    barbs: [
      { x1: 22, y1: cy - 3.5 * s, x2: 26, y2: cy - 0.4 * s },
      { x1: 36, y1: cy - 4.8 * s, x2: 39, y2: cy - 0.8 * s },
      { x1: 50, y1: cy - 5.5 * s, x2: 50, y2: cy - 1 * s },
      { x1: 64, y1: cy - 4.8 * s, x2: 61, y2: cy - 0.8 * s },
      { x1: 78, y1: cy - 3.5 * s, x2: 74, y2: cy - 0.4 * s },
      { x1: 22, y1: cy + 3.5 * s, x2: 26, y2: cy + 0.4 * s },
      { x1: 36, y1: cy + 4.8 * s, x2: 39, y2: cy + 0.8 * s },
      { x1: 64, y1: cy + 4.8 * s, x2: 61, y2: cy + 0.8 * s },
      { x1: 78, y1: cy + 3.5 * s, x2: 74, y2: cy + 0.4 * s }
    ]
  }
}

/** Crisp editorial flourish — fixed coordinates in 100×36 viewBox, centerY=18 */
export function getFlourishDividerElements(scale: number) {
  const s = scale
  const cy = 18
  const armH = 2.2 * s
  const armY = cy - armH / 2

  return {
    leftArm: { x: 0, y: armY, width: 34, height: armH, rx: armH / 2 },
    rightArm: { x: 66, y: armY, width: 34, height: armH, rx: armH / 2 },
    leftTick: { x1: 34, y1: cy - 4.5 * s, x2: 34, y2: cy + 4.5 * s },
    rightTick: { x1: 66, y1: cy - 4.5 * s, x2: 66, y2: cy + 4.5 * s },
    diamondPoints: [
      [50, cy - 6.5 * s],
      [50 + 6.5 * s, cy],
      [50, cy + 6.5 * s],
      [50 - 6.5 * s, cy]
    ] as [number, number][],
    topArc: [
      `M ${50 - 5 * s} ${cy - 2 * s}`,
      `Q 50 ${cy - 8.5 * s} ${50 + 5 * s} ${cy - 2 * s}`
    ].join(' '),
    bottomArc: [
      `M ${50 - 4 * s} ${cy + 2.5 * s}`,
      `Q 50 ${cy + 7.5 * s} ${50 + 4 * s} ${cy + 2.5 * s}`
    ].join(' '),
    dots: [
      { cx: 34, cy, r: 1.3 * s },
      { cx: 66, cy, r: 1.3 * s }
    ]
  }
}
