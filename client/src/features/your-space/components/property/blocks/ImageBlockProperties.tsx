'use client'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type {
  Block,
  ImageBlockProps,
  ImageContinuousAnimation,
  ImageEntranceAnimation,
  ImageHoverEffect
} from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import {
  LayoutOptionGroup,
  PropertyFieldLabel,
  PropertyFields,
  PropertySection
} from '../PropertyPanelUi'
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

const ENTRANCE_OPTIONS: LayoutOption<ImageEntranceAnimation>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'fade-in', label: 'Fade in', icon: 'ri-eye-line' },
  { value: 'slide-up', label: 'Slide up', icon: 'ri-arrow-up-line' },
  { value: 'zoom-in', label: 'Zoom in', icon: 'ri-zoom-in-line' },
  { value: 'blur-in', label: 'Blur in', icon: 'ri-contrast-line' },
  { value: 'flip-up', label: 'Flip up', icon: 'ri-refresh-line' }
]

const CONTINUOUS_OPTIONS: LayoutOption<ImageContinuousAnimation>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'float', label: 'Float', icon: 'ri-arrow-up-down-line' },
  { value: 'pulse', label: 'Pulse', icon: 'ri-pulse-line' },
  { value: 'breathe', label: 'Breathe', icon: 'ri-contrast-drop-2-line' },
  { value: 'shimmer', label: 'Shimmer', icon: 'ri-sparkle-2-line' },
  { value: 'swing', label: 'Swing', icon: 'ri-loop-right-line' }
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
      <PropertySection title='Animation' collapsible defaultOpen>
        <PropertyFieldLabel>On appear</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.entranceAnimation ?? 'none'}
          options={ENTRANCE_OPTIONS}
          onChange={entranceAnimation => update({ entranceAnimation })}
        />
        <PropertyFieldLabel>Loop</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.continuousAnimation ?? 'none'}
          options={CONTINUOUS_OPTIONS}
          onChange={continuousAnimation => update({ continuousAnimation })}
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
