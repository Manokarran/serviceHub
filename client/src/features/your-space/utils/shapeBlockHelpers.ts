import type { ShapeBlockProps, ShapeLineStyle, ShapeVariant } from '../types'

export function isLineShape(variant: ShapeVariant): boolean {
  return variant === 'line'
}

export function getShapeLineStyle(props: ShapeBlockProps): ShapeLineStyle {
  return props.lineStyle ?? 'solid'
}

export function getShapeOpacityFraction(opacity?: number): number {
  const value = opacity ?? 100

  return Math.min(100, Math.max(0, value)) / 100
}

export function getLinearGradientCoords(angle: number): { x1: string; y1: string; x2: string; y2: string } {
  const radians = ((angle - 90) * Math.PI) / 180
  const x = Math.cos(radians)
  const y = Math.sin(radians)

  return {
    x1: `${50 - x * 50}%`,
    y1: `${50 - y * 50}%`,
    x2: `${50 + x * 50}%`,
    y2: `${50 + y * 50}%`
  }
}

export function buildShapeCssBackground(
  props: Pick<
    ShapeBlockProps,
    'fillType' | 'fillColor' | 'gradientStart' | 'gradientEnd' | 'gradientAngle' | 'gradientStyle'
  >
): string {
  if (props.fillType === 'solid') {
    return props.fillColor
  }

  if (props.gradientStyle === 'radial') {
    return `radial-gradient(circle at center, ${props.gradientStart} 0%, ${props.gradientEnd} 100%)`
  }

  return `linear-gradient(${props.gradientAngle}deg, ${props.gradientStart} 0%, ${props.gradientEnd} 100%)`
}

export function getShapeSvgFill(
  props: Pick<ShapeBlockProps, 'fillType' | 'fillColor'>,
  gradientId: string
): string {
  return props.fillType === 'solid' ? props.fillColor : `url(#${gradientId})`
}

export function getShapeBorderRadiusPx(props: ShapeBlockProps): number {
  if (props.variant !== 'rectangle') {
    return 0
  }

  return Math.max(0, props.borderRadius ?? 0)
}

export function getShapeViewBoxRx(props: ShapeBlockProps): number {
  const radius = getShapeBorderRadiusPx(props)
  const minDimension = Math.min(props.width, props.height)

  if (minDimension <= 0) {
    return 0
  }

  return Math.min(50, (radius / minDimension) * 100)
}

export function getShapeClipPath(variant: ShapeVariant): string | undefined {
  switch (variant) {
    case 'triangle':
      return 'polygon(50% 0%, 100% 100%, 0% 100%)'
    case 'diamond':
      return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
    case 'star':
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
    default:
      return undefined
  }
}

export function getShapeDimensions(props: ShapeBlockProps): { width: number; height: number } {
  const width = Math.max(24, props.width)

  if (props.variant === 'line') {
    return {
      width,
      height: Math.max(4, Math.min(48, props.height || 4))
    }
  }

  let height = Math.max(24, props.height)

  if (props.variant === 'circle') {
    height = width
  }

  return { width, height }
}

export function getLineThickness(props: ShapeBlockProps): number {
  return Math.max(1, Math.min(24, props.height || 4))
}

export function getShapeBorderRadiusCss(props: ShapeBlockProps): string | undefined {
  if (props.variant === 'rectangle') {
    return `${getShapeBorderRadiusPx(props)}px`
  }

  if (props.variant === 'circle') {
    return '50%'
  }

  if (props.variant === 'ellipse') {
    return '50%'
  }

  return undefined
}

export const SHAPE_STAR_POINTS = '50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35'
export const SHAPE_TRIANGLE_POINTS = '50,5 95,95 5,95'
export const SHAPE_DIAMOND_POINTS = '50,5 95,50 50,95 5,50'
