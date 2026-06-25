'use client'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, HeroBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PageLinkField } from '../PageLinkField'
import { PropertyAddButton, PropertyRemoveButton } from '../PropertyActionButton'
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
  const hasEyebrow = Boolean(props.eyebrow?.trim())
  const hasPrimaryButton = Boolean(props.buttonText?.trim())
  const hasSecondaryButton = Boolean(props.secondaryButtonText?.trim())

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertySection title='Headline' collapsible defaultOpen>
          {hasEyebrow ? (
            <>
              <PropertyTextField
                label='Eyebrow'
                value={props.eyebrow ?? ''}
                onChange={eyebrow => update({ eyebrow })}
                placeholder='Now live · Limited spots'
              />
              <PropertyRemoveButton label='Remove eyebrow' onClick={() => update({ eyebrow: '' })} />
            </>
          ) : (
            <PropertyAddButton label='Add eyebrow' onClick={() => update({ eyebrow: 'Now live' })} />
          )}
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
            rows={3}
          />
        </PropertySection>
        <PropertySection title='Call to action' collapsible defaultOpen>
          {hasPrimaryButton ? (
            <>
              <PropertyTextField
                label='Primary button'
                value={props.buttonText}
                onChange={buttonText => update({ buttonText })}
                placeholder='Get started'
              />
              <PageLinkField
                label='Primary link'
                value={props.buttonLink}
                onChange={buttonLink => update({ buttonLink })}
                placeholder='/page or https://…'
              />
              <PropertyRemoveButton
                label='Remove primary button'
                onClick={() => update({ buttonText: '', buttonLink: '#' })}
              />
            </>
          ) : (
            <PropertyAddButton
              label='Add primary button'
              onClick={() => update({ buttonText: 'Get started', buttonLink: '#' })}
            />
          )}
          {hasSecondaryButton ? (
            <>
              <PropertyTextField
                label='Secondary button'
                value={props.secondaryButtonText ?? ''}
                onChange={secondaryButtonText => update({ secondaryButtonText })}
                placeholder='See how it works'
              />
              <PageLinkField
                label='Secondary link'
                value={props.secondaryButtonLink ?? '#'}
                onChange={secondaryButtonLink => update({ secondaryButtonLink })}
                placeholder='/page or https://…'
              />
              <PropertyRemoveButton
                label='Remove secondary button'
                onClick={() => update({ secondaryButtonText: '', secondaryButtonLink: '#' })}
              />
            </>
          ) : (
            <PropertyAddButton
              label='Add secondary button'
              onClick={() => update({ secondaryButtonText: 'Learn more', secondaryButtonLink: '#' })}
            />
          )}
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
