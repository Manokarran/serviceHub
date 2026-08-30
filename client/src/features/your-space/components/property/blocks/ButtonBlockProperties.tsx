'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import MenuItem from '@mui/material/MenuItem'

import TextField from '@mui/material/TextField'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { builderSoftCardSx } from '../../../constants/builderChrome'
import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, ButtonBlockProps } from '../../../types'
import { getButtonBorderRadius, mapBlockVariantToButtonRole } from '../../../utils/siteStylesHelpers'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyBodyText, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'

import { PageLinkField } from '../PageLinkField'
import { PropertyColorField } from '../PropertyColorField'
import { PropertySliderField } from '../PropertySliderField'
import { AlignmentControl } from '../AlignmentControl'
import type { PublicService } from '@/services/booking/public-service.service'
import { usePublicTenantSlug } from '../../../hooks/usePublicTenantSlug'

// ─── Variant control ──────────────────────────────────────────────────────────

const VARIANT_OPTIONS: {
  value: ButtonBlockProps['variant']
  icon: string
  label: string
  description: string
}[] = [
  { value: 'contained', icon: 'ri-checkbox-blank-fill', label: 'Filled', description: 'Solid background' },
  { value: 'outlined', icon: 'ri-checkbox-blank-line', label: 'Outlined', description: 'Border only' },
  { value: 'text', icon: 'ri-text-snippet', label: 'Text', description: 'No border or fill' }
]

function VariantControl({
  value,
  onChange
}: {
  value: ButtonBlockProps['variant']
  onChange: (v: ButtonBlockProps['variant']) => void
}) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        Button style
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {VARIANT_OPTIONS.map(opt => {
          const active = value === opt.value

          return (
            <Box
              key={opt.value}
              component='button'
              type='button'
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1.25,
                py: 0.875,
                border: 'none',
                borderRadius: 1,
                cursor: 'pointer',
                textAlign: 'left',
                ...builderSoftCardSx(theme, active),
                color: active ? 'primary.main' : 'text.secondary',
                transition: 'all 0.12s'
              }}
            >
              <i className={opt.icon} style={{ fontSize: '1rem', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit', m: 0, fontWeight: 600 }}>
                  {opt.label}
                </Typography>
                <Typography
                  component='p'
                  sx={{
                    ...BUILDER_TYPOGRAPHY.label,
                    fontWeight: 400,
                    color: active ? alpha(theme.palette.primary.main, 0.7) : 'text.disabled',
                    m: 0
                  }}
                >
                  {opt.description}
                </Typography>
              </Box>
              {active && (
                <Box sx={{ ml: 'auto', flexShrink: 0, color: 'primary.main' }}>
                  <i className='ri-check-line' style={{ fontSize: '0.875rem' }} />
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

// ─── Tab content ──────────────────────────────────────────────────────────────

type Props = {
  block: Block<'button'>
  activeTab: PropertyPanelTab
}

export function ButtonBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const [services, setServices] = useState<PublicService[]>([])
  const props = block.props
  const update = (changes: Partial<ButtonBlockProps>) => updateBlock(block.id, changes)

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

  const siteDefaultRadius = getButtonBorderRadius(
    siteStyles.buttons[mapBlockVariantToButtonRole(props.variant)].shape
  ) as number

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertyTextField
          label='Label'
          value={props.text}
          onChange={text => update({ text })}
          placeholder='Button text…'
        />
        <PageLinkField
          label='Link'
          value={props.link}
          onChange={link => update({ link })}
          placeholder='/page or https://…'
        />
        <TextField
          select
          size='small'
          label='Action'
          value={props.action ?? 'link'}
          onChange={event => update({ action: event.target.value as ButtonBlockProps['action'] })}
          fullWidth
        >
          <MenuItem value='link'>Open link</MenuItem>
          <MenuItem value='serviceDirectory'>Open service directory</MenuItem>
          <MenuItem value='serviceBooking'>Book a service</MenuItem>
        </TextField>
        {props.action === 'serviceBooking' ? (
          <>
            <TextField
              select
              size='small'
              label='Choose service'
              value={props.serviceSlug ?? ''}
              onChange={event => update({ serviceSlug: event.target.value })}
              fullWidth
              helperText='Clicking this button opens the selected service booking.'
            >
              <MenuItem value=''>Choose a service</MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={service.slug}>
                  {service.name}
                </MenuItem>
              ))}
            </TextField>
            {services.length === 0 ? (
              <Typography variant='caption' color='text.secondary'>
                Publish a service first, then select it here.
              </Typography>
            ) : null}
            <PropertyBodyText>
              On the published page, this opens the selected service in an inline booking block or opens the booking
              page if no inline block is available.
            </PropertyBodyText>
          </>
        ) : null}
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

  // Style tab
  return (
    <PropertyFields>
      <PropertySection title='Appearance' collapsible defaultOpen>
        <VariantControl value={props.variant} onChange={variant => update({ variant })} />
        <PropertyColorField label='Color' value={props.color} onChange={color => update({ color })} />
      </PropertySection>
      <PropertySection title='Shape' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.borderRadius ?? siteDefaultRadius}
          min={0}
          max={48}
          step={2}
          unit='px'
          onChange={borderRadius => update({ borderRadius })}
          siteDefault={siteDefaultRadius}
          onUseSiteDefault={props.borderRadius !== undefined ? () => update({ borderRadius: undefined }) : undefined}
        />
      </PropertySection>
    </PropertyFields>
  )
}
