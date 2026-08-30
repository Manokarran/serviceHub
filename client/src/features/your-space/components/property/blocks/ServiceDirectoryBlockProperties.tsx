'use client'

import { useEffect, useState } from 'react'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'

import type { PublicService } from '@/services/booking/public-service.service'
import { useBuilder } from '../../../context/BuilderContext'
import { usePublicTenantSlug } from '../../../hooks/usePublicTenantSlug'
import type { Block, ServiceDirectoryBlockProps, ServiceDirectoryLayout } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { LayoutOptionGroup, PropertyBodyText, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { AlignmentControl } from '../AlignmentControl'
import { BlockBackgroundModePanel } from '../../BlockBackgroundModePanel'
import { PropertyTextField } from '../PropertyTextField'
import { useSiteStyles } from '../../SiteStylesScope'

const LAYOUT_OPTIONS: { value: ServiceDirectoryLayout; label: string; icon: string }[] = [
  { value: 'cards', label: 'Cards', icon: 'ri-layout-grid-line' },
  { value: 'featured', label: 'Featured', icon: 'ri-gallery-line' },
  { value: 'list', label: 'List', icon: 'ri-list-check' }
]

type Props = {
  block: Block<'serviceDirectory'>
  activeTab: PropertyPanelTab
}

export function ServiceDirectoryBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const [services, setServices] = useState<PublicService[]>([])
  const props = block.props
  const update = (changes: Partial<ServiceDirectoryBlockProps>) => updateBlock(block.id, changes)

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
        <PropertyTextField label='Heading' value={props.title} onChange={title => update({ title })} />
        <PropertyTextField
          label='Supporting text'
          value={props.subtitle}
          onChange={subtitle => update({ subtitle })}
          multiline
        />
        <PropertyTextField label='Button label' value={props.ctaLabel} onChange={ctaLabel => update({ ctaLabel })} />
        <TextField
          select
          label='Category filter'
          value={props.category}
          onChange={event => update({ category: event.target.value })}
          fullWidth
          size='small'
        >
          <MenuItem value=''>All categories</MenuItem>
          {[...new Set(services.map(service => service.category).filter(Boolean))].map(category => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <PropertySection title='Services to show' collapsible defaultOpen>
          <PropertyBodyText>Leave every service unchecked to show all published services.</PropertyBodyText>
          {services.map(service => (
            <FormControlLabel
              key={service.id}
              control={
                <Checkbox
                  size='small'
                  checked={props.serviceIds.includes(service.id)}
                  onChange={event => {
                    const serviceIds = event.target.checked
                      ? [...props.serviceIds, service.id]
                      : props.serviceIds.filter(id => id !== service.id)

                    update({ serviceIds })
                  }}
                />
              }
              label={service.name}
            />
          ))}
          {services.length === 0 ? (
            <PropertyBodyText>Publish a service to choose specific services.</PropertyBodyText>
          ) : null}
        </PropertySection>
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <LayoutOptionGroup value={props.layout} options={LAYOUT_OPTIONS} onChange={layout => update({ layout })} />
        <FormControlLabel
          control={
            <Checkbox checked={props.showSearch} onChange={event => update({ showSearch: event.target.checked })} />
          }
          label='Show search'
        />
        <FormControlLabel
          control={
            <Checkbox checked={props.showCategory} onChange={event => update({ showCategory: event.target.checked })} />
          }
          label='Show category'
        />
        <FormControlLabel
          control={
            <Checkbox checked={props.showPrice} onChange={event => update({ showPrice: event.target.checked })} />
          }
          label='Show price'
        />
        <FormControlLabel
          control={
            <Checkbox checked={props.showDuration} onChange={event => update({ showDuration: event.target.checked })} />
          }
          label='Show duration'
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={props.showAvailability}
              onChange={event => update({ showAvailability: event.target.checked })}
            />
          }
          label='Show next availability'
        />
      </PropertyFields>
    )
  }

  if (activeTab === 'style') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
        <PropertySection title='Directory background' collapsible defaultOpen>
          <BlockBackgroundModePanel
            props={props}
            accentColor={siteStyles.colors.accent}
            sectionType='service-directory'
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
