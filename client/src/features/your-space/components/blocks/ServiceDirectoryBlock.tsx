'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import type { PublicService } from '@/services/booking/public-service.service'
import { getSiteButtonSx } from '../../utils/siteStylesHelpers'
import { getMediaHoverSx } from '../../utils/mediaBlockHelpers'
import type { ServiceDirectoryBlockProps } from '../../types'
import { usePublicTenantSlug } from '../../hooks/usePublicTenantSlug'
import { useSiteStyles } from '../SiteStylesScope'

import { ChromeBlockBackground } from './ChromeBlockBackground'
import { ServiceInfo } from './ServiceInfo'
import { ServiceBookingFlow } from './ServiceBookingFlow'
import { InlineEditableText } from '../inline/InlineEditableText'

type Props = {
  props: ServiceDirectoryBlockProps
}

function serviceFilter(services: PublicService[], props: ServiceDirectoryBlockProps, query: string) {
  const selected = props.serviceIds.length > 0 ? new Set(props.serviceIds) : null
  const normalizedQuery = query.trim().toLowerCase()

  return services.filter(service => {
    if (selected && !selected.has(service.id)) {
      return false
    }

    if (props.category && service.category.toLowerCase() !== props.category.toLowerCase()) {
      return false
    }

    return (
      !normalizedQuery ||
      `${service.name} ${service.tagline} ${service.description} ${service.category} ${service.tags.join(' ')}`
        .toLowerCase()
        .includes(normalizedQuery)
    )
  })
}

