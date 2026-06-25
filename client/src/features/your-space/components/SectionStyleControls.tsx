'use client'

import type { SectionBlockProps } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { PropertyBodyText, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: SectionBlockProps
  accentColor: string
  onUpdate: (changes: Partial<SectionBlockProps>) => void
}

export function SectionStyleControls({ props, accentColor, onUpdate }: Props) {
  return (
    <PropertySection title='Section background' collapsible defaultOpen>
      <PropertyBodyText>
        Use a static fill (color, pattern, gradient, or photo) or an animated background — not both at once.
      </PropertyBodyText>
      <BlockBackgroundModePanel
        props={props}
        accentColor={accentColor}
        sectionType='section'
        fallbackColor='#ffffff'
        sectionLayout={props.layout}
        onUpdate={onUpdate}
      />
    </PropertySection>
  )
}
