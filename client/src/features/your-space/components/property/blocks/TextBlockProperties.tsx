'use client'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, TextBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { LayoutOptionGroup, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyColorField } from '../PropertyColorField'
import { AlignmentControl } from '../AlignmentControl'
import { TextTypographyControls } from '../TextTypographyControls'
import { useSiteStyles } from '../../SiteStylesScope'
import {
  getTextVariant,
  TEXT_VARIANT_OPTIONS,
  textVariantNeedsAttribution
} from '../../../utils/textBlockVariantHelpers'

type Props = {
  block: Block<'text'>
  activeTab: PropertyPanelTab
}

export function TextBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as TextBlockProps
  const update = (changes: Partial<TextBlockProps>) => updateBlock(block.id, changes)
  const variant = getTextVariant(props)
  const showAttribution = textVariantNeedsAttribution(variant)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertySection title='Style' collapsible defaultOpen>
          <LayoutOptionGroup
            value={variant}
            options={TEXT_VARIANT_OPTIONS}
            onChange={next => update({ variant: next })}
          />
        </PropertySection>
        <PropertyTextField
          label='Content'
          value={props.text}
          onChange={text => update({ text })}
          placeholder='Paragraph text…'
          multiline
          rows={4}
        />
        {showAttribution && (
          <>
            <PropertyTextField
              label='Attribution'
              value={props.cite ?? ''}
              onChange={cite => update({ cite })}
              placeholder='Client name'
            />
            <PropertyTextField
              label='Role / company'
              value={props.citeRole ?? ''}
              onChange={citeRole => update({ citeRole })}
              placeholder='CEO, Acme Co.'
            />
          </>
        )}
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
      <PropertyColorField
        label='Text color'
        value={props.color}
        onChange={color => update({ color })}
      />
      {(variant === 'quote' ||
        variant === 'testimonial' ||
        variant === 'callout' ||
        variant === 'pullquote' ||
        variant === 'calligraphy') && (
        <PropertyColorField
          label='Accent color'
          value={props.accentColor || siteStyles.colors.accent}
          onChange={accentColor => update({ accentColor })}
        />
      )}
      <TextTypographyControls
        role='body'
        fonts={siteStyles.fonts}
        typography={props.typography}
        onChange={typography => update({ typography })}
      />
    </PropertyFields>
  )
}
