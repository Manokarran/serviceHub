'use client'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, FooterBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyColorField } from '../PropertyColorField'
import { PropertySliderField } from '../PropertySliderField'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyToggleRow } from '../PropertyToggleRow'
import { TextTypographyControls } from '../TextTypographyControls'
import { useSiteStyles } from '../../SiteStylesScope'
import { ChromeBlockStyleControls } from '../../ChromeBlockStyleControls'
import { ChromeBlockBrandingFields, ChromeBlockStructureFields } from './ChromeBlockShared'
import { normalizeNavLinks } from '../../../utils/blockMigration'

type Props = {
  block: Block<'footer'>
  activeTab: PropertyPanelTab
}

export function FooterBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as FooterBlockProps
  const update = (changes: Partial<FooterBlockProps>) => updateBlock(block.id, changes)

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
          navLinks={normalizeNavLinks(props.navLinks)}
          onUpdate={update}
        />
        <PropertySection title='Copyright' collapsible defaultOpen>
          <PropertyTextField
            label='Copyright text'
            value={props.copyrightText}
            onChange={copyrightText => update({ copyrightText })}
            placeholder='© 2026 Company Name. All rights reserved.'
            multiline
            rows={2}
          />
        </PropertySection>
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
          label='Stick to bottom'
          description='Stays visible while scrolling, then floats as a compact bar'
          checked={props.fixed ?? false}
          onChange={fixed => update({ fixed })}
        />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <ChromeBlockStyleControls
        props={props}
        accentColor={siteStyles.colors.accent}
        chromeType='footer'
        onUpdate={update}
      />
      <PropertySection title='Text' collapsible defaultOpen>
        <PropertyColorField
          label='Text color'
          value={props.textColor}
          onChange={textColor => update({ textColor })}
        />
      </PropertySection>
      <TextTypographyControls
        role='logo'
        sectionTitle='Logo typography'
        fonts={siteStyles.fonts}
        typography={props.logoTypography}
        onChange={logoTypography => update({ logoTypography })}
      />
      <TextTypographyControls
        role='nav'
        sectionTitle='Navigation typography'
        fonts={siteStyles.fonts}
        typography={props.navTypography}
        onChange={navTypography => update({ navTypography })}
      />
      <TextTypographyControls
        role='label'
        sectionTitle='Copyright typography'
        fonts={siteStyles.fonts}
        typography={props.copyrightTypography}
        onChange={copyrightTypography => update({ copyrightTypography })}
      />
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
