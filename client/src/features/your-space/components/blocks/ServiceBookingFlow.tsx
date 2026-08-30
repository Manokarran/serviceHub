'use client'

import { useEffect, useMemo, useState } from 'react'

import { signIn, useSession } from 'next-auth/react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { PublicService, PublicSlot, PublicTermBatch } from '@/services/booking/public-service.service'
import { getCalendarDateInZone, toIsoDate } from '@/lib/utils/timezone'
import { WEEKDAY_LABELS } from '@/lib/constants/service'
import { formatClock, formatDateTime, formatDuration, formatMoney, formatPrice } from '@/features/services/utils/format'
import { getSiteButtonSx } from '../../utils/siteStylesHelpers'
import { useSiteStyles } from '../SiteStylesScope'

import { ServiceInfo } from './ServiceInfo'

type Props = {
  tenantSlug: string
  serviceSlug?: string
  initialService?: PublicService | null
  title?: string
  subtitle?: string
  showServiceSummary?: boolean
  showTimezone?: boolean
  compact?: boolean
  ctaLabel?: string
  onChangeService?: () => void
}

type PendingBooking = {
  tenantSlug: string
  serviceSlug: string
  slotId?: string
  batchId?: string
  name: string
  phone: string
  quantity: number
  holdToken?: string
}

function formatSelectedDate(dateKey: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone
  }).format(new Date(`${dateKey}T12:00:00`))
}

function formatMobileCalendarDate(dateKey: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone
  }).format(new Date(`${dateKey}T12:00:00`))
}

