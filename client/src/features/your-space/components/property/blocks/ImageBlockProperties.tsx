'use client'

import { useState } from 'react'

import Button from '@mui/material/Button'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type {
  Block,
  ImageBlockProps,
  ImageContinuousAnimation,
  ImageDeliveryQuality,
  ImageEntranceAnimation,
  ImageHoverEffect
} from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import {
  LayoutOptionGroup,
  PropertyBodyText,
  PropertyFieldLabel,
  PropertyFields,
  PropertySection
} from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertySliderField } from '../PropertySliderField'
import { AlignmentControl } from '../AlignmentControl'
import { MediaSourceField } from '../MediaSourceField'
import { BackgroundOpacityField } from '../BackgroundOpacityField'
import { ImageEditorDialog } from '../ImageEditorDialog'

type LayoutOption<T extends string> = { value: T; label: string; icon: string }

const HOVER_OPTIONS: LayoutOption<ImageHoverEffect>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'zoom', label: 'Zoom', icon: 'ri-zoom-in-line' },
  { value: 'fade', label: 'Fade', icon: 'ri-contrast-drop-2-line' },
  { value: 'lift', label: 'Lift', icon: 'ri-arrow-up-line' },
  { value: 'blur', label: 'Blur', icon: 'ri-contrast-2-line' },
  { value: 'grayscale', label: 'Grayscale', icon: 'ri-contrast-drop-line' }
]

const QUALITY_OPTIONS: LayoutOption<ImageDeliveryQuality>[] = [
  { value: 'optimized', label: 'Optimized', icon: 'ri-flashlight-line' },
  { value: 'high', label: 'High', icon: 'ri-hd-line' },
  { value: 'original', label: 'Original', icon: 'ri-image-2-line' }
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
  const [editorOpen, setEditorOpen] = useState(false)
  const props = block.props as ImageBlockProps
  const update = (changes: Partial<ImageBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <>
        <PropertyFields>
          <MediaSourceField
            label='Image'
            value={props.src}
            enableUnsplash
            unsplashDefaultQuery='professional photography'
            onChange={(src, meta) =>
              update({
                src,
                ...(meta
                  ? { naturalWidth: meta.width, naturalHeight: meta.height }
                  : {}),
                ...(meta?.alt && !props.alt ? { alt: meta.alt } : {}),
                crop: null,
                adjustments: null
              })
            }
          />
          {props.src ? (
            <Button
              variant='outlined'
              startIcon={<i className='ri-crop-line' />}
              onClick={() => setEditorOpen(true)}
              fullWidth
            >
              Edit image — crop & enhance
            </Button>
          ) : null}
        <PropertyTextField
          label='Alt text'
          value={props.alt}
          onChange={alt => update({ alt })}
          placeholder='Describe the image…'
          helperText='Used by screen readers and search engines'
        />
      </PropertyFields>
        <ImageEditorDialog
          open={editorOpen}
          src={props.src}
          naturalWidth={props.naturalWidth}
          naturalHeight={props.naturalHeight}
          crop={props.crop}
          adjustments={props.adjustments}
          onClose={() => setEditorOpen(false)}
          onApply={result =>
            update({
              crop: result.crop,
              adjustments: result.adjustments,
              ...(result.src ? { src: result.src } : {}),
              ...(result.naturalWidth ? { naturalWidth: result.naturalWidth } : {}),
              ...(result.naturalHeight ? { naturalHeight: result.naturalHeight } : {})
            })
          }
        />
      </>
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
      <PropertySection title='Image quality' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.deliveryQuality ?? 'optimized'}
          options={QUALITY_OPTIONS}
          onChange={deliveryQuality => update({ deliveryQuality })}
        />
        <PropertyBodyText>
          {(props.deliveryQuality ?? 'optimized') === 'original'
            ? 'Serves the stored file as-is (sharpest). Crop or enhance falls back to high quality.'
            : (props.deliveryQuality ?? 'optimized') === 'high'
              ? 'Near-lossless delivery with full resolution and color profile.'
              : 'Balanced size and quality for faster loading.'}
        </PropertyBodyText>
      </PropertySection>
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
