'use client'

import type { CarouselBlockProps } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { PropertyBodyText, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: CarouselBlockProps
  accentColor: string
  onUpdate: (changes: Partial<CarouselBlockProps>) => void
}

export function CarouselStyleControls({ props, accentColor, onUpdate }: Props) {
  return (
    <PropertySection title='Carousel background' collapsible defaultOpen>
      <PropertyBodyText>
        Use a static fill (color, pattern, gradient, or photo) or an animated background — not both at once.
      </PropertyBodyText>
      <BlockBackgroundModePanel
        props={props}
        accentColor={accentColor}
        sectionType='carousel'
        fallbackColor='#ffffff'
        onUpdate={onUpdate}
      />
    </PropertySection>
  )
}