export function ServiceDirectoryBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const [services, setServices] = useState<PublicService[]>([])
  const [query, setQuery] = useState('')
  const [selectedService, setSelectedService] = useState<PublicService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantSlug) {
      setLoading(false)

      return
    }

    let active = true

    const load = async () => {
      try {
        const response = await fetch(`/api/public/services?tenantSlug=${encodeURIComponent(tenantSlug)}`)
        const result = (await response.json()) as { services?: PublicService[]; error?: string }

        if (!response.ok) {
          throw new Error(result.error || 'Unable to load services')
        }

        if (active) {
          setServices(result.services ?? [])
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load services')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [tenantSlug])

  useEffect(() => {
    const openDirectory = () => {
      document.getElementById('service-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const openBooking = (event: Event) => {
      const serviceSlug = (event as CustomEvent<{ serviceSlug?: string }>).detail?.serviceSlug
      const service = services.find(item => item.slug === serviceSlug)

      if (service) {
        event.preventDefault()
        setSelectedService(service)
      }
    }

    window.addEventListener('servicehub:open-service-directory', openDirectory)
    window.addEventListener('servicehub:open-service-booking', openBooking)

    return () => {
      window.removeEventListener('servicehub:open-service-directory', openDirectory)
      window.removeEventListener('servicehub:open-service-booking', openBooking)
    }
  }, [services])

  const visibleServices = useMemo(() => serviceFilter(services, props, query), [props, query, services])

  const gridColumns =
    props.layout === 'list'
      ? '1fr'
      : props.layout === 'featured'
        ? { xs: '1fr', md: 'repeat(3, 1fr)' }
        : { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }

  if (!tenantSlug) {
    return (
      <Alert severity='info'>Service directory preview — publish this page to load the tenant’s live services.</Alert>
    )
  }

  return (
    <ChromeBlockBackground
      component='section'
      props={props}
      fallbackColor='#ffffff'
      sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 7 } }}
      contentSx={{ width: '100%' }}
    >
      <Box id='service-directory'>
        <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ md: 'flex-end' }}
            justifyContent='space-between'
            sx={{ mb: 4 }}
          >
            <Box sx={{ textAlign: props.alignment }}>
              <Typography variant='h3' sx={{ fontWeight: 750, letterSpacing: '-0.03em' }}>
                <InlineEditableText value={props.title} field='title' placeholder='Services title' />
              </Typography>
              <Typography color='text.secondary' sx={{ mt: 1, maxWidth: 620 }}>
                <InlineEditableText
                  value={props.subtitle}
                  field='subtitle'
                  placeholder='Supporting text'
                  multiline
                  sx={{ display: 'block' }}
                />
              </Typography>
            </Box>
            {props.showSearch ? (
              <TextField
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder='Search services'
                size='small'
                sx={{ width: { xs: '100%', md: 260 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' />
                    </InputAdornment>
                  )
                }}
              />
            ) : null}
          </Stack>

          {error ? <Alert severity='error'>{error}</Alert> : null}
          {loading ? (
            <Typography color='text.secondary'>Loading available services…</Typography>
          ) : visibleServices.length === 0 ? (
            <Alert severity='info'>No services match your search right now.</Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: gridColumns, gap: 3 }}>
              {visibleServices.map((service, index) => {
                const isListLayout = props.layout === 'list'
                const isFeaturedLead = props.layout === 'featured' && index === 0

                return (
                  <Card
                    key={service.id}
                    variant='outlined'
                    data-site-analytics='service-card'
                    sx={{
                      display: isListLayout ? { xs: 'block', sm: 'grid' } : isFeaturedLead ? { md: 'grid' } : 'block',
                      gridTemplateColumns: isFeaturedLead ? { md: '1.25fr 1fr' } : { sm: '180px 1fr' },
                      gridColumn: isFeaturedLead ? { md: '1 / -1' } : undefined,
                      overflow: 'hidden',
                      borderRadius: 3,
                      color: siteStyles.colors.text,
                      background: `linear-gradient(145deg, ${alpha(siteStyles.colors.background, 0.74)} 0%, ${alpha(siteStyles.colors.accent, 0.12)} 100%)`,
                      backdropFilter: 'blur(16px) saturate(125%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(125%)',
                      borderColor: alpha(siteStyles.colors.text, 0.16),
                      boxShadow: `0 16px 36px ${alpha(siteStyles.colors.text, 0.12)}`,
                      transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: siteStyles.colors.accent,
                        boxShadow: `0 22px 46px ${alpha(siteStyles.colors.accent, 0.24)}`
                      }
                    }}
                  >
                    <Box
                      sx={{
                        aspectRatio: isListLayout ? 'auto' : isFeaturedLead ? '1.7 / 1' : '1.65 / 1',
                        height: isListLayout ? { xs: 170, sm: '100%' } : undefined,
                        minHeight: isFeaturedLead ? { md: 280 } : undefined,
                        bgcolor: 'action.hover',
                        position: 'relative',
                        ...getMediaHoverSx(siteStyles.misc.imageHoverEffect)
                      }}
                    >
                      {service.coverImageUrl ? (
                        <Box
                          component='img'
                          className='media-block-image'
                          src={service.coverImageUrl}
                          alt=''
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <Stack
                          alignItems='center'
                          justifyContent='center'
                          sx={{ width: '100%', height: '100%', color: 'text.disabled' }}
                        >
                          <i className='ri-calendar-check-line' style={{ fontSize: 42 }} />
                        </Stack>
                      )}
                      {props.showCategory && service.category ? (
                        <Chip
                          label={service.category}
                          size='small'
                          sx={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            bgcolor: alpha(siteStyles.colors.background, 0.82),
                            color: siteStyles.colors.text,
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      ) : null}
                    </Box>
                    <CardContent sx={{ p: isFeaturedLead ? { xs: 3, md: 4 } : 3 }}>
                      <Typography variant={isFeaturedLead ? 'h3' : 'h5'} sx={{ fontWeight: 700 }}>
                        {service.name}
                      </Typography>
                      {service.tagline ? (
                        <Typography color='text.secondary' sx={{ mt: 0.75, minHeight: isListLayout ? undefined : 42 }}>
                          {service.tagline}
                        </Typography>
                      ) : null}
                      <Box sx={{ mt: 2 }}>
                        <ServiceInfo
                          service={service}
                          compact={!isFeaturedLead}
                          showDuration={props.showDuration}
                          showPrice={props.showPrice}
                        />
                      </Box>
                      {props.showAvailability ? (
                        <Typography variant='body2' sx={{ mt: 2, fontWeight: 600, color: siteStyles.colors.accent }}>
                          {service.nextAvailableAt
                            ? `Next available ${new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(service.nextAvailableAt))}`
                            : 'Check availability'}
                        </Typography>
                      ) : null}
                      <Button
                        variant='contained'
                        fullWidth={!isListLayout}
                        sx={{
                          ...(getSiteButtonSx('primary', siteStyles) as Record<string, unknown>),
                          mt: 2
                        }}
                        data-site-analytics='service-booking'
                        onClick={() => setSelectedService(service)}
                      >
                        {props.ctaLabel}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </Box>
          )}
        </Box>

        <Dialog
          open={Boolean(selectedService)}
          onClose={() => setSelectedService(null)}
          fullWidth
          maxWidth='md'
          scroll='paper'
        >
          <DialogTitle>
            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
              <Typography component='span' variant='h6'>
                {selectedService?.name}
              </Typography>
              <IconButton size='small' aria-label='Close booking' onClick={() => setSelectedService(null)}>
                <i className='ri-close-line' />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {selectedService ? (
              <ServiceBookingFlow
                tenantSlug={tenantSlug}
                initialService={selectedService}
                title='Choose a time'
                subtitle={selectedService.tagline || 'Select an available time that works for you.'}
                ctaLabel='Book this time'
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </Box>
    </ChromeBlockBackground>
  )
}
