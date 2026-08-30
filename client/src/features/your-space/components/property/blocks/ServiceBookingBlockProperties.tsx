'use client'

import { useEffect, useState } from 'react'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import type { PublicService } from '@/services/booking/public-service.service'
import { useBuilder } from '../../../context/BuilderContext'
import { usePublicTenantSlug } from '../../../hooks/usePublicTenantSlug'
import type { Block, ServiceBookingBlockProps, ServiceBookingLayout } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { LayoutOptionGroup, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { AlignmentControl } from '../AlignmentControl'
import { PropertyTextField } from '../PropertyTextField'
import { BlockBackgroundModePanel } from '../../BlockBackgroundModePanel'
import { useSiteStyles } from '../../SiteStylesScope'

const LAYOUT_OPTIONS: { value: ServiceBookingLayout; label: string; icon: string }[] = [
  { value: 'inline', label: 'Full panel', icon: 'ri-layout-row-line' },
  { value: 'compact', label: 'Compact', icon: 'ri-layout-column-line' }
]

type Props = {
  block: Block<'serviceBooking'>
  activeTab: PropertyPanelTab
}

export function ServiceBookingBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const [services, setServices] = useState<PublicService[]>([])
  const props = block.props
  const update = (changes: Partial<ServiceBookingBlockProps>) => updateBlock(block.id, changes)

  useEffect(() => {
    if (!tenantSlug) {
      return
    }

    let active = true

    fetch(`/api/public/services?tenantSlug=${encodeURIComponent(tenantSlug)}`)
      .then(response => response.json() as Promise<{ services?: PublicService[] }>)
      .then(result => {
        if (active) {
          setServices(result.services ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setServices([])
        }
      })

    return () => {
      active = false
    }
  }, [tenantSlug])

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <TextField
          select
          label='Service'
          value={props.serviceSlug}
          onChange={event => update({ serviceSlug: event.target.value })}
          fullWidth
          size='small'
        >
          <MenuItem value=''>Choose a service</MenuItem>
          {services.map(service => (
            <MenuItem key={service.id} value={service.slug}>
              {service.name}
            </MenuItem>
          ))}
        </TextField>
        <PropertyTextField label='Heading' value={props.title} onChange={title => update({ title })} />
        <PropertyTextField
          label='Supporting text'
          value={props.subtitle}
          onChange={subtitle => update({ subtitle })}
          multiline
        />
        <PropertyTextField label='Button label' value={props.ctaLabel} onChange={ctaLabel => update({ ctaLabel })} />
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <LayoutOptionGroup value={props.layout} options={LAYOUT_OPTIONS} onChange={layout => update({ layout })} />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.showServiceSummary}
              onChange={event => update({ showServiceSummary: event.target.checked })}
            />
          }
          label='Show service summary'
        />
        <FormControlLabel
          control={
            <Checkbox checked={props.showTimezone} onChange={event => update({ showTimezone: event.target.checked })} />
          }
          label='Show timezone note'
        />
      </PropertyFields>
    )
  }

  if (activeTab === 'style') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
        <PropertySection title='Booking background' collapsible defaultOpen>
          <BlockBackgroundModePanel
            props={props}
            accentColor={siteStyles.colors.accent}
            sectionType='service-booking'
            fallbackColor='#ffffff'
            onUpdate={update}
          />
        </PropertySection>
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
    </PropertyFields>
  )
}
