'use client'

import type { BlockBackgroundProps, SplitVisualConfig } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { PropertyBodyText, PropertySection } from './property/PropertyPanelUi'

type ChromeType = 'header' | 'footer'

const CHROME_FALLBACK_COLORS: Record<ChromeType, string> = {
  header: '#ffffff',
  footer: '#1a1a2e'
}

type Props = {
  props: BlockBackgroundProps & SplitVisualConfig & { backgroundColor: string }
  accentColor: string
  chromeType: ChromeType
  onUpdate: (changes: Partial<BlockBackgroundProps & SplitVisualConfig & { backgroundColor?: string }>) => void
}

export function ChromeBlockStyleControls({ props, accentColor, chromeType, onUpdate }: Props) {
  const title = chromeType === 'header' ? 'Header background' : 'Footer background'

  return (
    <PropertySection title={title} collapsible defaultOpen>
      <PropertyBodyText>
        Use a static fill (color, pattern, gradient, or photo) or an animated background — not both at once.
      </PropertyBodyText>
      <BlockBackgroundModePanel
        props={props}
        accentColor={accentColor}
        sectionType={chromeType}
        fallbackColor={CHROME_FALLBACK_COLORS[chromeType]}
        onUpdate={onUpdate}
        animatedHint='Subtle motion behind logo and navigation. Static fill is disabled while animation is active.'
      />
    </PropertySection>
  )
}
