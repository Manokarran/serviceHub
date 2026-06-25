'use client'

import { HERO_BUTTON_STYLE_OPTIONS, HERO_MEDIA_OVERLAY_OPTIONS } from '../constants/heroLayout'
import type { HeroBlockProps } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'
import { PropertyColorField } from './property/PropertyColorField'
import { PropertyToggleRow } from './property/PropertyToggleRow'

type Props = {
  props: HeroBlockProps
  accentColor: string
  onUpdate: (changes: Partial<HeroBlockProps>) => void
}

export function HeroStyleControls({ props, accentColor, onUpdate }: Props) {
  const isSplitLayout = props.layout === 'split-left' || props.layout === 'split-right'

  return (
    <>
      <PropertySection title='Hero background' collapsible defaultOpen>
        <PropertyBodyText>
          Use a static fill (color, pattern, gradient, or photo) or an animated background — not both at once.
        </PropertyBodyText>
        <BlockBackgroundModePanel
          props={props}
          accentColor={accentColor}
          sectionType='hero'
          fallbackColor='#6366f1'
          onUpdate={onUpdate}
          animatedHint={
            isSplitLayout
              ? 'Motion layer on the split visual panel. Static fill is disabled while animation is active.'
              : 'Full-bleed motion behind centered hero content. Static fill is disabled while animation is active.'
          }
        />
      </PropertySection>

      <PropertySection title='Media overlay' collapsible defaultOpen={false}>
        <PropertyBodyText>Improve text contrast when using photo or video backgrounds.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.mediaOverlay ?? 'gradient'}
          options={HERO_MEDIA_OVERLAY_OPTIONS}
          onChange={mediaOverlay => onUpdate({ mediaOverlay })}
        />
      </PropertySection>

      <PropertySection title='Typography & surface' collapsible defaultOpen>
        <PropertyColorField label='Text color' value={props.textColor} onChange={textColor => onUpdate({ textColor })} />
        <PropertyFieldLabel>Button style</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.buttonStyle ?? 'theme'}
          options={HERO_BUTTON_STYLE_OPTIONS}
          onChange={buttonStyle => onUpdate({ buttonStyle })}
        />
        <PropertyBodyText>
          Theme uses your site button styles. Contrast adapts buttons to the hero text color.
        </PropertyBodyText>
        <PropertyToggleRow
          label='Gradient headline'
          description='Modern accent gradient on the hero title.'
          checked={props.titleStyle === 'gradient'}
          onChange={checked => onUpdate({ titleStyle: checked ? 'gradient' : 'solid' })}
        />
        <PropertyToggleRow
          label='Glass content card'
          description='Frosted panel behind headline and buttons.'
          checked={props.contentSurface === 'glass'}
          onChange={checked => onUpdate({ contentSurface: checked ? 'glass' : 'none' })}
        />
      </PropertySection>
    </>
  )
}
