'use client'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, ShapeBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields } from '../PropertyPanelUi'
import { PropertySliderField } from '../PropertySliderField'
import { BackgroundOpacityField } from '../BackgroundOpacityField'
import { ShapeBlockControls, ShapeBlockLayoutFields } from '../../ShapeBlockControls'

type Props = {
  block: Block<'shape'>
  activeTab: PropertyPanelTab
}

export function ShapeBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as ShapeBlockProps
  const update = (changes: Partial<ShapeBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return <ShapeBlockControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
  }

  if (activeTab === 'layout') {
    return <ShapeBlockLayoutFields alignment={props.alignment} onUpdate={update} />
  }

  return (
    <PropertyFields>
      <BackgroundOpacityField
        label='Opacity'
        value={props.opacity ?? 100}
        onChange={opacity => update({ opacity })}
      />
      <PropertySliderField
        label='Rotation'
        value={props.rotation}
        min={0}
        max={360}
        step={5}
        unit='°'
        onChange={rotation => update({ rotation })}
      />
    </PropertyFields>
  )
}
