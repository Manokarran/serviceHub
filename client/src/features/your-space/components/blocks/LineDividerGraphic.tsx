'use client'

import type { ShapeBlockProps } from '../../types'
import {
  getArtisticShapeScale,
  getFeatherDividerElements,
  getFilledLinePath,
  getFlourishDividerElements,
  getLineSolidColor,
  getLineThicknessInViewBox,
  getLineViewBox,
  getStrokeDashProps,
  getSwordDividerElements,
  usesFilledLinePath
} from '../../utils/lineDividerHelpers'
import { getLineThickness, getShapeLineStyle } from '../../utils/shapeBlockHelpers'

type Props = {
  props: ShapeBlockProps
  gradientId: string
  fadeGradientId: string
  softGradientId: string
}

function LineGradientDefs({
  props,
  gradientId,
  fadeGradientId,
  viewBox
}: Props & { viewBox: ReturnType<typeof getLineViewBox> }) {
  const { centerY } = viewBox
  const solidColor = getLineSolidColor(props)

  return (
    <>
      {props.fillType === 'gradient' && (
        <linearGradient id={gradientId} gradientUnits='userSpaceOnUse' x1='0' y1={centerY} x2='100' y2={centerY}>
          <stop offset='0%' stopColor={props.gradientStart} />
          <stop offset='100%' stopColor={props.gradientEnd} />
        </linearGradient>
      )}
      <linearGradient id={fadeGradientId} gradientUnits='userSpaceOnUse' x1='0' y1={centerY} x2='100' y2={centerY}>
        {props.fillType === 'gradient' ? (
          <>
            <stop offset='0%' stopColor={props.gradientStart} stopOpacity={0} />
            <stop offset='50%' stopColor={props.gradientEnd} stopOpacity={1} />
            <stop offset='100%' stopColor={props.gradientStart} stopOpacity={0} />
          </>
        ) : (
          <>
            <stop offset='0%' stopColor={solidColor} stopOpacity={0} />
            <stop offset='50%' stopColor={solidColor} stopOpacity={1} />
            <stop offset='100%' stopColor={solidColor} stopOpacity={0} />
          </>
        )}
      </linearGradient>
    </>
  )
}

function getFillPaint(props: ShapeBlockProps, gradientId: string, fadeGradientId: string, useFade: boolean): string {
  if (useFade) {
    return `url(#${fadeGradientId})`
  }

  if (props.fillType === 'gradient') {
    return `url(#${gradientId})`
  }

  return getLineSolidColor(props)
}

function getStrokePaint(props: ShapeBlockProps, gradientId: string, fadeGradientId: string, useFade: boolean): string {
  return getFillPaint(props, gradientId, fadeGradientId, useFade)
}

function CrispSwordDivider({ paint, scale }: { paint: string; scale: number }) {
  const { bladePath, centerRidge } = getSwordDividerElements(scale)

  return (
    <>
      <path d={bladePath} fill={paint} shapeRendering='geometricPrecision' />
      <path
        d={centerRidge}
        stroke={paint}
        strokeWidth={0.8}
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
        opacity={0.55}
      />
    </>
  )
}

function CrispFeatherDivider({ paint, scale }: { paint: string; scale: number }) {
  const { bodyPath, spine, barbs } = getFeatherDividerElements(scale)

  return (
    <>
      <path d={bodyPath} fill={paint} shapeRendering='geometricPrecision' />
      <line
        x1={spine.x1}
        y1={spine.y1}
        x2={spine.x2}
        y2={spine.y2}
        stroke={paint}
        strokeWidth={1.1}
        strokeLinecap='round'
        vectorEffect='non-scaling-stroke'
        opacity={0.7}
      />
      {barbs.map((barb, index) => (
        <line
          key={index}
          x1={barb.x1}
          y1={barb.y1}
          x2={barb.x2}
          y2={barb.y2}
          stroke={paint}
          strokeWidth={0.9}
          strokeLinecap='round'
          vectorEffect='non-scaling-stroke'
          opacity={0.85}
        />
      ))}
    </>
  )
}

