'use client'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'

import { LocationAddressSearch } from '@/components/location/LocationAddressSearch'
import { LocationMap } from '@/components/location/LocationMap'
import type { LocationMapStyle } from '@/lib/location/types'
import { useTenantLocation } from '../../TenantLocationScope'
import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, LocationBlockProps, LocationBlockSource } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { AlignmentControl } from '../AlignmentControl'
import { BackgroundOpacityField } from '../BackgroundOpacityField'
import { LayoutOptionGroup, PropertyBodyText, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'

type Props = {
  block: Block<'location'>
  activeTab: PropertyPanelTab
}

const ZOOM_OPTIONS = [8, 10, 12, 14, 16, 18]

const MAP_STYLE_OPTIONS: { value: LocationMapStyle; label: string; icon: string }[] = [
  { value: 'theme', label: 'Page theme', icon: 'ri-palette-line' },
  { value: 'standard', label: 'Standard', icon: 'ri-map-2-line' },
  { value: 'muted', label: 'Muted', icon: 'ri-contrast-2-line' },
  { value: 'monochrome', label: 'Monochrome', icon: 'ri-ink-bottle-line' },
  { value: 'warm', label: 'Warm', icon: 'ri-sun-line' }
]

export function LocationBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const profileLocation = useTenantLocation()
  const props = block.props
  const update = (changes: Partial<LocationBlockProps>) => updateBlock(block.id, changes)
  const isProfileSource = props.source === 'profile'

  const updateCoordinate = (field: 'latitude' | 'longitude', value: string) => {
    const coordinate = Number(value)
    const limit = field === 'latitude' ? 90 : 180

    if (Number.isFinite(coordinate) && coordinate >= -limit && coordinate <= limit) {
      update({ [field]: coordinate })
    }
  }

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
        <TextField
          select
          label='Location source'
          value={props.source}
          onChange={event => {
            const source = event.target.value as LocationBlockSource

            update(
              source === 'profile' && profileLocation
                ? {
                    source,
                    address: profileLocation.address,
                    latitude: profileLocation.latitude,
                    longitude: profileLocation.longitude
                  }
                : { source }
            )
          }}
          fullWidth
          size='small'
        >
          <MenuItem value='profile'>Business profile</MenuItem>
          <MenuItem value='custom'>Custom override</MenuItem>
        </TextField>
        {isProfileSource ? (
          <PropertyBodyText>
            This block follows the address in Profile settings. Choose Custom override to use a different location on
            this page.
          </PropertyBodyText>
        ) : (
          <>
            <LocationAddressSearch
              selectedAddress={props.address}
              selectedLatitude={props.latitude}
              selectedLongitude={props.longitude}
              context={profileLocation}
              onSelect={location =>
                update({
                  address: location.address,
                  latitude: location.latitude,
                  longitude: location.longitude
                })
              }
            />
            <PropertyTextField
              label='Address'
              value={props.address}
              onChange={address => update({ address })}
              multiline
            />
            <TextField
              label='Latitude'
              type='number'
              value={props.latitude}
              onChange={event => updateCoordinate('latitude', event.target.value)}
              inputProps={{ min: -90, max: 90, step: 0.00001 }}
              fullWidth
              size='small'
            />
            <TextField
              label='Longitude'
              type='number'
              value={props.longitude}
              onChange={event => updateCoordinate('longitude', event.target.value)}
              inputProps={{ min: -180, max: 180, step: 0.00001 }}
              fullWidth
              size='small'
            />
            <LocationMap
              latitude={props.latitude}
              longitude={props.longitude}
              markerLabel={props.address}
              interactive
              onChange={point => update(point)}
              height={180}
              mapStyle={props.mapStyle}
              showControls={props.showMapControls}
              accentColor={siteStyles.colors.accent}
              surfaceColor={siteStyles.colors.background}
              textColor={siteStyles.colors.text}
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
        <PropertySection title='Map display' collapsible defaultOpen>
          <FormControlLabel
            control={<Checkbox checked={props.showMap} onChange={event => update({ showMap: event.target.checked })} />}
            label='Show map'
          />
          <LayoutOptionGroup
            value={props.mapStyle ?? 'theme'}
            options={MAP_STYLE_OPTIONS}
            onChange={mapStyle => update({ mapStyle })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={props.showMapControls ?? true}
                onChange={event => update({ showMapControls: event.target.checked })}
                disabled={!props.showMap}
              />
            }
            label='Show map controls'
          />
          <TextField
            select
            label='Map zoom'
            value={props.mapZoom}
            onChange={event => update({ mapZoom: Number(event.target.value) })}
            fullWidth
            size='small'
            disabled={!props.showMap}
          >
            {ZOOM_OPTIONS.map(zoom => (
              <MenuItem key={zoom} value={zoom}>
                {zoom}
              </MenuItem>
            ))}
          </TextField>
          {props.showMap ? (
            <>
              <BackgroundOpacityField
                label='Map opacity'
                value={props.mapOpacity ?? 85}
                onChange={mapOpacity => update({ mapOpacity })}
              />
              <PropertyBodyText>Lower opacity softens the map so it blends with the page background.</PropertyBodyText>
            </>
          ) : null}
        </PropertySection>
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <FormControlLabel control={<Switch checked disabled />} label='Address card and directions link' />
      <PropertyBodyText>Visitors can open the pin in Google Maps for turn-by-turn directions.</PropertyBodyText>
    </PropertyFields>
  )
}
