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
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
      sx={{ px: { xs: 1.5, sm: 2, md: 4 }, py: { xs: 3, md: 7 } }}
      contentSx={{ width: '100%' }}
    >
      <Box id='service-directory'>
        <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 2, md: 3 }}
            alignItems={{ md: 'flex-end' }}
            justifyContent='space-between'
            sx={{ mb: { xs: 2.5, md: 4 } }}
          >
            <Box sx={{ textAlign: props.alignment }}>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 750,
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.5rem', sm: '1.85rem', md: undefined }
                }}
              >
                <InlineEditableText value={props.title} field='title' placeholder='Services title' />
              </Typography>
              <Typography
                color='text.secondary'
                sx={{ mt: 1, maxWidth: 620, fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.5 }}
              >
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
                fullWidth
                sx={{
                  width: { xs: '100%', md: 280 },
                  '& .MuiOutlinedInput-root': {
                    minHeight: { xs: 48, sm: 44 },
                    borderRadius: { xs: 3, sm: 2 },
                    bgcolor: alpha(siteStyles.colors.text, 0.04)
                  },
                  '& .MuiOutlinedInput-input': {
                    py: { xs: 1.5, sm: 1.25 },
                    fontSize: { xs: '1rem', sm: '0.9375rem' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' style={{ fontSize: '1.15rem' }} />
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
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: gridColumns,
                gap: { xs: 1.5, sm: 2, md: 3 }
              }}
            >
              {visibleServices.map((service, index) => {
                const isListLayout = props.layout === 'list'
                const isFeaturedLead = props.layout === 'featured' && index === 0
                // On phones, card layouts become compact rows (native list feel).
                const mobileRow = !isFeaturedLead

                return (
                  <Card
                    key={service.id}
                    variant='outlined'
                    data-site-analytics='service-card'
                    sx={{
                      display: isFeaturedLead
                        ? { xs: 'block', md: 'grid' }
                        : { xs: 'flex', sm: isListLayout ? 'grid' : 'block' },
                      flexDirection: mobileRow ? { xs: 'row', sm: undefined } : undefined,
                      alignItems: mobileRow ? { xs: 'stretch', sm: undefined } : undefined,
                      gridTemplateColumns: isFeaturedLead ? { md: '1.25fr 1fr' } : { sm: '180px 1fr' },
                      gridColumn: isFeaturedLead ? { md: '1 / -1' } : undefined,
                      overflow: 'hidden',
                      borderRadius: { xs: 2.5, md: 3 },
                      color: siteStyles.colors.text,
                      background: `linear-gradient(145deg, ${alpha(siteStyles.colors.background, 0.74)} 0%, ${alpha(siteStyles.colors.accent, 0.12)} 100%)`,
                      backdropFilter: 'blur(16px) saturate(125%)',
                      WebkitBackdropFilter: 'blur(16px) saturate(125%)',
                      borderColor: alpha(siteStyles.colors.text, 0.16),
                      boxShadow: `0 16px 36px ${alpha(siteStyles.colors.text, 0.12)}`,
                      transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                      WebkitTapHighlightColor: 'transparent',
                      '&:active': {
                        transform: { xs: 'scale(0.99)', sm: 'none' }
                      },
                      '&:hover': {
                        transform: { sm: 'translateY(-3px)' },
                        borderColor: siteStyles.colors.accent,
                        boxShadow: { sm: `0 22px 46px ${alpha(siteStyles.colors.accent, 0.24)}` }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        aspectRatio: isFeaturedLead
                          ? '1.7 / 1'
                          : { xs: undefined, sm: isListLayout ? undefined : '1.65 / 1' },
                        width: mobileRow ? { xs: 96, sm: isListLayout ? 'auto' : undefined } : undefined,
                        height: isListLayout ? { xs: 'auto', sm: '100%' } : undefined,
                        minHeight: isFeaturedLead
                          ? { xs: 160, md: 280 }
                          : mobileRow
                            ? { xs: 96, sm: undefined }
                            : undefined,
                        flexShrink: 0,
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
                          <i
                            className='ri-calendar-check-line'
                            style={{ fontSize: mobileRow && isMobile ? 28 : 42 }}
                          />
                        </Stack>
                      )}
                      {props.showCategory && service.category ? (
                        <Chip
                          label={service.category}
                          size='small'
                          sx={{
                            position: 'absolute',
                            top: { xs: 8, sm: 14 },
                            left: { xs: 8, sm: 14 },
                            display: { xs: mobileRow ? 'none' : 'inline-flex', sm: 'inline-flex' },
                            bgcolor: alpha(siteStyles.colors.background, 0.82),
                            color: siteStyles.colors.text,
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      ) : null}
                    </Box>
                    <CardContent
                      sx={{
                        p: isFeaturedLead
                          ? { xs: 2.25, md: 4 }
                          : { xs: 1.5, sm: 3 },
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&:last-child': {
                          pb: isFeaturedLead ? { xs: 2.25, md: 4 } : { xs: 1.5, sm: 3 }
                        }
                      }}
                    >
                      <Typography
                        variant={isFeaturedLead ? 'h3' : 'h5'}
                        sx={{
                          fontWeight: 700,
                          fontSize: isFeaturedLead
                            ? { xs: '1.35rem', md: undefined }
                            : { xs: '1rem', sm: undefined },
                          lineHeight: 1.25
                        }}
                      >
                        {service.name}
                      </Typography>
                      {service.tagline ? (
                        <Typography
                          color='text.secondary'
                          sx={{
                            mt: 0.5,
                            minHeight: isListLayout ? undefined : { xs: 'auto', sm: 42 },
                            fontSize: { xs: '0.82rem', sm: '0.875rem' },
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: { xs: 2, sm: 3 }
                          }}
                        >
                          {service.tagline}
                        </Typography>
                      ) : null}
                      <Box
                        sx={{
                          mt: { xs: 1, sm: 2 },
                          display: { xs: mobileRow ? 'none' : 'block', sm: 'block' }
                        }}
                      >
                        <ServiceInfo
                          service={service}
                          compact={!isFeaturedLead}
                          showDuration={props.showDuration}
                          showPrice={props.showPrice}
                        />
                      </Box>
                      {props.showAvailability ? (
                        <Typography
                          variant='body2'
                          sx={{
                            mt: { xs: 0.75, sm: 2 },
                            fontWeight: 600,
                            color: siteStyles.colors.accent,
                            fontSize: { xs: '0.78rem', sm: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: { xs: 'nowrap', sm: 'normal' }
                          }}
                        >
                          {service.nextAvailableAt
                            ? `Next available ${new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(service.nextAvailableAt))}`
                            : 'Check availability'}
                        </Typography>
                      ) : null}
                      <Button
                        variant='contained'
                        fullWidth={!isListLayout || isMobile}
                        size={isMobile && mobileRow ? 'small' : 'medium'}
                        sx={{
                          ...(getSiteButtonSx('primary', siteStyles) as Record<string, unknown>),
                          mt: { xs: 1.25, sm: 2 },
                          minHeight: { xs: 40, sm: 44 },
                          alignSelf: isListLayout && !isMobile ? 'flex-start' : undefined
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
          fullScreen={isMobile}
          maxWidth='md'
          scroll='paper'
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 2 }
            }
          }}
        >
          <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
            <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={2}>
              <Typography
                component='span'
                variant='h6'
                sx={{
                  fontWeight: 750,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {selectedService?.name}
              </Typography>
              <IconButton
                aria-label='Close booking'
                onClick={() => setSelectedService(null)}
                sx={{ width: 40, height: 40 }}
              >
                <i className='ri-close-line' />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
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
