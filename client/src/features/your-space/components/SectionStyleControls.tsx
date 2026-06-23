'use client'

import type { SectionBlockProps } from '../types'
import { useSiteStyles } from './SiteStylesScope'
import { AnimatedBackgroundControls } from './AnimatedBackgroundControls'
import { BackgroundOpacityField } from './property/BackgroundOpacityField'
import { PropertyBodyText, PropertySection } from './property/PropertyPanelUi'
import BackgroundPicker from '@/components/builder/BackgroundPicker'
import { getBlockBackground } from '../utils/sectionStyleHelpers'

type Props = {
  props: SectionBlockProps
  accentColor: string
  onUpdate: (changes: Partial<SectionBlockProps>) => void
}

export function SectionStyleControls({ props, accentColor, onUpdate }: Props) {
  const siteStyles = useSiteStyles()
  const isSplit = props.layout === 'split-horizontal' || props.layout === 'split-vertical'

  return (
    <>
      <PropertySection title='Section fill' collapsible defaultOpen>
        <PropertyBodyText>Solid color, pattern, gradient, or photo behind your content.</PropertyBodyText>
        <BackgroundPicker
          value={getBlockBackground(props)}
          backgroundType={props.backgroundType ?? 'color'}
          sectionType='section'
          photoOpacity={props.backgroundPhotoOpacity ?? 100}
          photoAnimation={props.backgroundPhotoAnimation}
          defaultPhotoAnimation={siteStyles.misc.imageHoverEffect}
          onStyleChange={(key, nextValue) => {
            if (key === 'backgroundType') {
              onUpdate({ backgroundType: nextValue as SectionBlockProps['backgroundType'] })
            } else if (key === 'background') {
              onUpdate({ background: nextValue })
            } else if (key === 'backgroundOpacity') {
              onUpdate({ backgroundOpacity: Number(nextValue) })
            } else if (key === 'backgroundPhotoOpacity') {
              onUpdate({ backgroundPhotoOpacity: Number(nextValue) })
            } else if (key === 'backgroundPhotoAnimation') {
              onUpdate({ backgroundPhotoAnimation: nextValue as SectionBlockProps['backgroundPhotoAnimation'] })
            }
          }}
        />
        <BackgroundOpacityField
          value={props.backgroundOpacity ?? 100}
          onChange={backgroundOpacity => onUpdate({ backgroundOpacity })}
        />
      </PropertySection>

      {!isSplit && (
        <PropertySection title='Animated background' collapsible defaultOpen>
          <AnimatedBackgroundControls
            config={props}
            accentColor={accentColor}
            onUpdate={onUpdate}
            syncBlockBackgroundOpacity
            hidePlacementControls
          />
        </PropertySection>
      )}
    </>
  )
}