function CrispFlourishDivider({ paint, scale }: { paint: string; scale: number }) {
  const elements = getFlourishDividerElements(scale)
  const diamondPoints = elements.diamondPoints.map(([x, y]) => `${x},${y}`).join(' ')
  const strokeW = Math.max(1.2, 1.6 * scale)

  return (
    <>
      <rect
        x={elements.leftArm.x}
        y={elements.leftArm.y}
        width={elements.leftArm.width}
        height={elements.leftArm.height}
        rx={elements.leftArm.rx}
        fill={paint}
      />
      <rect
        x={elements.rightArm.x}
        y={elements.rightArm.y}
        width={elements.rightArm.width}
        height={elements.rightArm.height}
        rx={elements.rightArm.rx}
        fill={paint}
      />
      <line
        x1={elements.leftTick.x1}
        y1={elements.leftTick.y1}
        x2={elements.leftTick.x2}
        y2={elements.leftTick.y2}
        stroke={paint}
        strokeWidth={strokeW}
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
      />
      <line
        x1={elements.rightTick.x1}
        y1={elements.rightTick.y1}
        x2={elements.rightTick.x2}
        y2={elements.rightTick.y2}
        stroke={paint}
        strokeWidth={strokeW}
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
      />
      {elements.dots.map((dot, index) => (
        <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.r} fill={paint} />
      ))}
      <polygon points={diamondPoints} fill={paint} shapeRendering='geometricPrecision' />
      <path
        d={elements.topArc}
        fill='none'
        stroke={paint}
        strokeWidth={strokeW * 0.85}
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
      />
      <path
        d={elements.bottomArc}
        fill='none'
        stroke={paint}
        strokeWidth={strokeW * 0.85}
        vectorEffect='non-scaling-stroke'
        strokeLinecap='round'
      />
    </>
  )
}

export function LineDividerGraphic({ props, gradientId, fadeGradientId }: Props) {
  const lineStyle = getShapeLineStyle(props)
  const viewBox = getLineViewBox(lineStyle)
  const thickness = getLineThicknessInViewBox(props, viewBox)
  const scale = getArtisticShapeScale(props)
  const { centerY } = viewBox
  const strokeWidth = Math.max(1, getLineThickness(props) * 0.55)
  const fillPaint = getFillPaint(props, gradientId, fadeGradientId, lineStyle === 'fade')
  const strokePaint = getStrokePaint(props, gradientId, fadeGradientId, lineStyle === 'fade')

  if (lineStyle === 'sword') {
    return <CrispSwordDivider paint={fillPaint} scale={scale} />
  }

  if (lineStyle === 'feather') {
    return <CrispFeatherDivider paint={fillPaint} scale={scale} />
  }

  if (lineStyle === 'flourish') {
    return <CrispFlourishDivider paint={fillPaint} scale={scale} />
  }

  if (usesFilledLinePath(lineStyle)) {
    if (lineStyle === 'solid') {
      const barHeight = thickness
      const y = centerY - barHeight / 2
      const radius = Math.min(barHeight / 2, 1.8)

      return <rect x='0' y={y} width='100' height={barHeight} rx={radius} fill={fillPaint} />
    }

    return <path d={getFilledLinePath(lineStyle, viewBox, thickness)} fill={fillPaint} shapeRendering='geometricPrecision' />
  }

  if (lineStyle === 'double') {
    const gap = Math.max(1.8, thickness * 0.65)
    const lineStroke = Math.max(1, thickness * 0.42)

    return (
      <>
        <line x1='0' y1={centerY - gap} x2='100' y2={centerY - gap} stroke={strokePaint} strokeWidth={lineStroke} vectorEffect='non-scaling-stroke' />
        <line x1='0' y1={centerY + gap} x2='100' y2={centerY + gap} stroke={strokePaint} strokeWidth={lineStroke} vectorEffect='non-scaling-stroke' />
      </>
    )
  }

  if (lineStyle === 'ornament') {
    const gap = 9
    const dotRadius = Math.max(2, thickness * 0.75)
    const lineStroke = Math.max(1, thickness * 0.55)

    return (
      <>
        <line x1='0' y1={centerY} x2={50 - gap} y2={centerY} stroke={strokePaint} strokeWidth={lineStroke} vectorEffect='non-scaling-stroke' />
        <line x1={50 + gap} y1={centerY} x2='100' y2={centerY} stroke={strokePaint} strokeWidth={lineStroke} vectorEffect='non-scaling-stroke' />
        <circle cx='50' cy={centerY} r={dotRadius} fill={fillPaint} />
        <circle cx='50' cy={centerY} r={dotRadius * 0.38} fill={props.fillType === 'gradient' ? props.gradientEnd : '#ffffff'} opacity={0.85} />
      </>
    )
  }

  const dashProps = getStrokeDashProps(lineStyle, thickness)

  return (
    <line
      x1='0'
      y1={centerY}
      x2='100'
      y2={centerY}
      stroke={strokePaint}
      strokeWidth={strokeWidth}
      vectorEffect='non-scaling-stroke'
      {...dashProps}
    />
  )
}

export function LineDividerDefs(props: Props & { viewBox: ReturnType<typeof getLineViewBox> }) {
  return <LineGradientDefs {...props} />
}
