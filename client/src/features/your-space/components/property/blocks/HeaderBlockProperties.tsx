'use client'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, HeaderBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyColorField } from '../PropertyColorField'
import { PropertySliderField } from '../PropertySliderField'
import { PropertyToggleRow } from '../PropertyToggleRow'
import { BackgroundOpacityField } from '../BackgroundOpacityField'
import { ChromeBlockBrandingFields, ChromeBlockStructureFields } from './ChromeBlockShared'

type Props = {
  block: Block<'header'>
  activeTab: PropertyPanelTab
}

export function HeaderBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const props = block.props as HeaderBlockProps
  const update = (changes: Partial<HeaderBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <ChromeBlockBrandingFields
          logoText={props.logoText}
          logoUrl={props.logoUrl ?? ''}
          logoIcon={props.logoIcon}
          logoIconColor={props.logoIconColor}
          logoIconSize={props.logoIconSize}
          logoIconShowBackground={props.logoIconShowBackground}
          logoIconBackgroundColor={props.logoIconBackgroundColor}
          logoIconBorderRadius={props.logoIconBorderRadius}
          navLinks={props.navLinks}
          onUpdate={update}
        />
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <ChromeBlockStructureFields
          layout={props.layout}
          logoPosition={props.logoPosition ?? 'left'}
          onUpdate={update}
        />
        <PropertyToggleRow
          label='Stick to top'
          description='Header stays visible while scrolling'
          checked={props.fixed ?? false}
          onChange={fixed => update({ fixed })}
        />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <PropertySection title='Background' collapsible defaultOpen>
        <PropertyColorField
          label='Background color'
          value={props.backgroundColor}
          onChange={backgroundColor => update({ backgroundColor })}
        />
        <BackgroundOpacityField
          value={props.backgroundOpacity ?? 0}
          onChange={backgroundOpacity => update({ backgroundOpacity })}
        />
      </PropertySection>
      <PropertySection title='Text' collapsible defaultOpen>
        <PropertyColorField
          label='Text color'
          value={props.textColor}
          onChange={textColor => update({ textColor })}
        />
      </PropertySection>
      <PropertySection title='Shape' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.borderRadius ?? 0}
          min={0}
          max={32}
          step={2}
          unit='px'
          onChange={borderRadius => update({ borderRadius })}
        />
      </PropertySection>
    </PropertyFields>
  )
}
