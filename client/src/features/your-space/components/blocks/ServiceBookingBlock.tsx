'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'

import type { ServiceBookingBlockProps } from '../../types'
import { usePublicTenantSlug } from '../../hooks/usePublicTenantSlug'

import { ChromeBlockBackground } from './ChromeBlockBackground'
import { ServiceBookingFlow } from './ServiceBookingFlow'

type Props = {
  props: ServiceBookingBlockProps
}

export function ServiceBookingBlock({ props }: Props) {
  const tenantSlug = usePublicTenantSlug()
  const [activeServiceSlug, setActiveServiceSlug] = useState(props.serviceSlug)

  useEffect(() => {
    setActiveServiceSlug(props.serviceSlug)
  }, [props.serviceSlug])

  useEffect(() => {
    const openBooking = (event: Event) => {
      const serviceSlug = (event as CustomEvent<{ serviceSlug?: string }>).detail?.serviceSlug

      if (serviceSlug) {
        setActiveServiceSlug(serviceSlug)
      }

      event.preventDefault()
      document.getElementById('service-booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    window.addEventListener('servicehub:open-service-booking', openBooking)

    return () => window.removeEventListener('servicehub:open-service-booking', openBooking)
  }, [])

  if (!tenantSlug) {
    return <Box sx={{ p: 4 }}>Service booking preview — choose a service in the block settings.</Box>
  }

  return (
    <ChromeBlockBackground
      component='section'
      props={props}
      fallbackColor='#ffffff'
      sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 7 } }}
      contentSx={{ width: '100%' }}
    >
      <Box id='service-booking' sx={{ maxWidth: 900, mx: 'auto' }}>
        <ServiceBookingFlow
          tenantSlug={tenantSlug}
          serviceSlug={activeServiceSlug || undefined}
          title={props.title}
          subtitle={props.subtitle}
          showServiceSummary={props.showServiceSummary}
          showTimezone={props.showTimezone}
          compact={props.layout === 'compact'}
          ctaLabel={props.ctaLabel}
          onChangeService={props.serviceSlug ? undefined : () => setActiveServiceSlug('')}
        />
      </Box>
    </ChromeBlockBackground>
  )
}
