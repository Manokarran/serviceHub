'use client'

import { HERO_BUTTON_STYLE_OPTIONS } from '../constants/heroLayout'
import {
  PRICING_CARD_STYLE_OPTIONS,
  PRICING_ENTRANCE_OPTIONS,
  PRICING_FEATURE_ICON_OPTIONS,
  PRICING_HOVER_OPTIONS,
  PRICING_SHADOW_OPTIONS
} from '../constants/pricingLayout'
import type { PricingBlockProps } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'
import { PropertyColorField } from './property/PropertyColorField'
import { PropertySliderField } from './property/PropertySliderField'
import { PropertyToggleRow } from './property/PropertyToggleRow'

type Props = {
  props: PricingBlockProps
  accentColor: string
  onUpdate: (changes: Partial<PricingBlockProps>) => void
}

export function PricingStyleControls({ props, accentColor, onUpdate }: Props) {
  return (
    <>
      <PropertySection title='Plan cards' collapsible defaultOpen>
        <PropertyBodyText>
          Style the individual plan boxes. These settings apply to Cards, Stack, and Compare layouts.
        </PropertyBodyText>
        <PropertyFieldLabel>Card style</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.cardStyle}
          options={PRICING_CARD_STYLE_OPTIONS}
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
          value={props.cardShadow ?? 'medium'}
          options={PRICING_SHADOW_OPTIONS}
          onChange={cardShadow => onUpdate({ cardShadow })}
        />
      </PropertySection>

      <PropertySection title='Section background' collapsible defaultOpen>
        <PropertyBodyText>
          Solid, photo, video, or animated motion behind the whole pricing section. Plan cards keep the fill above.
        </PropertyBodyText>
        <BlockBackgroundModePanel
          props={props}
          accentColor={accentColor}
          sectionType='pricing'
          fallbackColor='#ffffff'
          onUpdate={onUpdate}
          animatedHint='Motion behind the pricing section. Plan cards stay readable on top.'
        />
      </PropertySection>

      <PropertySection title='Colors' collapsible defaultOpen>
        <PropertyColorField label='Text color' value={props.textColor} onChange={textColor => onUpdate({ textColor })} />
        <PropertyColorField
          label='Accent color'
          value={props.accentColor || accentColor}
          onChange={next => onUpdate({ accentColor: next })}
        />
        <PropertyFieldLabel>Button style</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.buttonStyle ?? 'theme'}
          options={HERO_BUTTON_STYLE_OPTIONS}
          onChange={buttonStyle => onUpdate({ buttonStyle })}
        />
        <PropertyToggleRow
          label='Gradient headline'
          description='Accent gradient on the section title.'
          checked={props.titleStyle === 'gradient'}
          onChange={checked => onUpdate({ titleStyle: checked ? 'gradient' : 'solid' })}
        />
      </PropertySection>

      <PropertySection title='Motion' collapsible defaultOpen>
        <PropertyFieldLabel>Hover</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.hoverEffect}
          options={PRICING_HOVER_OPTIONS}
          onChange={hoverEffect => onUpdate({ hoverEffect })}
        />
        <PropertyFieldLabel>Entrance</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.entranceAnimation}
          options={PRICING_ENTRANCE_OPTIONS}
          onChange={entranceAnimation => onUpdate({ entranceAnimation })}
        />
        <PropertyToggleRow
          label='Lift recommended plan'
          description='Slightly scale the featured card so it reads as the default choice.'
          checked={props.recommendedScale}
          onChange={recommendedScale => onUpdate({ recommendedScale })}
        />
        <PropertyToggleRow
          label='Glow recommended plan'
          description='Soft accent glow around the featured card.'
          checked={props.recommendedGlow}
          onChange={recommendedGlow => onUpdate({ recommendedGlow })}
        />
      </PropertySection>

      <PropertySection title='Features' collapsible defaultOpen={false}>
        <PropertyFieldLabel>Feature icons</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.featureIconStyle}
          options={PRICING_FEATURE_ICON_OPTIONS}
          onChange={featureIconStyle => onUpdate({ featureIconStyle })}
        />
      </PropertySection>
    </>
  )
}
