'use client'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, SectionBlockProps, SectionBorderStyle } from '../../../types'
import { SECTION_BORDER_OPTIONS } from '../../../utils/sectionStyleHelpers'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection, LayoutOptionGroup } from '../PropertyPanelUi'
import { PropertySliderField } from '../PropertySliderField'
import { PropertyColorField } from '../PropertyColorField'
import { SectionLayoutControls } from '../../SectionLayoutControls'
import { SectionStyleControls } from '../../SectionStyleControls'

type LayoutOption<T extends string> = { value: T; label: string; icon: string }
const BORDER_OPTIONS: LayoutOption<SectionBorderStyle>[] = SECTION_BORDER_OPTIONS

type Props = {
  block: Block<'section'>
  activeTab: PropertyPanelTab
}

export function SectionBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as SectionBlockProps
  const update = (changes: Partial<SectionBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <SectionLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
      </PropertyFields>
    )
  }

  // Style tab (section has no Design tab — content is on the canvas)
  return (
    <PropertyFields>
      <SectionStyleControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />

      <PropertySection title='Shape' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.borderRadius ?? 0}
          min={0}
          max={48}
          step={2}
          unit='px'
          onChange={borderRadius => update({ borderRadius })}
        />
      </PropertySection>

      <PropertySection title='Border & frame' collapsible defaultOpen={false}>
        <LayoutOptionGroup
          value={props.borderStyle ?? 'none'}
          options={BORDER_OPTIONS}
          onChange={borderStyle => update({ borderStyle })}
        />
        {props.borderStyle === 'outline' && (
          <>
            <PropertySliderField
              label='Border width'
              value={props.borderWidth ?? 1}
              min={1}
              max={4}
              step={1}
              unit='px'
              onChange={borderWidth => update({ borderWidth })}
            />
            <PropertyColorField
              label='Border color'
              value={props.borderColor ?? '#e2e8f0'}
              onChange={borderColor => update({ borderColor })}
            />
          </>
        )}
      </PropertySection>
    </PropertyFields>
  )
}
