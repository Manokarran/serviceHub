'use client'

import { HERO_BUTTON_STYLE_OPTIONS, HERO_MEDIA_OVERLAY_OPTIONS } from '../constants/heroLayout'
import type { ShowcaseBlockProps } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { LayoutOptionGroup, PropertyBodyText, PropertyFieldLabel, PropertySection } from './property/PropertyPanelUi'
import { PropertyColorField } from './property/PropertyColorField'
import { PropertyToggleRow } from './property/PropertyToggleRow'

type Props = {
  props: ShowcaseBlockProps
  accentColor: string
  onUpdate: (changes: Partial<ShowcaseBlockProps>) => void
}

export function ShowcaseStyleControls({ props, accentColor, onUpdate }: Props) {
  return (
    <>
      <PropertySection title='Section background' collapsible defaultOpen>
        <PropertyBodyText>
          Optional page-section fill behind the showcase. The visual pane has its own image, logo, or motion.
        </PropertyBodyText>
        <BlockBackgroundModePanel
          props={props}
          accentColor={accentColor}
          sectionType='showcase'
          fallbackColor='#ffffff'
          onUpdate={onUpdate}
          animatedHint='Motion behind the whole showcase section. Visual panes keep their own animation.'
        />
      </PropertySection>

      <PropertySection title='Media overlay' collapsible defaultOpen>
        <PropertyBodyText>Darken the visual so logo and copy stay readable on layered layouts.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.mediaOverlay ?? 'gradient'}
          options={HERO_MEDIA_OVERLAY_OPTIONS}
          onChange={mediaOverlay => onUpdate({ mediaOverlay })}
        />
      </PropertySection>

      <PropertySection title='Typography & buttons' collapsible defaultOpen>
        <PropertyColorField label='Text color' value={props.textColor} onChange={textColor => onUpdate({ textColor })} />
        <PropertyFieldLabel>Button style</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.buttonStyle ?? 'theme'}
          options={HERO_BUTTON_STYLE_OPTIONS}
          onChange={buttonStyle => onUpdate({ buttonStyle })}
        />
        <PropertyToggleRow
          label='Gradient headline'
          description='Accent gradient on the title.'
          checked={props.titleStyle === 'gradient'}
          onChange={checked => onUpdate({ titleStyle: checked ? 'gradient' : 'solid' })}
        />
      </PropertySection>
    </>
  )
}
