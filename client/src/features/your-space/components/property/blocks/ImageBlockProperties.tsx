'use client'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, ImageBlockProps, ImageHoverEffect } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection, LayoutOptionGroup } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertySliderField } from '../PropertySliderField'
import { AlignmentControl } from '../AlignmentControl'
import { MediaSourceField } from '../MediaSourceField'
import { BackgroundOpacityField } from '../BackgroundOpacityField'

type LayoutOption<T extends string> = { value: T; label: string; icon: string }

const HOVER_OPTIONS: LayoutOption<ImageHoverEffect>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'zoom', label: 'Zoom', icon: 'ri-zoom-in-line' },
  { value: 'fade', label: 'Fade', icon: 'ri-contrast-drop-2-line' }
]

type Props = {
  block: Block<'image'>
  activeTab: PropertyPanelTab
}

export function ImageBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as ImageBlockProps
  const update = (changes: Partial<ImageBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <MediaSourceField
          label='Image'
          value={props.src}
          onChange={src => update({ src })}
        />
        <PropertyTextField
          label='Alt text'
          value={props.alt}
          onChange={alt => update({ alt })}
          placeholder='Describe the image…'
          helperText='Used by screen readers and search engines'
        />
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <PropertySection title='Opacity & effects' collapsible defaultOpen>
        <BackgroundOpacityField
          label='Opacity'
          value={props.opacity ?? 100}
          onChange={opacity => update({ opacity })}
        />
        <LayoutOptionGroup
          value={props.hoverEffect ?? siteStyles.misc.imageHoverEffect}
          options={HOVER_OPTIONS}
          onChange={hoverEffect => update({ hoverEffect })}
        />
      </PropertySection>
      <PropertySection title='Shape' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.borderRadius ?? siteStyles.misc.imageCornerRadius}
          min={0}
          max={48}
          step={2}
          unit='px'
          onChange={borderRadius => update({ borderRadius })}
          siteDefault={siteStyles.misc.imageCornerRadius}
          onUseSiteDefault={
            props.borderRadius !== undefined ? () => update({ borderRadius: undefined }) : undefined
          }
        />
      </PropertySection>
    </PropertyFields>
  )
}
