'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { checkTenantSlugAvailabilityAction, updateTenantProfileAction } from '@/app/actions/tenant-profile.actions'
import { migrateLocalTenantSlug } from '@/features/profile/utils/migrate-local-tenant-slug'
import { SERVICE_CURRENCY_OPTIONS, SERVICE_TIMEZONE_OPTIONS, inferCurrencyFromTimeZone } from '@/lib/constants/service'
import { LocationMap } from '@/components/location/LocationMap'
import { isImageKitConfigured } from '@/lib/imagekit/config'
import { getDisplayImageUrl } from '@/lib/imagekit/urls'
import type { LocationContext } from '@/lib/location/types'
import { sanitizeSlugInput, slugify } from '@/lib/utils/slug'
import { getBrowserTimeZone } from '@/lib/utils/timezone'
import { tenantSlugSchema } from '@/lib/validators/auth.validator'
import type { TenantProfileView } from '@/services/tenant'

type Props = {
  userName: string
  userEmail: string
  userImage: string
  userRole: string
  canEdit: boolean
  siteUrlPrefix: string
  liveSitePath: string
  profile: TenantProfileView
}

type SlugStatus = 'idle' | 'checking' | 'current' | 'available' | 'taken' | 'reserved' | 'invalid'

type BrowserLocation = {
  latitude: number
  longitude: number
}

type GeocodeLocation = {
  address: string
  latitude: number
  longitude: number
  context?: LocationContext
}

type GeocodeResponse = {
  location?: GeocodeLocation
  locations?: GeocodeLocation[]
  error?: string
}

function isLocationContext(value: unknown): value is LocationContext {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const context = value as Partial<LocationContext>

  return ['countryCode', 'country', 'region', 'place'].every(
    field => !(field in context) || typeof context[field as keyof LocationContext] === 'string'
  )
}

function isGeocodeLocation(value: unknown): value is GeocodeLocation {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const location = value as Partial<GeocodeLocation>

  return (
    typeof location.address === 'string' &&
    typeof location.latitude === 'number' &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude === 'number' &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180 &&
    (location.context === undefined || isLocationContext(location.context))
  )
}

