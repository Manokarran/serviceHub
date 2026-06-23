'use client'

import { useId } from 'react'

import Box from '@mui/material/Box'

import type { ShapeBlockProps } from '../../types'
import { getLineDisplayHeight, getLineViewBox } from '../../utils/lineDividerHelpers'
import {
  getLinearGradientCoords,
  getShapeDimensions,
  getShapeLineStyle,
  getShapeOpacityFraction,
  getShapeSvgFill,
  getShapeViewBoxRx,
  isLineShape,
  SHAPE_DIAMOND_POINTS,
  SHAPE_STAR_POINTS,
  SHAPE_TRIANGLE_POINTS
} from '../../utils/shapeBlockHelpers'
import { LineDividerDefs, LineDividerGraphic } from './LineDividerGraphic'

type Props = {
  props: ShapeBlockProps
}

function ShapeGradientDef({
  props,
  gradientId
}: {
  props: ShapeBlockProps
  gradientId: string
}) {
  if (props.fillType !== 'gradient') {
    return null
  }

  if (props.gradientStyle === 'radial') {
    return (
      <radialGradient id={gradientId} cx='50%' cy='50%' r='50%'>
        <stop offset='0%' stopColor={props.gradientStart} />
        <stop offset='100%' stopColor={props.gradientEnd} />
      </radialGradient>
    )
  }

  const coords = getLinearGradientCoords(props.gradientAngle)

  return (
    <linearGradient id={gradientId} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}>
      <stop offset='0%' stopColor={props.gradientStart} />
      <stop offset='100%' stopColor={props.gradientEnd} />
    </linearGradient>
  )
}

function ShapeSvgContent({ props, gradientId }: { props: ShapeBlockProps; gradientId: string }) {
  const fill = getShapeSvgFill(props, gradientId)
  const strokeWidth = Math.max(0, props.strokeWidth)
  const stroke = strokeWidth > 0 ? props.strokeColor : 'none'
  const rx = getShapeViewBoxRx(props)

  switch (props.variant) {
    case 'rectangle':
      return (
        <rect
          x='0'
          y='0'
          width='100'
          height='100'
          rx={rx}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect='non-scaling-stroke'
        />
      )
    case 'circle':
      return (
        <circle
          cx='50'
          cy='50'
          r='50'
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect='non-scaling-stroke'
        />
      )
    case 'ellipse':
      return (
        <ellipse
          cx='50'
          cy='50'
          rx='50'
          ry='35'
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect='non-scaling-stroke'
        />
      )
    case 'triangle':
      return (
        <polygon
          points={SHAPE_TRIANGLE_POINTS}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect='non-scaling-stroke'
        />
      )
    case 'diamond':
      return (
        <polygon
          points={SHAPE_DIAMOND_POINTS}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect='non-scaling-stroke'
        />
      )
    case 'star':
      return (
        <polygon
          points={SHAPE_STAR_POINTS}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect='non-scaling-stroke'
        />
      )
    default:
      return null
  }
}

export function ShapeBlock({ props }: Props) {
  const gradientId = useId().replace(/:/g, '')
  const fadeGradientId = `${gradientId}-fade`
  const softGradientId = `${gradientId}-soft`
  const opacity = getShapeOpacityFraction(props.opacity)
  const rotation = props.rotation ?? 0
  const isLine = isLineShape(props.variant)
  const lineStyle = getShapeLineStyle(props)
  const lineViewBox = getLineViewBox(lineStyle)
  const { width } = getShapeDimensions(props)
  const lineHeight = isLine ? getLineDisplayHeight(props) : getShapeDimensions(props).height

  return (
    <Box
      sx={{
        px: 4,
        py: isLine ? 1.5 : 2,
        display: 'flex',
        justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      <Box
        sx={{
          opacity,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: 'center center',
          lineHeight: 0,
          width: isLine ? width : undefined
        }}
      >
        {isLine ? (
          <Box
            component='svg'
            viewBox={`0 0 ${lineViewBox.width} ${lineViewBox.height}`}
            preserveAspectRatio='none'
            sx={{ display: 'block', width: '100%', height: lineHeight, overflow: 'visible' }}
            aria-hidden
          >
            <defs>
              <LineDividerDefs
                props={props}
                gradientId={gradientId}
                fadeGradientId={fadeGradientId}
                softGradientId={softGradientId}
                viewBox={lineViewBox}
              />
            </defs>
            <LineDividerGraphic
              props={props}
              gradientId={gradientId}
              fadeGradientId={fadeGradientId}
              softGradientId={softGradientId}
            />
          </Box>
        ) : (
          <Box
            component='svg'
            viewBox='0 0 100 100'
            preserveAspectRatio='none'
            sx={{ display: 'block', width, height: lineHeight, overflow: 'visible' }}
            aria-hidden
          >
            <defs>
              <ShapeGradientDef props={props} gradientId={gradientId} />
            </defs>
            <ShapeSvgContent props={props} gradientId={gradientId} />
          </Box>
        )}
      </Box>
    </Box>
  )
}
