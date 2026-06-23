'use client'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, HeroBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PageLinkField } from '../PageLinkField'
import { HeroLayoutControls } from '../../HeroLayoutControls'
import { HeroStyleControls } from '../../HeroStyleControls'

type Props = {
  block: Block<'hero'>
  activeTab: PropertyPanelTab
}

export function HeroBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as HeroBlockProps
  const update = (changes: Partial<HeroBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertySection title='Content' collapsible defaultOpen>
          <PropertyTextField
            label='Title'
            value={props.title}
            onChange={title => update({ title })}
            placeholder='Hero headline…'
          />
          <PropertyTextField
            label='Subtitle'
            value={props.subtitle}
            onChange={subtitle => update({ subtitle })}
            placeholder='Supporting text…'
            multiline
            rows={2}
          />
        </PropertySection>
        <PropertySection title='Call to action' collapsible defaultOpen>
          <PropertyTextField
            label='Button label'
            value={props.buttonText}
            onChange={buttonText => update({ buttonText })}
            placeholder='Get started'
          />
          <PageLinkField
            label='Button link'
            value={props.buttonLink}
            onChange={buttonLink => update({ buttonLink })}
            placeholder='/page or https://…'
          />
        </PropertySection>
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <HeroLayoutControls props={props} onUpdate={update} />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <HeroStyleControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
    </PropertyFields>
  )
}
