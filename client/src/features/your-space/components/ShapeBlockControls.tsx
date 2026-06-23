'use client'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { HERO_VISUAL_GRADIENT_PRESETS } from '../constants/heroVisual'
import {
  getShapeVariantDefaults,
  ARTISTIC_LINE_STYLE_OPTIONS,
  CLASSIC_LINE_STYLE_OPTIONS,
  SHAPE_GRADIENT_STYLE_OPTIONS,
  SHAPE_VARIANT_OPTIONS
} from '../constants/shapeBlock'
import type { ShapeBlockProps } from '../types'
import { isLineShape } from '../utils/shapeBlockHelpers'
import {
  LayoutOptionGroup,
  PropertyFieldLabel,
  PropertyFields,
  PropertySection
} from './property/PropertyPanelUi'

const FIELD_SX = {
  '& .MuiInputBase-root': { borderRadius: 1 }
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <TextField
        label={label}
        size='small'
        fullWidth
        value={value}
        onChange={e => onChange(e.target.value)}
        sx={FIELD_SX}
      />
      <Box
        component='input'
        type='color'
        value={value}
        onChange={e => onChange(e.target.value)}
        sx={{
          width: 32,
          height: 32,
          border: 'none',
          borderRadius: 0.75,
          cursor: 'pointer',
          flexShrink: 0,
          p: 0,
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`
        }}
      />
    </Box>
  )
}

type Props = {
  props: ShapeBlockProps
  accentColor: string
  onUpdate: (changes: Partial<ShapeBlockProps>) => void
}

export function ShapeBlockControls({ props, accentColor, onUpdate }: Props) {
  const theme = useTheme()
  const isLine = isLineShape(props.variant)
  const isGradient = props.fillType === 'gradient'
  const showBorderRadius = props.variant === 'rectangle'
  const lockHeight = props.variant === 'circle'

  return (
    <PropertyFields>
      <PropertySection title='Shape' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.variant}
          options={SHAPE_VARIANT_OPTIONS}
          onChange={variant => onUpdate(getShapeVariantDefaults(variant, props))}
        />
      </PropertySection>

      {isLine && (
        <>
          <PropertySection title='Classic dividers' collapsible defaultOpen>
            <LayoutOptionGroup
              value={props.lineStyle ?? 'solid'}
              options={CLASSIC_LINE_STYLE_OPTIONS}
              onChange={lineStyle => onUpdate({ lineStyle })}
            />
          </PropertySection>
          <PropertySection title='Artistic dividers' collapsible defaultOpen>
            <LayoutOptionGroup
              value={props.lineStyle ?? 'solid'}
              options={ARTISTIC_LINE_STYLE_OPTIONS}
              onChange={lineStyle => onUpdate({ lineStyle })}
            />
          </PropertySection>
        </>
      )}

      <PropertySection title={isLine ? 'Dimensions' : 'Size'} collapsible defaultOpen>
        <Box>
          <PropertyFieldLabel>{isLine ? 'Length' : 'Width'}: {props.width}px</PropertyFieldLabel>
          <Slider
            value={props.width}
            min={isLine ? 80 : 40}
            max={isLine ? 960 : 480}
            step={4}
            onChange={(_, v) => {
              const width = v as number
              onUpdate(lockHeight ? { width, height: width } : { width })
            }}
          />
        </Box>
        {!lockHeight && (
          <Box>
            <PropertyFieldLabel>{isLine ? 'Thickness' : 'Height'}: {props.height}px</PropertyFieldLabel>
            <Slider
              value={props.height}
              min={isLine ? 1 : 40}
              max={isLine ? 32 : 480}
              step={isLine ? 1 : 4}
              onChange={(_, v) => onUpdate({ height: v as number })}
            />
          </Box>
        )}
      </PropertySection>

      <PropertySection title='Fill' collapsible defaultOpen>
        <FormControl size='small' fullWidth>
          <InputLabel>Fill type</InputLabel>
          <Select
            label='Fill type'
            value={props.fillType}
            onChange={e => onUpdate({ fillType: e.target.value as ShapeBlockProps['fillType'] })}
          >
            <MenuItem value='solid'>Solid color</MenuItem>
            <MenuItem value='gradient'>Gradient</MenuItem>
          </Select>
        </FormControl>

        {isGradient ? (
          <>
            {!isLine && (
              <LayoutOptionGroup
                value={props.gradientStyle}
                options={SHAPE_GRADIENT_STYLE_OPTIONS}
                onChange={gradientStyle => onUpdate({ gradientStyle })}
              />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <PropertyFieldLabel>Gradient presets</PropertyFieldLabel>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))', gap: 0.75 }}>
                {HERO_VISUAL_GRADIENT_PRESETS.map(preset => {
                  const isActive = props.gradientStart === preset.start && props.gradientEnd === preset.end

                  return (
                    <Tooltip key={preset.id} title={preset.label} placement='top'>
                      <Box
                        component='button'
                        type='button'
                        aria-label={preset.label}
                        aria-pressed={isActive}
                        onClick={() => onUpdate({ gradientStart: preset.start, gradientEnd: preset.end })}
                        sx={{
                          aspectRatio: '1',
                          border: 'none',
                          borderRadius: 1,
                          cursor: 'pointer',
                          background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)`,
                          outline: isActive ? '2px solid' : '1px solid',
                          outlineColor: isActive ? 'primary.main' : alpha(theme.palette.divider, 0.9),
                          outlineOffset: 1
                        }}
                      />
                    </Tooltip>
                  )
                })}
              </Box>
            </Box>
            <ColorField label='Gradient start' value={props.gradientStart} onChange={gradientStart => onUpdate({ gradientStart })} />
            <ColorField label='Gradient end' value={props.gradientEnd} onChange={gradientEnd => onUpdate({ gradientEnd })} />
            {!isLine && props.gradientStyle === 'linear' && (
              <Box>
                <PropertyFieldLabel>Gradient angle: {props.gradientAngle}°</PropertyFieldLabel>
                <Slider
                  value={props.gradientAngle}
                  min={0}
                  max={360}
                  step={5}
                  onChange={(_, v) => onUpdate({ gradientAngle: v as number })}
                />
              </Box>
            )}
          </>
        ) : (
          <ColorField label={isLine ? 'Line color' : 'Fill color'} value={props.fillColor || accentColor} onChange={fillColor => onUpdate({ fillColor })} />
        )}
      </PropertySection>

      {!isLine && (
        <PropertySection title='Stroke' collapsible defaultOpen={false}>
          <Box>
            <PropertyFieldLabel>Stroke width: {props.strokeWidth}px</PropertyFieldLabel>
            <Slider value={props.strokeWidth} min={0} max={12} step={1} onChange={(_, v) => onUpdate({ strokeWidth: v as number })} />
          </Box>
          {props.strokeWidth > 0 && (
            <ColorField label='Stroke color' value={props.strokeColor} onChange={strokeColor => onUpdate({ strokeColor })} />
          )}
        </PropertySection>
      )}

      <PropertySection title='Effects' collapsible defaultOpen={false}>
        <Box>
          <PropertyFieldLabel>Opacity: {props.opacity}%</PropertyFieldLabel>
          <Slider value={props.opacity} min={0} max={100} step={1} onChange={(_, v) => onUpdate({ opacity: v as number })} />
        </Box>
        <Box>
          <PropertyFieldLabel>Rotation: {props.rotation}°</PropertyFieldLabel>
          <Slider value={props.rotation} min={0} max={360} step={5} onChange={(_, v) => onUpdate({ rotation: v as number })} />
        </Box>
        {showBorderRadius && (
          <Box>
            <PropertyFieldLabel>Corner radius: {props.borderRadius}px</PropertyFieldLabel>
            <Slider
              value={props.borderRadius}
              min={0}
              max={120}
              step={2}
              onChange={(_, v) => onUpdate({ borderRadius: v as number })}
            />
          </Box>
        )}
      </PropertySection>
    </PropertyFields>
  )
}

export function ShapeBlockLayoutFields({
  alignment,
  onUpdate
}: {
  alignment: ShapeBlockProps['alignment']
  onUpdate: (changes: Partial<ShapeBlockProps>) => void
}) {
  return (
    <PropertyFields>
      <FormControl size='small' fullWidth>
        <InputLabel>Alignment</InputLabel>
        <Select label='Alignment' value={alignment} onChange={e => onUpdate({ alignment: e.target.value as ShapeBlockProps['alignment'] })}>
          <MenuItem value='left'>Left</MenuItem>
          <MenuItem value='center'>Center</MenuItem>
          <MenuItem value='right'>Right</MenuItem>
        </Select>
      </FormControl>
    </PropertyFields>
  )
}