function formatRole(role: string) {
  if (!role) {
    return 'Member'
  }

  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export function ProfilePageClient({
  userName,
  userEmail,
  userImage,
  userRole,
  canEdit,
  siteUrlPrefix,
  liveSitePath,
  profile
}: Props) {
  const theme = useTheme()
  const router = useRouter()
  const { update } = useSession()
  const [companyName, setCompanyName] = useState(profile.companyName)
  const [slug, setSlug] = useState(profile.slug)
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl)
  const [defaultTimezone, setDefaultTimezone] = useState(profile.defaultTimezone || 'UTC')
  const [defaultCurrency, setDefaultCurrency] = useState(profile.defaultCurrency || 'INR')
  const [locationAddress, setLocationAddress] = useState(profile.location?.address ?? '')
  const [locationLatitude, setLocationLatitude] = useState<number | null>(profile.location?.latitude ?? null)
  const [locationLongitude, setLocationLongitude] = useState<number | null>(profile.location?.longitude ?? null)
  const [savedProfile, setSavedProfile] = useState(profile)
  const [localeTouched, setLocaleTouched] = useState(false)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('current')
  const [slugMessage, setSlugMessage] = useState('This is your current site URL')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationNotice, setLocationNotice] = useState<string | null>(null)
  const [browserLocation, setBrowserLocation] = useState<BrowserLocation | null>(null)
  const [locationContext, setLocationContext] = useState<LocationContext | null>(profile.location?.context ?? null)
  const [browserLocationContext, setBrowserLocationContext] = useState<LocationContext | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<GeocodeLocation[]>([])

  const normalizedSlug = slugify(slug)
  const slugChanged = normalizedSlug !== savedProfile.slug

  const location =
    locationAddress.trim() && locationLatitude !== null && locationLongitude !== null
      ? {
          address: locationAddress.trim(),
          latitude: locationLatitude,
          longitude: locationLongitude,
          ...(locationContext && Object.keys(locationContext).length > 0 ? { context: locationContext } : {})
        }
      : null

  const locationChanged = JSON.stringify(location) !== JSON.stringify(savedProfile.location)

  const locationIncomplete =
    Boolean(locationAddress.trim() || locationLatitude !== null || locationLongitude !== null) && !location

  const isDirty =
    companyName.trim() !== savedProfile.companyName ||
    slugChanged ||
    logoUrl !== savedProfile.logoUrl ||
    localeTouched ||
    (Boolean(savedProfile.defaultTimezone) && defaultTimezone !== savedProfile.defaultTimezone) ||
    (Boolean(savedProfile.defaultCurrency) && defaultCurrency !== savedProfile.defaultCurrency) ||
    locationChanged

  const imageKitReady = isImageKitConfigured()
  const slugLocked = savedProfile.isSystemTenant

  const canSave =
    canEdit &&
    isDirty &&
    !uploadingLogo &&
    !isPending &&
    companyName.trim().length >= 2 &&
    !locationIncomplete &&
    (!slugChanged || slugStatus === 'available')

  const livePreviewUrl = `${siteUrlPrefix}${normalizedSlug || savedProfile.slug}`
  const logoPreview = logoUrl ? getDisplayImageUrl(logoUrl, 160, { quality: 92 }) : ''

  const slugHelperColor = useMemo(() => {
    if (slugStatus === 'available' || slugStatus === 'current') {
      return 'success.main'
    }

    if (slugStatus === 'checking' || slugStatus === 'idle') {
      return 'text.secondary'
    }

    return 'error.main'
  }, [slugStatus])

  useEffect(() => {
    if (!savedProfile.defaultTimezone && !localeTouched) {
      const browserTimezone = getBrowserTimeZone()

      setDefaultTimezone(browserTimezone)
      setDefaultCurrency(inferCurrencyFromTimeZone(browserTimezone))
    }
  }, [localeTouched, savedProfile.defaultTimezone])

  useEffect(() => {
    setSavedProfile(profile)
    setCompanyName(profile.companyName)
    setSlug(profile.slug)
    setLogoUrl(profile.logoUrl)
    setDefaultTimezone(profile.defaultTimezone || 'UTC')
    setDefaultCurrency(profile.defaultCurrency || 'INR')
    setLocationAddress(profile.location?.address ?? '')
    setLocationLatitude(profile.location?.latitude ?? null)
    setLocationLongitude(profile.location?.longitude ?? null)
    setLocationContext(profile.location?.context ?? null)
    setBrowserLocationContext(null)
    setLocaleTouched(false)
  }, [profile])

  useEffect(() => {
    let cancelled = false

    if (!navigator.geolocation) {
      setLocationNotice(
        profile.location
          ? 'Browser location is unavailable. Your saved profile location remains on the map.'
          : 'Browser location is unavailable. The map is using a world view until you select a location.'
      )

      return () => {
        cancelled = true
      }
    }

    setLocationNotice('Getting your current browser location…')

    navigator.geolocation.getCurrentPosition(
      position => {
        if (cancelled) {
          return
        }

        const point = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }

        if (
          !Number.isFinite(point.latitude) ||
          !Number.isFinite(point.longitude) ||
          point.latitude < -90 ||
          point.latitude > 90 ||
          point.longitude < -180 ||
          point.longitude > 180
        ) {
          setLocationNotice('Browser location returned an invalid position. The map is using a world view instead.')

          return
        }

        setBrowserLocation(point)
        setLocationNotice(
          profile.location
            ? 'Your current browser location is used to make address searches more relevant.'
            : 'Map centered on your current browser location. It is not saved until you choose a pin or address.'
        )

        void fetch(`/api/location/geocode?lat=${point.latitude}&lon=${point.longitude}`)
          .then(async response => {
            const result = await readJson<GeocodeResponse>(response)

            if (
              !cancelled &&
              response.ok &&
              result?.location?.context &&
              isLocationContext(result.location.context)
            ) {
              setBrowserLocationContext(result.location.context)
            }
          })
          .catch(() => {
            // The map location is still useful when reverse geocoding is unavailable.
          })
      },
      error => {
        if (cancelled) {
          return
        }

        const message =
          error.code === error.PERMISSION_DENIED
            ? profile.location
              ? 'Browser location permission was denied. Your saved profile location remains on the map.'
              : 'Browser location permission was denied. The map is using a world view; address search still works.'
            : profile.location
              ? 'Browser location is unavailable. Your saved profile location remains on the map.'
              : 'Browser location is unavailable. The map is using a world view; address search still works.'

        setLocationNotice(message)
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
    )

    return () => {
      cancelled = true
    }
  }, [profile.location])

  useEffect(() => {
    const scrollToWorkspace = () => {
      if (window.location.hash !== '#workspace') {
        return
      }

      window.setTimeout(() => {
        document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }

    scrollToWorkspace()
    window.addEventListener('hashchange', scrollToWorkspace)

    return () => window.removeEventListener('hashchange', scrollToWorkspace)
  }, [])

  useEffect(() => {
    if (!canEdit || slugLocked) {
      setSlugStatus('current')
      setSlugMessage(slugLocked ? 'This workspace URL cannot be changed' : 'This is your current site URL')

      return
    }

    if (!slugChanged) {
      setSlugStatus('current')
      setSlugMessage('This is your current site URL')

      return
    }

    const parsed = tenantSlugSchema.safeParse(normalizedSlug)

    if (!parsed.success) {
      setSlugStatus('invalid')
      setSlugMessage(parsed.error.issues[0]?.message ?? 'Enter a valid site URL')

      return
    }

    let cancelled = false

    setSlugStatus('checking')
    setSlugMessage('Checking availability…')

    const timer = window.setTimeout(() => {
      void checkTenantSlugAvailabilityAction(parsed.data).then(result => {
        if (cancelled) {
          return
        }

        if (!result.success) {
          setSlugStatus('invalid')
          setSlugMessage(result.error)

          return
        }

        const { availability } = result

        if (availability.reason === 'current') {
          setSlugStatus('current')
          setSlugMessage('This is your current site URL')

          return
        }

        if (availability.available) {
          setSlugStatus('available')
          setSlugMessage('This URL is available')

          return
        }

        if (availability.reason === 'reserved') {
          setSlugStatus('reserved')
          setSlugMessage('This URL is reserved')

          return
        }

        if (availability.reason === 'taken') {
          setSlugStatus('taken')
          setSlugMessage('This URL is already taken')

          return
        }

        setSlugStatus('invalid')
        setSlugMessage('Enter a valid site URL')
      })
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canEdit, normalizedSlug, slugChanged, slugLocked])

  const persistProfile = () => {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      const previousSlug = savedProfile.slug

      const result = await updateTenantProfileAction({
        companyName: companyName.trim(),
        slug: normalizedSlug,
        logoUrl,
        defaultTimezone: localeTouched ? defaultTimezone : savedProfile.defaultTimezone,
        defaultCurrency: localeTouched ? defaultCurrency : savedProfile.defaultCurrency,
        ...(location ? { location } : {})
      })

      if (!result.success) {
        setError(result.error)

        return
      }

      migrateLocalTenantSlug(previousSlug, result.profile.slug)
      setSavedProfile(result.profile)
      setCompanyName(result.profile.companyName)
      setSlug(result.profile.slug)
      setLogoUrl(result.profile.logoUrl)
      setDefaultTimezone(result.profile.defaultTimezone || getBrowserTimeZone())
      setDefaultCurrency(
        result.profile.defaultCurrency ||
          inferCurrencyFromTimeZone(result.profile.defaultTimezone || getBrowserTimeZone())
      )
      setLocationAddress(result.profile.location?.address ?? '')
      setLocationLatitude(result.profile.location?.latitude ?? null)
      setLocationLongitude(result.profile.location?.longitude ?? null)
      setLocationContext(result.profile.location?.context ?? null)
      setLocaleTouched(false)
      setConfirmOpen(false)
      setMessage('Profile updated')
      await update({
        tenantSlug: result.profile.slug,
        tenantName: result.profile.companyName
      })
      router.refresh()
    })
  }

  const searchLocation = async () => {
    const query = locationAddress.trim()

    if (!query) {
      setLocationError('Enter an address to search for.')

      return
    }

    setLocationError(null)
    setIsGeocoding(true)

    try {
      const searchParams = new URLSearchParams({ q: query })

      const contextPoint =
        browserLocation ??
        (savedProfile.location
          ? { latitude: savedProfile.location.latitude, longitude: savedProfile.location.longitude }
          : null)

      const searchContext = browserLocationContext ?? locationContext

      if (contextPoint) {
        searchParams.set('contextLat', String(contextPoint.latitude))
        searchParams.set('contextLon', String(contextPoint.longitude))
      }

      if (searchContext?.countryCode) {
        searchParams.set('countryCode', searchContext.countryCode)
      }

      if (searchContext?.place) {
        searchParams.set('place', searchContext.place)
      }

      if (searchContext?.region) {
        searchParams.set('region', searchContext.region)
      }

      const response = await fetch(`/api/location/geocode?${searchParams.toString()}`)
      const result = await readJson<GeocodeResponse>(response)

      if (!response.ok || !result?.location || !isGeocodeLocation(result.location)) {
        throw new Error(result?.error ?? 'No matching address was found.')
      }

      setLocationAddress(result.location.address)
      setLocationLatitude(result.location.latitude)
      setLocationLongitude(result.location.longitude)
      setLocationContext(result.location.context ?? null)
      setLocationSuggestions(
        (Array.isArray(result.locations) ? result.locations : []).filter(isGeocodeLocation).slice(1)
      )
    } catch (geocodeError) {
      setLocationError(geocodeError instanceof Error ? geocodeError.message : 'Could not find that address.')
      setLocationSuggestions([])
    } finally {
      setIsGeocoding(false)
    }
  }

  const selectMapLocation = async (point: { latitude: number; longitude: number }) => {
    setLocationLatitude(point.latitude)
    setLocationLongitude(point.longitude)
    setLocationContext(null)
    setLocationError(null)
    setLocationSuggestions([])
    setIsGeocoding(true)

    try {
      const response = await fetch(`/api/location/geocode?lat=${point.latitude}&lon=${point.longitude}`)
      const result = await readJson<GeocodeResponse>(response)

      if (!response.ok || !result?.location || !isGeocodeLocation(result.location)) {
        throw new Error(result?.error ?? 'The address could not be loaded.')
      }

      setLocationAddress(result.location.address)
      setLocationContext(result.location.context ?? null)
      setLocationError(null)
      setLocationNotice(null)
    } catch (mapError) {
      setLocationAddress(`Selected location (${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)})`)
      setLocationNotice(
        `${mapError instanceof Error ? mapError.message : 'The address could not be loaded.'} The pin is still selected.`
      )
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSave = () => {
    if (!canSave) {
      return
    }

    if (slugChanged) {
      setConfirmOpen(true)

      return
    }

    persistProfile()
  }

  const uploadLogo = async (file: File) => {
    if (!imageKitReady) {
      setError('Image uploads are not configured yet.')

      return
    }

    setUploadingLogo(true)
    setError(null)
    setMessage(null)

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('mediaType', 'image')

      const response = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const payload = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? 'Could not upload the logo.')
      }

      setLogoUrl(payload.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 2.75, md: 4 },
          py: { xs: 3, md: 3.5 },
          color: 'common.white',
          background: `linear-gradient(118deg, #5B21B6 0%, ${theme.palette.primary.main} 58%, #818CF8 100%)`,
          boxShadow: `0 18px 40px ${alpha('#6D28D9', 0.24)}`
        }}
      >
        <Chip
          label={savedProfile.companyName}
          size='small'
          sx={{
            mb: 1.5,
            bgcolor: alpha('#fff', 0.16),
            color: 'common.white',
            border: `1px solid ${alpha('#fff', 0.32)}`,
            fontWeight: 600
          }}
        />
        <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 0.75 }}>
          My profile
        </Typography>
        <Typography sx={{ color: alpha('#fff', 0.9), maxWidth: 560, mb: 2 }}>
          Account details for {userName}, plus the company name, logo, and public site URL used across your workspace.
        </Typography>
        {liveSitePath ? (
          <Button
            component={Link}
            href={liveSitePath}
            target='_blank'
            variant='outlined'
            startIcon={<i className='ri-external-link-line' />}
            sx={{
              borderColor: alpha('#fff', 0.5),
              color: 'common.white',
              '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.12) }
            }}
          >
            View live site
          </Button>
        ) : null}
      </Box>

      {error ? <Alert severity='error'>{error}</Alert> : null}
      {message ? (
        <Alert severity='success' onClose={() => setMessage(null)}>
          {message}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.9fr) minmax(0, 1.2fr)' }
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Account
          </Typography>
          <Box className='flex items-center gap-3'>
            <Avatar alt={userName} src={userImage} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{userName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {userEmail}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
            <MetaItem label='Role' value={formatRole(userRole)} />
            <MetaItem label='Plan' value={formatRole(savedProfile.plan)} />
            <MetaItem label='Workspace status' value={formatRole(savedProfile.status)} />
            <MetaItem label='Workspace created' value={formatDate(savedProfile.createdAt)} />
          </Box>
          <Typography variant='caption' color='text.secondary'>
            Signed in with Google. Name, email, and photo come from your Google account.
          </Typography>
        </Box>

        <Box
          id='workspace'
          sx={{
            borderRadius: 3,
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            scrollMarginTop: 88
          }}
        >
          <Box className='flex items-center justify-between gap-2 flex-wrap'>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              Company settings
            </Typography>
            <Chip label={canEdit ? 'Editable' : 'View only'} size='small' variant='tonal' color='primary' />
          </Box>

          <TextField
            label='Company name'
            value={companyName}
            onChange={event => setCompanyName(event.target.value)}
            disabled={!canEdit || isPending}
            fullWidth
            helperText='Shown on your website header, footer, and workspace.'
          />

          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
              Company logo
            </Typography>
            <Box className='flex items-center gap-3 flex-wrap'>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  bgcolor: alpha(theme.palette.text.primary, 0.03)
                }}
              >
                {logoPreview ? (
                  <Box
                    component='img'
                    src={logoPreview}
                    alt='Company logo'
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: 1 }}
                  />
                ) : (
                  <i className='ri-image-line' style={{ fontSize: '1.6rem', opacity: 0.45 }} />
                )}
              </Box>
              <Box className='flex flex-col gap-1.5'>
                <Box className='flex gap-1.5 flex-wrap'>
                  <Button
                    component='label'
                    variant='outlined'
                    disabled={!canEdit || uploadingLogo || isPending}
                    startIcon={uploadingLogo ? <CircularProgress size={14} /> : <i className='ri-upload-2-line' />}
                  >
                    {uploadingLogo ? 'Uploading…' : logoUrl ? 'Replace logo' : 'Upload logo'}
                    <input
                      hidden
                      type='file'
                      accept='image/png,image/jpeg,image/webp,image/gif'
                      onChange={event => {
                        const file = event.target.files?.[0]

                        if (file) {
                          void uploadLogo(file)
                        }

                        event.target.value = ''
                      }}
                    />
                  </Button>
                  {logoUrl ? (
                    <Button color='inherit' disabled={!canEdit || isPending} onClick={() => setLogoUrl('')}>
                      Remove
                    </Button>
                  ) : null}
                </Box>
                <Typography variant='caption' color='text.secondary'>
                  Used in your site header and footer. PNG, JPEG, or WebP with a transparent background works best.
                </Typography>
              </Box>
            </Box>
          </Box>

          <TextField
            label='Site URL'
            value={slug}
            onChange={event => setSlug(sanitizeSlugInput(event.target.value))}
            onBlur={() => setSlug(slugify(slug))}
            disabled={!canEdit || slugLocked || isPending}
            error={slugChanged && (slugStatus === 'taken' || slugStatus === 'reserved' || slugStatus === 'invalid')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Typography variant='body2' color='text.secondary' noWrap sx={{ maxWidth: { xs: 120, sm: 220 } }}>
                      {siteUrlPrefix}
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    {slugStatus === 'checking' ? (
                      <CircularProgress size={16} />
                    ) : slugStatus === 'available' || slugStatus === 'current' ? (
                      <i className='ri-checkbox-circle-line' style={{ color: theme.palette.success.main }} />
                    ) : slugChanged ? (
                      <i className='ri-error-warning-line' style={{ color: theme.palette.error.main }} />
                    ) : null}
                  </InputAdornment>
                )
              }
            }}
            helperText={
              <Box component='span' sx={{ color: slugHelperColor }}>
                {slugMessage}. Preview: {livePreviewUrl}
              </Box>
            }
          />

          <Box>
            <Box className='flex items-center justify-between gap-2 flex-wrap' sx={{ mb: 0.75 }}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                  Business location
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Set the address shown in your site&apos;s Where are we section.
                </Typography>
              </Box>
              {location || locationAddress || locationLatitude !== null ? (
                <Button
                  size='small'
                  color='inherit'
                  disabled={!canEdit || isPending || isGeocoding}
                  onClick={() => {
                    setLocationAddress('')
                    setLocationLatitude(null)
                    setLocationLongitude(null)
                    setLocationContext(null)
                    setLocationError(null)
                    setLocationSuggestions([])
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.5 }}>
              <TextField
                label='Address'
                value={locationAddress}
                onChange={event => {
                  setLocationAddress(event.target.value)
                  setLocationLatitude(null)
                  setLocationLongitude(null)
                  setLocationContext(null)
                  setLocationError(null)
                  setLocationSuggestions([])
                }}
                disabled={!canEdit || isPending || isGeocoding}
                fullWidth
                multiline
                minRows={2}
                error={locationIncomplete}
                helperText={
                  locationIncomplete
                    ? 'Search this address or select a point on the map.'
                    : 'Enter an address, then search to place it on the map.'
                }
              />
              <Button
                variant='outlined'
                onClick={() => void searchLocation()}
                disabled={!canEdit || isPending || isGeocoding || !locationAddress.trim()}
                sx={{ minWidth: 96, mt: 0.5 }}
              >
                {isGeocoding ? <CircularProgress size={18} /> : 'Find'}
              </Button>
            </Box>
            {locationError ? (
              <Alert severity='error' sx={{ mb: 1.5 }}>
                {locationError}
              </Alert>
            ) : null}
            {locationSuggestions.length ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Other nearby matches
                </Typography>
                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  {locationSuggestions.map(suggestion => (
                    <Button
                      key={`${suggestion.latitude}:${suggestion.longitude}`}
                      variant='text'
                      color='inherit'
                      onClick={() => {
                        setLocationAddress(suggestion.address)
                        setLocationLatitude(suggestion.latitude)
                        setLocationLongitude(suggestion.longitude)
                        setLocationContext(suggestion.context ?? null)
                        setLocationSuggestions([])
                        setLocationError(null)
                        setLocationNotice(null)
                      }}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
                    >
                      {suggestion.address}
                    </Button>
                  ))}
                </Box>
              </Box>
            ) : null}
            <LocationMap
              latitude={
                locationLatitude !== null && locationLongitude !== null
                  ? locationLatitude
                  : (browserLocation?.latitude ?? null)
              }
              longitude={
                locationLatitude !== null && locationLongitude !== null
                  ? locationLongitude
                  : (browserLocation?.longitude ?? null)
              }
              interactive={canEdit && !isPending && !isGeocoding}
              onChange={point => void selectMapLocation(point)}
              height={240}
            />
            {locationNotice ? (
              <Alert severity='info' sx={{ mt: 1.5 }}>
                {locationNotice}
              </Alert>
            ) : null}
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.75 }}>
              {locationLatitude !== null && locationLongitude !== null
                ? `Pin: ${locationLatitude.toFixed(5)}, ${locationLongitude.toFixed(5)}`
                : browserLocation
                  ? `Current browser location: ${browserLocation.latitude.toFixed(5)}, ${browserLocation.longitude.toFixed(5)}`
                  : 'No location selected yet.'}
            </Typography>
          </Box>

          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.75 }}>
              Booking defaults
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              These defaults are used when creating new services. Leave them unset to detect the owner&apos;s location
              automatically.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
              }}
            >
              <TextField
                select
                label='Default timezone'
                value={defaultTimezone}
                disabled={!canEdit || isPending}
                onChange={event => {
                  setLocaleTouched(true)
                  setDefaultTimezone(event.target.value)
                }}
                helperText='Used for new service schedules'
              >
                {SERVICE_TIMEZONE_OPTIONS.map(timezone => (
                  <MenuItem key={timezone} value={timezone}>
                    {timezone.replaceAll('_', ' ')}
                  </MenuItem>
                ))}
                {!SERVICE_TIMEZONE_OPTIONS.includes(defaultTimezone as (typeof SERVICE_TIMEZONE_OPTIONS)[number]) ? (
                  <MenuItem value={defaultTimezone}>{defaultTimezone}</MenuItem>
                ) : null}
              </TextField>
              <TextField
                select
                label='Default currency'
                value={defaultCurrency}
                disabled={!canEdit || isPending}
                onChange={event => {
                  setLocaleTouched(true)
                  setDefaultCurrency(event.target.value)
                }}
                helperText='Used for new service prices'
              >
                {SERVICE_CURRENCY_OPTIONS.map(option => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.label}
                  </MenuItem>
                ))}
                {!SERVICE_CURRENCY_OPTIONS.some(option => option.code === defaultCurrency) ? (
                  <MenuItem value={defaultCurrency}>{defaultCurrency}</MenuItem>
                ) : null}
              </TextField>
            </Box>
          </Box>

          <Box className='flex items-center justify-end gap-2'>
            <Button
              variant='contained'
              disabled={!canSave}
              onClick={handleSave}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : <i className='ri-save-line' />}
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => !isPending && setConfirmOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Change your public site URL?</DialogTitle>
        <DialogContent className='flex flex-col gap-2'>
          <Alert severity='warning' variant='outlined'>
            Visitors using the old link will no longer reach your site. Internal page links will be updated to the new
            URL.
          </Alert>
          <Typography variant='body2' color='text.secondary'>
            From{' '}
            <strong>
              {siteUrlPrefix}
              {savedProfile.slug}
            </strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            To <strong>{livePreviewUrl}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant='contained' color='warning' onClick={persistProfile} disabled={isPending}>
            {isPending ? 'Updating…' : 'Update URL'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap title={value}>
        {value}
      </Typography>
    </Box>
  )
}
