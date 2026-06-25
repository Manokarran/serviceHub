'use client'

import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'

import { IconPicker } from '@/components/IconPicker'
import { DEFAULT_ICON_PICKER_STYLE, DEFAULT_TAB_ICON_STYLE, type IconPickerStyle } from '@/components/iconPickerStyle'
import type { TabsBlockProps } from '../types'
import {
  TAB_BORDER_STYLE_OPTIONS,
  TAB_CONTENT_ANIMATION_OPTIONS,
  TAB_ORIENTATION_OPTIONS,
  TAB_VARIANT_OPTIONS
} from '../utils/tabStyleHelpers'
import {
  CornerRadiusField,
  LayoutOptionGroup,
  PropertyFieldLabel,
  PropertySection
} from './property/PropertyPanelUi'

type Props = {
  props: TabsBlockProps
  accentColor: string
  onUpdate: (changes: Partial<TabsBlockProps>) => void
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        component='input'
        type='color'
        value={value.startsWith('#') ? value : '#6366f1'}
        onChange={e => onChange(e.target.value)}
        sx={{
          width: 32,
          height: 32,
          border: 'none',
          borderRadius: 0.75,
          cursor: 'pointer',
          flexShrink: 0,
          p: 0
        }}
      />
      <Box sx={{ flex: 1 }}>
        <PropertyFieldLabel>{label}</PropertyFieldLabel>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{value}</Box>
      </Box>
    </Box>
  )
}

/** Compact icon picker for tab rows */
function TabIconPicker({
  icon,
  iconColor,
  iconSize,
  onChange
}: {
  icon: string | undefined
  iconColor?: string
  iconSize?: number
  onChange: (changes: { icon?: string; iconColor?: string; iconSize?: number }) => void
}) {
  const style: IconPickerStyle = {
    ...DEFAULT_ICON_PICKER_STYLE,
    color: iconColor ?? DEFAULT_TAB_ICON_STYLE.color,
    size: iconSize ?? DEFAULT_TAB_ICON_STYLE.size,
    showBackground: false,
    backgroundColor: DEFAULT_ICON_PICKER_STYLE.backgroundColor,
    borderRadius: 0
  }

  return (
    <IconPicker
      variant='compact'
      allowClear
      showStyleControls
      styleMode='simple'
      value={icon ?? null}
      style={style}
      onChange={next => onChange({ icon: next ?? undefined })}
      onStyleChange={next => onChange({ iconColor: next.color, iconSize: next.size })}
    />
  )
}

