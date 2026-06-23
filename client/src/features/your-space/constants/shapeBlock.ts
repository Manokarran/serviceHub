import type { ShapeBlockProps, ShapeGradientStyle, ShapeLineStyle, ShapeVariant } from '../types'

export type ShapeVariantOption = {
  value: ShapeVariant
  label: string
  icon: string
}

export type ShapeLineStyleOption = {
  value: ShapeLineStyle
  label: string
  icon: string
  group?: 'classic' | 'artistic'
}

export const SHAPE_VARIANT_OPTIONS: ShapeVariantOption[] = [
  { value: 'rectangle', label: 'Rectangle', icon: 'ri-square-line' },
  { value: 'circle', label: 'Circle', icon: 'ri-checkbox-blank-circle-line' },
  { value: 'ellipse', label: 'Ellipse', icon: 'ri-oval-line' },
  { value: 'triangle', label: 'Triangle', icon: 'ri-triangle-line' },
  { value: 'diamond', label: 'Diamond', icon: 'ri-diamond-line' },
  { value: 'star', label: 'Star', icon: 'ri-star-line' },
  { value: 'line', label: 'Line', icon: 'ri-separator' }
]

export const SHAPE_LINE_STYLE_OPTIONS: ShapeLineStyleOption[] = [
  { value: 'solid', label: 'Solid', icon: 'ri-subtract-line', group: 'classic' },
  { value: 'dashed', label: 'Dashed', icon: 'ri-more-line', group: 'classic' },
  { value: 'dotted', label: 'Dotted', icon: 'ri-drag-drop-line', group: 'classic' },
  { value: 'double', label: 'Double', icon: 'ri-layout-row-line', group: 'classic' },
  { value: 'fade', label: 'Fade', icon: 'ri-contrast-drop-line', group: 'classic' },
  { value: 'ornament', label: 'Ornament', icon: 'ri-record-circle-line', group: 'classic' },
  { value: 'feather', label: 'Feather', icon: 'ri-windy-line', group: 'artistic' },
  { value: 'brush', label: 'Brush', icon: 'ri-brush-line', group: 'artistic' },
  { value: 'sword', label: 'Sword', icon: 'ri-sword-line', group: 'artistic' },
  { value: 'wave', label: 'Wave', icon: 'ri-water-flash-line', group: 'artistic' },
  { value: 'flourish', label: 'Flourish', icon: 'ri-flower-line', group: 'artistic' }
]

export const CLASSIC_LINE_STYLE_OPTIONS = SHAPE_LINE_STYLE_OPTIONS.filter(option => option.group === 'classic')
export const ARTISTIC_LINE_STYLE_OPTIONS = SHAPE_LINE_STYLE_OPTIONS.filter(option => option.group === 'artistic')

export const SHAPE_GRADIENT_STYLE_OPTIONS: { value: ShapeGradientStyle; label: string; icon: string }[] = [
  { value: 'linear', label: 'Linear', icon: 'ri-arrow-right-up-line' },
  { value: 'radial', label: 'Radial', icon: 'ri-focus-3-line' }
]

export const DEFAULT_SHAPE_PROPS: ShapeBlockProps = {
  variant: 'rectangle',
  alignment: 'center',
  width: 200,
  height: 200,
  fillType: 'gradient',
  fillColor: '#6366f1',
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  gradientAngle: 135,
  gradientStyle: 'linear',
  strokeWidth: 0,
  strokeColor: '#1a1a2e',
  opacity: 100,
  rotation: 0,
  borderRadius: 12,
  lineStyle: 'solid'
}

export const DEFAULT_LINE_SHAPE_PROPS: Pick<
  ShapeBlockProps,
  'variant' | 'width' | 'height' | 'fillType' | 'lineStyle' | 'strokeWidth' | 'rotation' | 'borderRadius'
> = {
  variant: 'line',
  width: 480,
  height: 8,
  fillType: 'solid',
  lineStyle: 'solid',
  strokeWidth: 0,
  rotation: 0,
  borderRadius: 0
}

export function getShapeVariantDefaults(
  variant: ShapeVariant,
  current: ShapeBlockProps
): Partial<ShapeBlockProps> {
  if (variant === 'line') {
    return {
      ...DEFAULT_LINE_SHAPE_PROPS,
      fillColor: current.fillColor,
      gradientStart: current.gradientStart,
      gradientEnd: current.gradientEnd
    }
  }

  if (current.variant === 'line') {
    return {
      variant,
      width: 200,
      height: variant === 'circle' ? 200 : 200
    }
  }

  if (variant === 'circle') {
    return { variant, height: current.width }
  }

  return { variant }
}
