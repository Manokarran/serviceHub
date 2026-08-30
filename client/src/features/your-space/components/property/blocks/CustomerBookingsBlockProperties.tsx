'use client'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, CustomerBookingsBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { AlignmentControl } from '../AlignmentControl'
import { PropertyBodyText, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { BlockBackgroundModePanel } from '../../BlockBackgroundModePanel'
import { useSiteStyles } from '../../SiteStylesScope'

type Props = {
  block: Block<'customerBookings'>
  activeTab: PropertyPanelTab
}

export function CustomerBookingsBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props
  const update = (changes: Partial<CustomerBookingsBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertyTextField label='Heading' value={props.title} onChange={title => update({ title })} />
        <PropertyTextField
          label='Supporting text'
          value={props.subtitle}
          onChange={subtitle => update({ subtitle })}
          multiline
        />
        <FormControlLabel control={<Switch checked disabled />} label='Google sign-in required' />
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

  if (activeTab === 'style') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
        <PropertySection title='Bookings background' collapsible defaultOpen>
          <BlockBackgroundModePanel
            props={props}
            accentColor={siteStyles.colors.accent}
            sectionType='customer-bookings'
            fallbackColor='#ffffff'
            onUpdate={update}
          />
        </PropertySection>
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <PropertyBodyText>Customers sign in with Google to view their bookings for this website.</PropertyBodyText>
    </PropertyFields>
  )
}