export function TabsLayoutControls({ props, accentColor, onUpdate }: Props) {
  const updateTabLabel = (index: number, label: string) => {
    const nextTabs = props.tabs.map((tab, i) => (i === index ? { ...tab, label } : tab))

    onUpdate({ tabs: nextTabs })
  }

  const updateTabIcon = (index: number, changes: { icon?: string; iconColor?: string; iconSize?: number }) => {
    const nextTabs = props.tabs.map((tab, i) => (i === index ? { ...tab, ...changes } : tab))

    onUpdate({ tabs: nextTabs })
  }

  const addTab = () => {
    onUpdate({
      tabs: [
        ...props.tabs,
        {
          id: `tab-${crypto.randomUUID()}`,
          label: `Tab ${props.tabs.length + 1}`,
          children: []
        }
      ]
    })
  }

  const removeTab = (index: number) => {
    if (props.tabs.length <= 1) {
      return
    }

    onUpdate({ tabs: props.tabs.filter((_, i) => i !== index) })
  }

  return (
    <>
      <PropertySection title='Orientation' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.orientation}
          options={TAB_ORIENTATION_OPTIONS}
          onChange={orientation => onUpdate({ orientation })}
        />
      </PropertySection>

      <PropertySection title='Tab style' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.variant}
          options={TAB_VARIANT_OPTIONS}
          onChange={variant => onUpdate({ variant })}
        />
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={props.fullWidthTabs}
              onChange={e => onUpdate({ fullWidthTabs: e.target.checked })}
            />
          }
          label='Full-width tabs'
        />
      </PropertySection>

      <PropertySection title='Tabs' collapsible defaultOpen>
        {props.tabs.map((tab, index) => (
          <Box key={tab.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TabIconPicker
              icon={tab.icon}
              iconColor={tab.iconColor}
              iconSize={tab.iconSize}
              onChange={changes => updateTabIcon(index, changes)}
            />
            <TextField
              size='small'
              fullWidth
              label={`Tab ${index + 1}`}
              value={tab.label}
              onChange={e => updateTabLabel(index, e.target.value)}
            />
            {props.tabs.length > 1 && (
              <Box
                component='button'
                type='button'
                onClick={() => removeTab(index)}
                aria-label={`Remove tab ${index + 1}`}
                sx={{
                  border: 'none',
                  cursor: 'pointer',
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled',
                  backgroundColor: 'transparent',
                  flexShrink: 0,
                  '&:hover': { color: 'error.main' }
                }}
              >
                <i className='ri-delete-bin-line' style={{ fontSize: '0.9rem' }} />
              </Box>
            )}
          </Box>
        ))}
        <Box
          component='button'
          type='button'
          onClick={addTab}
          sx={{
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.25,
            py: 0.75,
            borderRadius: 1,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'primary.main',
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <i className='ri-add-line' style={{ fontSize: '0.9rem' }} />
          Add tab
        </Box>
      </PropertySection>

      <PropertySection title='Animation' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.contentAnimation}
          options={TAB_CONTENT_ANIMATION_OPTIONS}
          onChange={contentAnimation => onUpdate({ contentAnimation })}
        />
        {props.contentAnimation !== 'none' && (
          <Box>
            <PropertyFieldLabel>Duration: {props.animationDuration}ms</PropertyFieldLabel>
            <Slider
              value={props.animationDuration}
              min={120}
              max={600}
              step={20}
              onChange={(_, v) => onUpdate({ animationDuration: v as number })}
            />
          </Box>
        )}
      </PropertySection>

      <PropertySection title='Tab bar border' collapsible defaultOpen={false}>
        <LayoutOptionGroup
          value={props.tabBarBorderStyle}
          options={TAB_BORDER_STYLE_OPTIONS}
          onChange={tabBarBorderStyle => onUpdate({ tabBarBorderStyle })}
        />
        {props.tabBarBorderStyle === 'outline' && (
          <>
            <Box>
              <PropertyFieldLabel>Border width: {props.tabBarBorderWidth}px</PropertyFieldLabel>
              <Slider
                value={props.tabBarBorderWidth}
                min={1}
                max={4}
                step={1}
                onChange={(_, v) => onUpdate({ tabBarBorderWidth: v as number })}
              />
            </Box>
            <ColorField
              label='Border color'
              value={props.tabBarBorderColor}
              onChange={v => onUpdate({ tabBarBorderColor: v })}
            />
          </>
        )}
        <CornerRadiusField
          value={props.tabBarBorderRadius}
          onChange={tabBarBorderRadius => onUpdate({ tabBarBorderRadius: tabBarBorderRadius ?? 0 })}
          max={32}
        />
      </PropertySection>

      <PropertySection title='Content border' collapsible defaultOpen={false}>
        <LayoutOptionGroup
          value={props.contentBorderStyle}
          options={TAB_BORDER_STYLE_OPTIONS}
          onChange={contentBorderStyle => onUpdate({ contentBorderStyle })}
        />
        {props.contentBorderStyle === 'outline' && (
          <>
            <Box>
              <PropertyFieldLabel>Border width: {props.contentBorderWidth}px</PropertyFieldLabel>
              <Slider
                value={props.contentBorderWidth}
                min={1}
                max={4}
                step={1}
                onChange={(_, v) => onUpdate({ contentBorderWidth: v as number })}
              />
            </Box>
            <ColorField
              label='Border color'
              value={props.contentBorderColor}
              onChange={v => onUpdate({ contentBorderColor: v })}
            />
          </>
        )}
        <CornerRadiusField
          value={props.contentBorderRadius}
          onChange={contentBorderRadius => onUpdate({ contentBorderRadius: contentBorderRadius ?? 0 })}
          max={32}
        />
      </PropertySection>

      <PropertySection title='Tab buttons' collapsible defaultOpen={false}>
        <CornerRadiusField
          value={props.tabBorderRadius}
          onChange={tabBorderRadius => onUpdate({ tabBorderRadius: tabBorderRadius ?? 0 })}
          max={24}
        />
      </PropertySection>

      <PropertySection title='Layout' collapsible defaultOpen={false}>
        <Box>
          <PropertyFieldLabel>Tab gap: {props.tabGap}px</PropertyFieldLabel>
          <Slider
            value={props.tabGap}
            min={0}
            max={24}
            step={2}
            onChange={(_, v) => onUpdate({ tabGap: v as number })}
          />
        </Box>
        <Box>
          <PropertyFieldLabel>Content min height: {props.contentMinHeight}px</PropertyFieldLabel>
          <Slider
            value={props.contentMinHeight}
            min={120}
            max={560}
            step={20}
            onChange={(_, v) => onUpdate({ contentMinHeight: v as number })}
          />
        </Box>
      </PropertySection>

      <PropertySection title='Colors' collapsible defaultOpen={false}>
        <ColorField label='Active tab' value={props.activeTabColor} onChange={v => onUpdate({ activeTabColor: v })} />
        <ColorField
          label='Inactive tab'
          value={props.inactiveTabColor}
          onChange={v => onUpdate({ inactiveTabColor: v })}
        />
        <ColorField
          label='Indicator / accent'
          value={props.indicatorColor}
          onChange={v => onUpdate({ indicatorColor: v || accentColor })}
        />
      </PropertySection>

      <PropertySection title='Spacing' collapsible defaultOpen={false}>
        <Box>
          <PropertyFieldLabel>Padding Y: {props.paddingY}px</PropertyFieldLabel>
          <Slider
            value={props.paddingY}
            min={0}
            max={120}
            step={8}
            onChange={(_, v) => onUpdate({ paddingY: v as number })}
          />
        </Box>
        <Box>
          <PropertyFieldLabel>Padding X: {props.paddingX}px</PropertyFieldLabel>
          <Slider
            value={props.paddingX}
            min={0}
            max={80}
            step={8}
            onChange={(_, v) => onUpdate({ paddingX: v as number })}
          />
        </Box>
      </PropertySection>
    </>
  )
}
