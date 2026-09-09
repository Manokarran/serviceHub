'use client'

import Box from '@mui/material/Box'

import {
  FAQ_CARD_STYLE_OPTIONS,
  FAQ_ENTRANCE_OPTIONS,
  FAQ_EXPAND_OPTIONS,
  FAQ_ICON_OPTIONS,
  FAQ_LAYOUT_OPTIONS,
  FAQ_SHADOW_OPTIONS
} from '../constants/faqLayout'
import type { FaqBlockProps } from '../types'
import { AlignmentControl } from './property/AlignmentControl'
import { MaxWidthControl } from './property/MaxWidthControl'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'
import { PropertyColorField } from './property/PropertyColorField'
import { PropertySliderField } from './property/PropertySliderField'
import { PropertyToggleRow } from './property/PropertyToggleRow'

type LayoutProps = {
  props: FaqBlockProps
  onUpdate: (changes: Partial<FaqBlockProps>) => void
}

export function FaqLayoutControls({ props, onUpdate }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Structure' collapsible defaultOpen>
        <PropertyBodyText>
          Stack centers a single FAQ column. Split puts the title beside the questions on wide screens and stacks on
          mobile.
        </PropertyBodyText>
        <LayoutOptionGroup
          value={props.layout}
          options={FAQ_LAYOUT_OPTIONS}
          onChange={layout => onUpdate({ layout })}
        />
      </PropertySection>

      <PropertySection title='Expand behaviour' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.expandMode}
          options={FAQ_EXPAND_OPTIONS}
          onChange={expandMode => onUpdate({ expandMode })}
        />
        <PropertyToggleRow
          label='Open first question'
          description='Start with the first answer expanded.'
          checked={props.defaultOpenFirst}
          onChange={defaultOpenFirst => onUpdate({ defaultOpenFirst })}
        />
        <PropertyFieldLabel>Expand icon</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.iconStyle}
          options={FAQ_ICON_OPTIONS}
          onChange={iconStyle => onUpdate({ iconStyle })}
        />
      </PropertySection>

      <PropertySection title='Alignment' collapsible defaultOpen={false}>
        <AlignmentControl value={props.alignment} onChange={alignment => onUpdate({ alignment })} />
      </PropertySection>

      <PropertySection title='Size' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.cardRadius}
          min={0}
          max={36}
          step={2}
          unit='px'
          onChange={cardRadius => onUpdate({ cardRadius })}
        />
        <PropertySliderField
          label='Gap'
          value={props.gap}
          min={4}
          max={32}
          step={2}
          unit='px'
          onChange={gap => onUpdate({ gap })}
        />
      </PropertySection>

      <PropertySection title='Spacing' collapsible defaultOpen={false}>
        <MaxWidthControl value={props.maxWidth} onChange={maxWidth => onUpdate({ maxWidth })} />
        <PropertySliderField
          label='Horizontal padding'
          value={props.paddingX}
          min={8}
          max={96}
          step={4}
          unit='px'
          onChange={paddingX => onUpdate({ paddingX })}
        />
        <PropertySliderField
          label='Vertical padding'
          value={props.paddingY}
          min={24}
          max={160}
          step={8}
          unit='px'
          onChange={paddingY => onUpdate({ paddingY })}
        />
      </PropertySection>
    </Box>
  )
}

type StyleProps = {
  props: FaqBlockProps
  accentColor: string
  onUpdate: (changes: Partial<FaqBlockProps>) => void
}

export function FaqStyleControls({ props, accentColor, onUpdate }: StyleProps) {
  return (
    <>
      <PropertySection title='Question cards' collapsible defaultOpen>
        <PropertyBodyText>
          Glass works especially well on dark or animated section backgrounds. Outlined stays crisp on light pages.
        </PropertyBodyText>
        <PropertyFieldLabel>Card style</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.cardStyle}
          options={FAQ_CARD_STYLE_OPTIONS}
          onChange={cardStyle => onUpdate({ cardStyle })}
        />
        <PropertyColorField
          label='Card background'
          value={props.cardBackground || '#ffffff'}
          onChange={cardBackground => onUpdate({ cardBackground })}
        />
        <PropertyColorField
          label='Card border'
          value={props.cardBorderColor || props.textColor || '#0f172a'}
          onChange={cardBorderColor => onUpdate({ cardBorderColor })}
        />
        <PropertySliderField
          label='Border width'
          value={props.cardBorderWidth ?? 1}
          min={0}
          max={6}
          step={1}
          unit='px'
          onChange={cardBorderWidth => onUpdate({ cardBorderWidth })}
        />
        <PropertyFieldLabel>Shadow</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.cardShadow ?? 'soft'}
          options={FAQ_SHADOW_OPTIONS}
          onChange={cardShadow => onUpdate({ cardShadow })}
        />
      </PropertySection>

      <PropertySection title='Section background' collapsible defaultOpen>
        <BlockBackgroundModePanel
          props={props}
          accentColor={accentColor}
          sectionType='faq'
          fallbackColor='#ffffff'
          onUpdate={onUpdate}
          animatedHint='Motion behind the FAQ section. Question cards stay readable on top.'
        />
      </PropertySection>

      <PropertySection title='Colors' collapsible defaultOpen>
        <PropertyColorField label='Text color' value={props.textColor} onChange={textColor => onUpdate({ textColor })} />
        <PropertyColorField
          label='Accent color'
          value={props.accentColor || accentColor}
          onChange={next => onUpdate({ accentColor: next })}
        />
        <PropertyToggleRow
          label='Gradient headline'
          description='Accent gradient on the section title.'
          checked={props.titleStyle === 'gradient'}
          onChange={checked => onUpdate({ titleStyle: checked ? 'gradient' : 'solid' })}
        />
      </PropertySection>

      <PropertySection title='Motion' collapsible defaultOpen>
        <PropertyFieldLabel>Entrance</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.entranceAnimation}
          options={FAQ_ENTRANCE_OPTIONS}
          onChange={entranceAnimation => onUpdate({ entranceAnimation })}
        />
      </PropertySection>
    </>
  )
}
