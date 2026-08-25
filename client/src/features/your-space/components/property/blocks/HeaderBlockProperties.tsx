'use client'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, HeaderBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyColorField } from '../PropertyColorField'
import { PropertySliderField } from '../PropertySliderField'
import { PropertyToggleRow } from '../PropertyToggleRow'
import { TextTypographyControls } from '../TextTypographyControls'
import { useSiteStyles } from '../../SiteStylesScope'
import { ChromeBlockStyleControls } from '../../ChromeBlockStyleControls'
import { ChromeBlockBrandingFields, ChromeBlockStructureFields } from './ChromeBlockShared'
import { normalizeNavLinks } from '../../../utils/blockMigration'

type Props = {
  block: Block<'header'>
  activeTab: PropertyPanelTab
}

export function HeaderBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as HeaderBlockProps
  const update = (changes: Partial<HeaderBlockProps>) => updateBlock(block.id, changes)

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
          label='Stick to top'
          description='Header stays visible while scrolling'
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
        chromeType='header'
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
