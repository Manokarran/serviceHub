'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { LocationMap } from '@/components/location/LocationMap'
import { useSiteStyles } from '../SiteStylesScope'
import { useTenantLocation } from '../TenantLocationScope'
import type { LocationBlockProps } from '../../types'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'

type Props = {
  props: LocationBlockProps
}

export function LocationBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const profileLocation = useTenantLocation()
  const location = props.source === 'profile' && profileLocation ? profileLocation : props
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`

  const alignmentItems =
    props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'

  return (
    <Box
      component='section'
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 7 },
        ...siteCanvasBelow({ px: 2, py: 3 })
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 960,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: alignmentItems,
          gap: 2
        }}
      >
        <Box sx={{ textAlign: props.alignment }}>
          <Typography variant='h4' component='h2' sx={{ color: siteStyles.colors.text, fontWeight: 750 }}>
            {props.title}
          </Typography>
          {props.subtitle ? (
            <Typography color='text.secondary' sx={{ mt: 1 }}>
              {props.subtitle}
            </Typography>
          ) : null}
        </Box>
        {props.showMap ? (
          <Box
            sx={{
              width: '100%',
              opacity: Math.min(100, Math.max(0, props.mapOpacity ?? 85)) / 100,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <LocationMap
              latitude={location.latitude}
              longitude={location.longitude}
              zoom={props.mapZoom}
              markerLabel={location.address}
              height={300}
              mapStyle={props.mapStyle}
              showControls={props.showMapControls}
              accentColor={siteStyles.colors.accent}
              surfaceColor={siteStyles.colors.background}
              textColor={siteStyles.colors.text}
            />
          </Box>
        ) : null}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover'
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', minWidth: 0 }}>
            <i
              className='ri-map-pin-2-line'
              style={{ color: siteStyles.colors.accent, fontSize: '1.35rem', marginTop: 2 }}
            />
            <Typography sx={{ color: siteStyles.colors.text, whiteSpace: 'pre-line' }}>{location.address}</Typography>
          </Box>
          <Button
            component='a'
            href={directionsUrl}
            target='_blank'
            rel='noreferrer'
            variant='outlined'
            size='small'
            startIcon={<i className='ri-route-line' />}
          >
            Get directions
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
