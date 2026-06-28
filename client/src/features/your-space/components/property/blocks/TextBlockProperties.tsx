'use client'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, TextBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyColorField } from '../PropertyColorField'
import { AlignmentControl } from '../AlignmentControl'
import { TextTypographyControls } from '../TextTypographyControls'
import { useSiteStyles } from '../../SiteStylesScope'

type Props = {
  block: Block<'text'>
  activeTab: PropertyPanelTab
}

export function TextBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as TextBlockProps
  const update = (changes: Partial<TextBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertyTextField
          label='Content'
          value={props.text}
          onChange={text => update({ text })}
          placeholder='Paragraph text…'
          multiline
          rows={4}
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
      <PropertyColorField
        label='Text color'
        value={props.color}
        onChange={color => update({ color })}
      />
      <TextTypographyControls
        role='body'
        fonts={siteStyles.fonts}
        typography={props.typography}
        onChange={typography => update({ typography })}
      />
    </PropertyFields>
  )
}