export function ServiceBookingFlow({
  tenantSlug,
  serviceSlug,
  initialService = null,
  title = 'Choose a time',
  subtitle = 'Select an available time that works for you.',
  showServiceSummary = true,
  showTimezone = true,
  compact = false,
  ctaLabel = 'Continue booking',
  onChangeService
}: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()

  const siteButtonSx = (role: 'primary' | 'secondary' | 'tertiary') =>
    getSiteButtonSx(role, siteStyles) as Record<string, unknown>

  const { data: session, status: sessionStatus } = useSession()
  const [service, setService] = useState<PublicService | null>(initialService)
  const [availableServices, setAvailableServices] = useState<PublicService[]>([])
  const [serviceQuery, setServiceQuery] = useState('')
  const [selectedServiceSlug, setSelectedServiceSlug] = useState(serviceSlug ?? initialService?.slug ?? '')
  const [slots, setSlots] = useState<PublicSlot[]>([])
  const [batches, setBatches] = useState<PublicTermBatch[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const [monthCursor, setMonthCursor] = useState(() => {
    const today = getCalendarDateInZone(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')

    return new Date(Date.UTC(today.year, today.month - 1, 1))
  })

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [name, setName] = useState(session?.user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [holdToken, setHoldToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialService)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [booking, setBooking] = useState<{
    confirmationCode: string
    status: string
    startAt: string
    timezone: string
    customerEmail: string
    termOccurrenceCount?: number
  } | null>(null)

  const [waitlistJoined, setWaitlistJoined] = useState(false)

  const visitorTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  useEffect(() => {
    if (session?.user?.name && !name) {
      setName(session.user.name)
    }
  }, [name, session?.user?.name])

  useEffect(() => {
    setSelectedServiceSlug(serviceSlug ?? initialService?.slug ?? '')
  }, [initialService?.slug, serviceSlug])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        let nextService = initialService?.slug === selectedServiceSlug ? initialService : null

        if (!nextService && selectedServiceSlug) {
          const detailResponse = await fetch(
            `/api/public/services/${encodeURIComponent(selectedServiceSlug)}?tenantSlug=${encodeURIComponent(
              tenantSlug
            )}`
          )

          const detail = (await detailResponse.json()) as { service?: PublicService; error?: string }

          if (!detailResponse.ok || !detail.service) {
            throw new Error(detail.error || 'Service is not available')
          }

          nextService = detail.service
        }

        if (!nextService) {
          const servicesResponse = await fetch(`/api/public/services?tenantSlug=${encodeURIComponent(tenantSlug)}`)

          const servicesResult = (await servicesResponse.json()) as {
            services?: PublicService[]
            error?: string
          }

          if (!servicesResponse.ok) {
            throw new Error(servicesResult.error || 'Unable to load services')
          }

          if (active) {
            setService(null)
            setAvailableServices(servicesResult.services ?? [])
          }

          return
        }

        const from = new Date()

        const to =
          nextService.purchaseMode === 'term' && nextService.scheduleEndDate
            ? new Date(new Date(`${nextService.scheduleEndDate}T23:59:59.999Z`).getTime() + 24 * 60 * 60 * 1000)
            : new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000)

        const availabilityResponse = await fetch(
          `/api/public/services/${encodeURIComponent(nextService.slug)}/availability?tenantSlug=${encodeURIComponent(
            tenantSlug
          )}&from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`
        )

        const availability = (await availabilityResponse.json()) as {
          slots?: PublicSlot[]
          batches?: PublicTermBatch[]
          error?: string
        }

        if (!availabilityResponse.ok) {
          throw new Error(availability.error || 'Availability is unavailable')
        }

        if (active) {
          const nextSlots = availability.slots ?? []
          const nextBatches = availability.batches ?? []

          const firstSlotDate = nextSlots[0]
            ? getCalendarDateInZone(new Date(nextSlots[0].startAt), visitorTimezone)
            : null

          setService(nextService)
          setAvailableServices([])
          setSlots(nextSlots)
          setBatches(nextBatches)

          if (nextService.purchaseMode === 'term') {
            const firstAvailableBatch = nextBatches.find(
              batch => batch.occurrenceCount > 0 && batch.availableOccurrences === batch.occurrenceCount
            )

            setSelectedBatchId(firstAvailableBatch?.id ?? nextBatches[0]?.id ?? null)
          }

          if (firstSlotDate) {
            setSelectedDate(toIsoDate(firstSlotDate))
            setMonthCursor(new Date(Date.UTC(firstSlotDate.year, firstSlotDate.month - 1, 1)))
          }
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load booking times')
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
  }, [initialService, selectedServiceSlug, tenantSlug, visitorTimezone])

  useEffect(() => {
    const pending = sessionStorage.getItem('servicehub-pending-booking')

    if (!pending) {
      return
    }

    try {
      const value = JSON.parse(pending) as PendingBooking

      if (value.tenantSlug === tenantSlug && value.serviceSlug === service?.slug) {
        setSelectedSlotId(value.slotId ?? null)
        setSelectedBatchId(value.batchId ?? null)
        setName(value.name)
        setPhone(value.phone)
        setQuantity(value.quantity || 1)
        setHoldToken(value.holdToken ?? null)
        sessionStorage.removeItem('servicehub-pending-booking')
      }
    } catch {
      sessionStorage.removeItem('servicehub-pending-booking')
    }
  }, [service?.slug, tenantSlug])

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, PublicSlot[]>()

    for (const slot of slots) {
      const date = toIsoDate(getCalendarDateInZone(new Date(slot.startAt), visitorTimezone))

      grouped.set(date, [...(grouped.get(date) ?? []), slot])
    }

    return grouped
  }, [slots, visitorTimezone])

  const dates = [...slotsByDate.keys()].sort()
  const activeDate = selectedDate ?? dates[0] ?? null
  const selectedSlot = slots.find(slot => slot.id === selectedSlotId) ?? null
  const selectedBatch = batches.find(batch => batch.id === selectedBatchId) ?? null
  const isTermService = service?.purchaseMode === 'term'

  const selectableServices = useMemo(() => {
    const normalizedQuery = serviceQuery.trim().toLowerCase()

    return availableServices.filter(item => {
      if (!normalizedQuery) {
        return true
      }

      return `${item.name} ${item.tagline} ${item.description} ${item.category} ${item.tags.join(' ')}`
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [availableServices, serviceQuery])

  const todayKey = toIsoDate(getCalendarDateInZone(new Date(), visitorTimezone))

  const lastAvailabilityKey = toIsoDate(
    getCalendarDateInZone(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), visitorTimezone)
  )

  const calendarCells = useMemo(() => {
    const year = monthCursor.getUTCFullYear()
    const month = monthCursor.getUTCMonth()
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const firstDayMondayIndex = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
    const cells: Array<number | null> = Array.from({ length: firstDayMondayIndex }, () => null)

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day)
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    return cells
  }, [monthCursor])

  const mobileCalendarDays = useMemo(() => {
    const year = monthCursor.getUTCFullYear()
    const month = monthCursor.getUTCMonth() + 1

    return calendarCells.flatMap(day => {
      if (day === null) {
        return []
      }

      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const daySlots = slotsByDate.get(dateKey) ?? []

      if (daySlots.length === 0) {
        return []
      }

      const available = daySlots.reduce((total, slot) => total + slot.seatsAvailable, 0)
      const booked = daySlots.reduce((total, slot) => total + slot.capacity - slot.seatsAvailable, 0)

      const isSelectable = dateKey >= todayKey && dateKey <= lastAvailabilityKey

      return [{ dateKey, daySlots, available, booked, isSelectable }]
    })
  }, [calendarCells, lastAvailabilityKey, monthCursor, slotsByDate, todayKey])

  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    monthCursor
  )

  const currentMonth = new Date(`${todayKey.slice(0, 7)}-01T00:00:00Z`)
  const lastAvailabilityMonth = new Date(`${lastAvailabilityKey.slice(0, 7)}-01T00:00:00Z`)

  const isCustomerForTenant = session?.user?.context === 'customer' && session.user.tenantSlug === tenantSlug
  const canChangeService = Boolean(onChangeService) || (!initialService && !serviceSlug)

  const changeService = () => {
    setService(null)
    setSelectedServiceSlug('')
    setSelectedSlotId(null)
    setSelectedBatchId(null)
    setHoldToken(null)
    setBooking(null)
    setWaitlistJoined(false)
    setError(null)
    onChangeService?.()
  }

  useEffect(() => {
    if (isCustomerForTenant) {
      void fetch('/api/public/booking/context', { method: 'DELETE' })
    }
  }, [isCustomerForTenant])

  useEffect(() => {
    if (selectedSlot && quantity > selectedSlot.seatsAvailable) {
      setQuantity(1)
    }

    if (selectedBatch && quantity > selectedBatch.minimumSeatsAvailable) {
      setQuantity(1)
    }
  }, [quantity, selectedBatch, selectedSlot])

  const startBooking = async () => {
    if (!service || (!selectedSlot && !selectedBatch) || !name.trim() || !phone.trim()) {
      setError('Enter your name and phone number before continuing.')

      return
    }

    setError(null)

    if (isTermService && selectedBatch) {
      if (!isCustomerForTenant) {
        const pending: PendingBooking = {
          tenantSlug,
          serviceSlug: service.slug,
          batchId: selectedBatch.id,
          name: name.trim(),
          phone: phone.trim(),
          quantity
        }

        sessionStorage.setItem('servicehub-pending-booking', JSON.stringify(pending))

        const contextResponse = await fetch('/api/public/booking/context', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ tenantSlug })
        })

        if (!contextResponse.ok) {
          setError('Unable to start Google sign-in. Please try again.')

          return
        }

        await signIn('google', { callbackUrl: window.location.href })

        return
      }

      setSubmitting(true)

      try {
        const response = await fetch('/api/public/bookings', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            tenantSlug,
            serviceSlug: service.slug,
            batchId: selectedBatch.id,
            quantity,
            name: name.trim(),
            phone: phone.trim(),
            idempotencyKey: crypto.randomUUID()
          })
        })

        const result = (await response.json()) as {
          booking?: {
            confirmationCode: string
            status: string
            startAt: string
            timezone: string
            customerEmail: string
          }
          termOccurrenceCount?: number
          error?: string
        }

        if (!response.ok || !result.booking) {
          throw new Error(result.error || 'Unable to complete term enrolment')
        }

        setBooking({
          ...result.booking,
          termOccurrenceCount: result.termOccurrenceCount,
          customerEmail: result.booking.customerEmail || session?.user?.email || ''
        })
      } catch (bookingError) {
        setError(bookingError instanceof Error ? bookingError.message : 'Unable to complete term enrolment')
      } finally {
        setSubmitting(false)
      }

      return
    }

    if (!selectedSlot) {
      return
    }

    const isWaitlistRequest = selectedSlot.seatsAvailable === 0 && service.waitlistEnabled
    let activeHoldToken = holdToken

    if (!isWaitlistRequest && !activeHoldToken) {
      const holdResponse = await fetch('/api/public/booking-holds', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          serviceSlug: service.slug,
          slotId: selectedSlot.id,
          quantity
        })
      })

      const holdResult = (await holdResponse.json()) as { holdToken?: string; error?: string }

      if (!holdResponse.ok || !holdResult.holdToken) {
        setError(holdResult.error || 'This time is no longer available.')

        return
      }

      activeHoldToken = holdResult.holdToken
      setHoldToken(activeHoldToken)
    }

    if (!isCustomerForTenant) {
      const pending: PendingBooking = {
        tenantSlug,
        serviceSlug: service.slug,
        slotId: selectedSlot.id,
        name: name.trim(),
        phone: phone.trim(),
        quantity,
        holdToken: activeHoldToken ?? undefined
      }

      sessionStorage.setItem('servicehub-pending-booking', JSON.stringify(pending))

      const contextResponse = await fetch('/api/public/booking/context', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tenantSlug })
      })

      if (!contextResponse.ok) {
        setError('Unable to start Google sign-in. Please try again.')

        return
      }

      await signIn('google', { callbackUrl: window.location.href })

      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(isWaitlistRequest ? '/api/public/waitlist' : '/api/public/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          serviceSlug: service.slug,
          slotId: selectedSlot.id,
          quantity,
          name: name.trim(),
          phone: phone.trim(),
          idempotencyKey: crypto.randomUUID(),
          holdToken: activeHoldToken ?? undefined
        })
      })

      const result = (await response.json()) as {
        booking?: {
          confirmationCode: string
          status: string
          startAt: string
          timezone: string
          customerEmail: string
        }
        error?: string
      }

      if (!response.ok || !result.booking) {
        if (isWaitlistRequest) {
          const waitlistResult = result as { success?: boolean; error?: string }

          if (!waitlistResult.success) {
            throw new Error(waitlistResult.error || 'Unable to join the waitlist')
          }

          setWaitlistJoined(true)

          return
        }

        throw new Error(result.error || 'Unable to complete booking')
      }

      setBooking({
        ...result.booking,
        customerEmail: result.booking.customerEmail || session?.user?.email || ''
      })
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : 'Unable to complete booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Stack alignItems='center' spacing={2} sx={{ py: 8 }}>
        <CircularProgress size={28} />
        <Typography color='text.secondary'>Finding available times…</Typography>
      </Stack>
    )
  }

  if (waitlistJoined && service) {
    return (
      <Alert severity='success'>
        You’re on the waitlist for {service.name}. We’ll contact you if a place becomes available.
      </Alert>
    )
  }

  if (booking && service) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Stack spacing={2.5} alignItems='flex-start'>
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                color: 'success.main',
                bgcolor: alpha(theme.palette.success.main, 0.12)
              }}
            >
              <i className='ri-check-line' style={{ fontSize: 24 }} />
            </Box>
            <Typography variant='h5'>
              {booking.termOccurrenceCount
                ? booking.status === 'pending'
                  ? 'Term enrolment request received'
                  : 'Term enrolment confirmed'
                : booking.status === 'pending'
                  ? 'Booking request received'
                  : 'Booking confirmed'}
            </Typography>
            <Typography color='text.secondary'>
              {booking.termOccurrenceCount
                ? booking.status === 'pending'
                  ? `The admin will review your request for all ${booking.termOccurrenceCount} classes and confirm it soon.`
                  : `You are booked into all ${booking.termOccurrenceCount} classes in this term.`
                : booking.status === 'pending'
                  ? 'The admin will review your request and confirm it soon.'
                  : 'Your time is confirmed.'}
            </Typography>
            <Divider flexItem />
            <Typography variant='body2'>
              <strong>{service.name}</strong>
              <br />
              {booking.termOccurrenceCount
                ? `${booking.termOccurrenceCount} classes · starting ${formatDateTime(booking.startAt, visitorTimezone)}`
                : formatDateTime(booking.startAt, visitorTimezone)}
              {showTimezone && booking.timezone !== visitorTimezone ? ` · Business time: ${booking.timezone}` : ''}
            </Typography>
            <Typography variant='subtitle2'>Reference: {booking.confirmationCode}</Typography>
            {booking.customerEmail ? (
              <Typography variant='body2' color='text.secondary'>
                {booking.status === 'pending' ? 'Updates will be sent to' : 'Confirmation sent to'}{' '}
                {booking.customerEmail}
              </Typography>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                The admin will confirm your booking soon. Sign in with Google again if you do not receive an email.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  if (!service) {
    return (
      <Stack spacing={2.5}>
        <Box>
          <Typography variant={compact ? 'h6' : 'h4'}>
            {title === 'Choose a time' ? 'Choose a service' : title}
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 0.75 }}>
            Search for a service to see its available booking times.
          </Typography>
        </Box>
        {error ? <Alert severity='error'>{error}</Alert> : null}
        <TextField
          value={serviceQuery}
          onChange={event => setServiceQuery(event.target.value)}
          placeholder='Search services'
          label='Search services'
          size='small'
          fullWidth
          InputProps={{
            startAdornment: (
              <Box component='span' sx={{ display: 'inline-flex', mr: 1, color: 'text.secondary' }}>
                <i className='ri-search-line' />
              </Box>
            )
          }}
        />
        {selectableServices.length > 0 ? (
          <Stack spacing={1}>
            {selectableServices.map(item => (
              <Card
                key={item.id}
                component='button'
                type='button'
                variant='outlined'
                onClick={() => {
                  setSelectedServiceSlug(item.slug)
                  setServiceQuery('')
                  setSelectedSlotId(null)
                  setSelectedBatchId(null)
                  setHoldToken(null)
                  setError(null)
                }}
                sx={{
                  display: 'flex',
                  width: '100%',
                  p: 1.25,
                  textAlign: 'left',
                  color: siteStyles.colors.text,
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${alpha(siteStyles.colors.background, 0.68)} 0%, ${alpha(siteStyles.colors.accent, 0.1)} 100%)`,
                  backdropFilter: 'blur(14px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(14px) saturate(120%)',
                  borderColor: alpha(siteStyles.colors.text, 0.14),
                  boxShadow: `0 8px 22px ${alpha(siteStyles.colors.text, 0.08)}`,
                  transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: siteStyles.colors.accent,
                    boxShadow: `0 14px 30px ${alpha(siteStyles.colors.accent, 0.2)}`
                  },
                  '&:focus-visible': {
                    outline: `3px solid ${alpha(siteStyles.colors.accent, 0.35)}`,
                    outlineOffset: 2
                  }
                }}
              >
                <Box
                  sx={{
                    width: { xs: 58, sm: 72 },
                    height: { xs: 58, sm: 72 },
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    borderRadius: 2,
                    bgcolor: alpha(siteStyles.colors.accent, 0.12),
                    color: siteStyles.colors.accent
                  }}
                >
                  {item.coverImageUrl ? (
                    <Box
                      component='img'
                      src={item.coverImageUrl}
                      alt=''
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <i className='ri-calendar-check-line' style={{ fontSize: 26 }} />
                  )}
                </Box>
                <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1, px: 1.25, py: 0.25 }}>
                  <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
                    <Typography variant='subtitle1' noWrap sx={{ fontWeight: 750 }}>
                      {item.name}
                    </Typography>
                    <i className='ri-arrow-right-line' style={{ flexShrink: 0, fontSize: 18 }} />
                  </Stack>
                  {item.tagline || item.description ? (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2
                      }}
                    >
                      {item.tagline || item.description}
                    </Typography>
                  ) : null}
                  <Stack direction='row' spacing={0.75} useFlexGap flexWrap='wrap' sx={{ mt: 0.25 }}>
                    {item.category ? <Chip size='small' label={item.category} /> : null}
                    <Chip size='small' variant='outlined' label={formatDuration(item.durationMinutes)} />
                    <Chip
                      size='small'
                      variant='outlined'
                      label={
                        item.purchaseMode === 'term'
                          ? `${formatMoney(item.priceAmountMinor, item.currency)} / term`
                          : formatPrice(item.priceModel, item.priceAmountMinor, item.currency)
                      }
                    />
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Alert severity='info'>
            {availableServices.length > 0
              ? 'No services match your search.'
              : 'No published services are available for booking yet.'}
          </Alert>
        )}
      </Stack>
    )
  }

  const hasBookableSlot = isTermService
    ? batches.some(batch => batch.occurrenceCount > 0 && batch.availableOccurrences === batch.occurrenceCount)
    : slots.some(slot => slot.seatsAvailable > 0 || service.waitlistEnabled)

  const fullyBooked = slots.length > 0 && !hasBookableSlot
  const bookingButtonLabel = ctaLabel.trim().toLowerCase() === 'view times' ? 'Book this time' : ctaLabel

  const selectedCapacity = isTermService
    ? (selectedBatch?.minimumSeatsAvailable ?? 0)
    : (selectedSlot?.seatsAvailable ?? 0)

  const hasSelection = isTermService ? Boolean(selectedBatch) : Boolean(selectedSlot)

  return (
    <Stack spacing={compact ? 2 : 3}>
      {canChangeService && !showServiceSummary ? (
        <Button
          size='small'
          variant='text'
          startIcon={<i className='ri-arrow-left-line' />}
          onClick={changeService}
          sx={{ alignSelf: 'flex-start', ...getSiteButtonSx('tertiary', siteStyles) }}
        >
          Choose another service
        </Button>
      ) : null}
      {showServiceSummary ? (
        <Box>
          <Typography variant='overline' color='text.secondary'>
            {title}
          </Typography>
          {service.coverImageUrl ? (
            <Box
              component='img'
              src={service.coverImageUrl}
              alt=''
              sx={{
                display: 'block',
                width: '100%',
                maxHeight: { xs: 180, sm: 240 },
                objectFit: 'cover',
                borderRadius: 2,
                mt: 0.5,
                mb: 2
              }}
            />
          ) : null}
          <Typography variant={compact ? 'h5' : 'h3'} sx={{ fontWeight: 750 }}>
            {service.name}
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 0.75 }}>
            {service.tagline || subtitle}
          </Typography>
          {canChangeService ? (
            <Button
              size='small'
              variant='text'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={changeService}
              sx={{ alignSelf: 'flex-start', mt: 1, ...getSiteButtonSx('tertiary', siteStyles) }}
            >
              Choose another service
            </Button>
          ) : null}
          <Box sx={{ mt: 2.5 }}>
            <ServiceInfo service={service} compact={compact} />
          </Box>
        </Box>
      ) : null}

      {error ? <Alert severity='error'>{error}</Alert> : null}
      {sessionStatus === 'loading' ? <Alert severity='info'>Checking your booking account…</Alert> : null}

      {!hasBookableSlot ? (
        <Card
          variant='outlined'
          sx={{
            borderStyle: 'dashed',
            bgcolor: alpha(siteStyles.colors.accent, 0.03)
          }}
        >
          <CardContent>
            <Stack spacing={2} alignItems='center' sx={{ py: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  color: 'text.secondary',
                  bgcolor: alpha(theme.palette.text.primary, 0.08)
                }}
              >
                <i className='ri-calendar-close-line' style={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant='h6'>{fullyBooked ? 'Fully booked' : 'No upcoming sessions'}</Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.75, maxWidth: 420 }}>
                  {fullyBooked
                    ? 'All current seats have been reserved. Watch this space for the next opening.'
                    : 'There are no sessions open for booking right now. Watch this space for new dates.'}
                </Typography>
              </Box>
              {fullyBooked ? (
                <Button
                  disabled
                  variant='outlined'
                  startIcon={<i className='ri-lock-line' />}
                  sx={getSiteButtonSx('secondary', siteStyles)}
                >
                  Fully booked
                </Button>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          {isTermService ? (
            <Box>
              <Typography variant='subtitle2'>Choose your batch</Typography>
              <Typography variant='caption' color='text.secondary'>
                You will be enrolled in every class in the selected batch between {service.scheduleStartDate} and{' '}
                {service.scheduleEndDate}.
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {batches.map(batch => {
                  const isAvailable = batch.occurrenceCount > 0 && batch.availableOccurrences === batch.occurrenceCount

                  return (
                    <Button
                      key={batch.id}
                      variant={selectedBatchId === batch.id ? 'contained' : 'outlined'}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedBatchId(batch.id)
                        setQuantity(1)
                      }}
                      sx={[
                        siteButtonSx(selectedBatchId === batch.id ? 'primary' : 'secondary'),
                        { justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none', p: 2 }
                      ]}
                    >
                      <Stack spacing={0.25} sx={{ width: '100%' }}>
                        <Typography variant='subtitle2'>{batch.label}</Typography>
                        <Typography variant='body2'>
                          {batch.weekdays.map(day => WEEKDAY_LABELS[day]).join(' & ')} ·{' '}
                          {formatClock(
                            batch.slots[0]?.startAt ?? new Date().toISOString(),
                            batch.slots[0]?.timezone ?? service.timezone
                          )}
                        </Typography>
                        <Typography variant='caption' color={isAvailable ? 'success.main' : 'text.secondary'}>
                          {isAvailable
                            ? `${batch.occurrenceCount} classes · ${batch.minimumSeatsAvailable} seat${
                                batch.minimumSeatsAvailable === 1 ? '' : 's'
                              } available in every class`
                            : 'Not available for the whole term'}
                        </Typography>
                      </Stack>
                    </Button>
                  )
                })}
              </Stack>
            </Box>
          ) : (
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant='subtitle2'>Availability calendar</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    See sessions, available seats, and booked seats at a glance.
                  </Typography>
                </Box>
                <Stack direction='row' spacing={1} alignItems='center' sx={{ ml: { sm: 'auto' } }}>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => {
                      setMonthCursor(
                        previous => new Date(Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth() - 1, 1))
                      )
                      setSelectedDate(null)
                      setSelectedSlotId(null)
                      setHoldToken(null)
                    }}
                    disabled={monthCursor.getTime() <= currentMonth.getTime()}
                    sx={getSiteButtonSx('secondary', siteStyles)}
                  >
                    Previous
                  </Button>
                  <Typography variant='subtitle2' sx={{ minWidth: 132, textAlign: 'center' }}>
                    {monthLabel}
                  </Typography>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => {
                      setMonthCursor(
                        previous => new Date(Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth() + 1, 1))
                      )
                      setSelectedDate(null)
                      setSelectedSlotId(null)
                      setHoldToken(null)
                    }}
                    disabled={monthCursor.getTime() >= lastAvailabilityMonth.getTime()}
                    sx={getSiteButtonSx('secondary', siteStyles)}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
              <Box
                sx={{ display: { xs: 'none', sm: 'grid' }, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <Typography
                    key={day}
                    variant='caption'
                    color='text.secondary'
                    sx={{ textAlign: 'center', fontWeight: 700, py: 0.5 }}
                  >
                    {day}
                  </Typography>
                ))}
                {calendarCells.map((day, index) => {
                  const year = monthCursor.getUTCFullYear()
                  const month = monthCursor.getUTCMonth() + 1

                  const dateKey =
                    day === null ? null : `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

                  const daySlots = dateKey ? (slotsByDate.get(dateKey) ?? []) : []
                  const available = daySlots.reduce((total, slot) => total + slot.seatsAvailable, 0)
                  const booked = daySlots.reduce((total, slot) => total + slot.capacity - slot.seatsAvailable, 0)

                  const isSelectable =
                    Boolean(dateKey) && dateKey! >= todayKey && dateKey! <= lastAvailabilityKey && daySlots.length > 0

                  return (
                    <Button
                      key={dateKey ?? `empty-${index}`}
                      variant={activeDate === dateKey ? 'contained' : 'outlined'}
                      onClick={() => {
                        if (!dateKey) {
                          return
                        }

                        setSelectedDate(dateKey)
                        setSelectedSlotId(null)
                        setHoldToken(null)
                      }}
                      disabled={!isSelectable}
                      sx={[
                        siteButtonSx(activeDate === dateKey ? 'primary' : 'secondary'),
                        {
                          minHeight: { xs: 72, sm: 92 },
                          minWidth: 0,
                          p: 1,
                          alignItems: 'flex-start',
                          justifyContent: 'flex-start',
                          textTransform: 'none',
                          opacity: day === null || !isSelectable ? 0.5 : 1
                        }
                      ]}
                    >
                      <Stack spacing={0.25} sx={{ width: '100%', alignItems: 'flex-start' }}>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {day ?? ''}
                        </Typography>
                        {daySlots.length > 0 ? (
                          <>
                            <Typography variant='caption' noWrap>
                              {daySlots.length} {daySlots.length === 1 ? 'session' : 'sessions'}
                            </Typography>
                            <Typography variant='caption' color='success.main' noWrap>
                              {available} available
                            </Typography>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {booked} booked
                            </Typography>
                          </>
                        ) : null}
                      </Stack>
                    </Button>
                  )
                })}
              </Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {mobileCalendarDays.length > 0 ? (
                  <Stack spacing={1}>
                    {mobileCalendarDays.map(({ dateKey, daySlots, available, booked, isSelectable }) => (
                      <Button
                        key={dateKey}
                        variant={activeDate === dateKey ? 'contained' : 'outlined'}
                        onClick={() => {
                          setSelectedDate(dateKey)
                          setSelectedSlotId(null)
                          setHoldToken(null)
                        }}
                        disabled={!isSelectable}
                        aria-label={`${formatMobileCalendarDate(dateKey, visitorTimezone)}, ${daySlots.length} ${
                          daySlots.length === 1 ? 'session' : 'sessions'
                        }, ${available} available, ${booked} booked`}
                        sx={[
                          siteButtonSx(activeDate === dateKey ? 'primary' : 'secondary'),
                          {
                            minHeight: 72,
                            minWidth: 0,
                            p: 1.5,
                            alignItems: 'center',
                            justifyContent: 'stretch',
                            textTransform: 'none',
                            opacity: !isSelectable ? 0.5 : 1
                          }
                        ]}
                      >
                        <Stack
                          direction='row'
                          spacing={1.5}
                          alignItems='center'
                          justifyContent='space-between'
                          sx={{ width: '100%', minWidth: 0 }}
                        >
                          <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                            <Typography variant='subtitle2' noWrap>
                              {formatMobileCalendarDate(dateKey, visitorTimezone)}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {daySlots.length} {daySlots.length === 1 ? 'session' : 'sessions'}
                            </Typography>
                          </Box>
                          <Stack spacing={0.25} alignItems='flex-end' sx={{ flexShrink: 0 }}>
                            <Typography variant='caption' color='success.main' noWrap>
                              {available} available
                            </Typography>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {booked} booked
                            </Typography>
                          </Stack>
                        </Stack>
                      </Button>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity='info' sx={{ mt: 1 }}>
                    No sessions are scheduled this month. Try another month.
                  </Alert>
                )}
              </Box>
            </Box>
          )}
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'baseline' }}
              sx={{ mb: 1.25 }}
            >
              <Typography variant='subtitle2'>Available times</Typography>
              {activeDate ? (
                <Typography variant='caption' color='text.secondary'>
                  {formatSelectedDate(activeDate, visitorTimezone)}
                </Typography>
              ) : null}
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(190px, 1fr))' },
                gap: 1.5
              }}
            >
              {(slotsByDate.get(activeDate ?? '') ?? []).map(slot => (
                <Button
                  key={slot.id}
                  variant={selectedSlotId === slot.id ? 'contained' : 'outlined'}
                  disabled={slot.seatsAvailable === 0 && !service.waitlistEnabled}
                  onClick={() => {
                    setSelectedSlotId(slot.id)
                    setHoldToken(null)
                  }}
                  sx={[
                    siteButtonSx(selectedSlotId === slot.id ? 'primary' : 'secondary'),
                    {
                      minHeight: 78,
                      p: 1.5,
                      textAlign: 'left',
                      justifyContent: 'stretch',
                      textTransform: 'none'
                    }
                  ]}
                >
                  <Stack
                    direction='row'
                    spacing={2}
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ width: '100%', minWidth: 0 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant='h6' sx={{ lineHeight: 1.1 }}>
                        {formatClock(slot.startAt, visitorTimezone)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {formatDuration(service.durationMinutes)}
                      </Typography>
                    </Box>
                    <Stack spacing={0.25} alignItems='flex-end' sx={{ flexShrink: 0 }}>
                      <Typography variant='caption' color={slot.seatsAvailable > 0 ? 'success.main' : 'error.main'}>
                        {slot.seatsAvailable > 0 ? `${slot.seatsAvailable} available` : 'Full'}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {slot.seatsBooked} booked
                      </Typography>
                    </Stack>
                  </Stack>
                </Button>
              ))}
            </Box>
          </Box>
        </>
      )}

      {hasBookableSlot ? (
        <>
          <Divider />
          <Typography variant='subtitle2'>Your details</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label='Name' value={name} onChange={event => setName(event.target.value)} fullWidth required />
            <TextField
              label='Email'
              value={session?.user?.email ?? ''}
              fullWidth
              required
              InputProps={{ readOnly: true }}
              helperText='Captured from your Google account'
            />
            <TextField
              label='Phone'
              value={phone}
              onChange={event => setPhone(event.target.value)}
              fullWidth
              required
            />
            {service.slotMode === 'fixed' && service.maxSeatsPerBooking > 1 ? (
              <TextField
                select
                label='Seats'
                value={quantity}
                onChange={event => setQuantity(Number(event.target.value))}
                fullWidth
              >
                {Array.from(
                  {
                    length: Math.min(service.maxSeatsPerBooking, selectedCapacity || 1)
                  },
                  (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1} {index === 0 ? 'seat' : 'seats'}
                    </MenuItem>
                  )
                )}
              </TextField>
            ) : null}
          </Stack>
          <Button
            variant='contained'
            size='large'
            onClick={startBooking}
            disabled={!hasSelection || submitting || sessionStatus === 'loading'}
            sx={getSiteButtonSx('primary', siteStyles)}
          >
            {submitting
              ? 'Confirming…'
              : !isTermService && selectedSlot?.seatsAvailable === 0 && service.waitlistEnabled
                ? isCustomerForTenant
                  ? 'Join waitlist'
                  : 'Join waitlist with Google'
                : isCustomerForTenant
                  ? isTermService
                    ? 'Enroll for the full term'
                    : bookingButtonLabel
                  : 'Continue with Google'}
          </Button>
          <Typography variant='caption' color='text.secondary' sx={{ textAlign: 'center' }}>
            You’ll see times in {visitorTimezone}. Google sign-in is only required when you confirm.
          </Typography>
        </>
      ) : null}
    </Stack>
  )
}
