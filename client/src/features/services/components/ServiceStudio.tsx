'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  SERVICE_CURRENCY_OPTIONS,
  inferCurrencyFromTimeZone,
  SERVICE_PRICE_MODEL_LABELS,
  SERVICE_PRICE_MODELS,
  SERVICE_PURCHASE_MODE_LABELS,
  SCHEDULE_HORIZON_OPTIONS,
  SERVICE_SLOT_MODE_LABELS,
  SERVICE_SLOT_STATUS_LABELS,
  SERVICE_TIMEZONE_OPTIONS,
  type ServiceBookingMode,
  type ServiceLocationType,
  type ServicePriceModel,
  type ServicePurchaseMode,
  type ServiceSlotMode,
  type ServiceSlotStatus
} from '@/lib/constants/service'
import {
  createOneOffSessionAction,
  getServiceDetailAction,
  regenerateServiceSlotsAction,
  saveServiceSchedulesAction,
  setServiceSlotStatusAction,
  setServiceStatusAction,
  updateServiceAction
} from '@/app/actions/service.actions'
import type { ServiceDetail } from '@/services/booking/service-catalog.service'
import { getBrowserTimeZone, getCalendarDateInZone, toIsoDate } from '@/lib/utils/timezone'

import { SchedulePainter } from './SchedulePainter'
import { SessionCalendar } from './SessionCalendar'
import { ServicePreviewCard } from './ServicePreviewCard'
import { MediaSourceField } from '@/features/your-space/components/property/MediaSourceField'
import { draftsToBlocks, schedulesToDrafts, type ScheduleDraft } from '../services.types'
import { formatClock, formatDayHeading, formatDuration } from '../utils/format'

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120, 150, 180, 240]
const INTERVAL_OPTIONS = [15, 30, 45, 60, 90, 120]
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60]

type Props = {
  initialDetail: ServiceDetail
  tenantSlug: string
}

type FormState = {
  name: string
  slug: string
  tagline: string
  description: string
  coverImageUrl: string
  category: string
  slotMode: ServiceSlotMode
  durationMinutes: number
  slotIntervalMinutes: number | null
  bufferAfterMinutes: number
  defaultCapacity: number
  maxSeatsPerBooking: number
  bookingMode: ServiceBookingMode
  purchaseMode: ServicePurchaseMode
  minNoticeHours: number
  maxDaysAhead: number
  scheduleHorizonDays: number
  scheduleStartDate: string | null
  scheduleEndDate: string | null
  cancellationWindowHours: number
  waitlistEnabled: boolean
  excludePublicHolidays: boolean
  locationType: ServiceLocationType
  locationLabel: string
  timezone: string
  priceModel: ServicePriceModel
  priceMajor: string
  currency: string
}

function toFormState(detail: ServiceDetail): FormState {
  const { service } = detail

  return {
    name: service.name,
    slug: service.slug,
    tagline: service.tagline,
    description: service.description,
    coverImageUrl: service.coverImageUrl,
    category: service.category,
    slotMode: service.slotMode,
    durationMinutes: service.durationMinutes,
    slotIntervalMinutes: service.slotIntervalMinutes,
    bufferAfterMinutes: service.bufferAfterMinutes,
    defaultCapacity: service.defaultCapacity,
    maxSeatsPerBooking: service.maxSeatsPerBooking,
    bookingMode: service.bookingMode,
    purchaseMode: service.purchaseMode ?? 'single_session',
    minNoticeHours: service.minNoticeHours,
    maxDaysAhead: service.maxDaysAhead,
    scheduleHorizonDays: service.scheduleHorizonDays,
    scheduleStartDate: service.scheduleStartDate,
    scheduleEndDate: service.scheduleEndDate,
    cancellationWindowHours: service.cancellationWindowHours,
    waitlistEnabled: service.waitlistEnabled,
    excludePublicHolidays: service.excludePublicHolidays,
    locationType: service.locationType,
    locationLabel: service.locationLabel,
    timezone: service.timezone,
    priceModel: service.priceModel,
    priceMajor: service.priceAmountMinor === 0 ? '' : String(service.priceAmountMinor / 100),
    currency: service.currency
  }
}

export function ServiceStudio({ initialDetail, tenantSlug }: Props) {
  const [detail, setDetail] = useState(initialDetail)
  const [form, setForm] = useState<FormState>(() => toFormState(initialDetail))
  const [drafts, setDrafts] = useState<ScheduleDraft[]>(() => schedulesToDrafts(initialDetail.schedules))
  const [savedForm, setSavedForm] = useState<FormState>(() => toFormState(initialDetail))
  const [savedDrafts, setSavedDrafts] = useState<ScheduleDraft[]>(() => schedulesToDrafts(initialDetail.schedules))
  const [tab, setTab] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const saveInFlight = useRef(false)

  const isOneToOne = form.slotMode === 'rolling'
  const modeLocked = detail.service.hasBookings

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(savedForm) ||
    JSON.stringify(draftsToBlocks(drafts)) !== JSON.stringify(draftsToBlocks(savedDrafts))

  useEffect(() => {
    if (!isDirty) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, typeof detail.upcomingSlots>()

    for (const slot of detail.upcomingSlots) {
      const day = toIsoDate(getCalendarDateInZone(new Date(slot.startAt), form.timezone))

      groups.set(day, [...(groups.get(day) ?? []), slot])
    }

    return [...groups.entries()]
  }, [detail, form.timezone])

  const refresh = async () => {
    const result = await getServiceDetailAction(detail.service.id)

    if (result.success) {
      const nextForm = toFormState(result.detail)
      const nextDrafts = schedulesToDrafts(result.detail.schedules)

      setDetail(result.detail)
      setForm(nextForm)
      setDrafts(nextDrafts)
      setSavedForm(nextForm)
      setSavedDrafts(nextDrafts)

      return true
    }

    setError(result.error)

    return false
  }

  const saveChanges = async () => {
    setError(null)
    setNotice(null)
    setWarning(null)

    const priceAmountMinor = Math.round((Number(form.priceMajor) || 0) * 100)

    const updated = await updateServiceAction({
      serviceId: detail.service.id,
      name: form.name,
      slug: form.slug,
      tagline: form.tagline,
      description: form.description,
      coverImageUrl: form.coverImageUrl,
      category: form.category,
      tags: [],
      slotMode: form.slotMode,
      durationMinutes: form.durationMinutes,
      slotIntervalMinutes: isOneToOne ? form.slotIntervalMinutes : null,
      bufferAfterMinutes: isOneToOne ? form.bufferAfterMinutes : 0,
      defaultCapacity: isOneToOne ? 1 : form.defaultCapacity,
      maxSeatsPerBooking: isOneToOne ? 1 : form.maxSeatsPerBooking,
      bookingMode: form.bookingMode,
      purchaseMode: form.purchaseMode,
      minNoticeHours: form.minNoticeHours,
      maxDaysAhead: form.maxDaysAhead,
      scheduleHorizonDays: form.scheduleHorizonDays,
      scheduleStartDate: form.scheduleStartDate,
      scheduleEndDate: form.scheduleEndDate,
      cancellationWindowHours: form.cancellationWindowHours,
      waitlistEnabled: isOneToOne ? false : form.waitlistEnabled,
      excludePublicHolidays: form.excludePublicHolidays,
      locationType: form.locationType,
      locationLabel: form.locationLabel,
      timezone: form.timezone,
      priceModel: form.priceModel,
      priceAmountMinor,
      currency: form.currency
    })

    if (!updated.success) {
      setError(updated.error)

      return false
    }

    const saved = await saveServiceSchedulesAction({
      serviceId: detail.service.id,
      blocks: draftsToBlocks(drafts)
    })

    if (!saved.success) {
      setError(saved.error)

      return false
    }

    const { materialisation } = saved
    const refreshed = await refresh()

    if (!refreshed) {
      return false
    }

    setNotice(
      `Saved. ${materialisation.generated} upcoming ${isOneToOne ? 'appointments' : 'sessions'} ready for the next ${materialisation.horizonDays} days.`
    )

    if (materialisation.conflicts.length > 0) {
      setWarning(
        `${materialisation.conflicts.length} already-booked session${
          materialisation.conflicts.length === 1 ? '' : 's'
        } no longer match your schedule. They were kept as they are — review them on the Sessions tab.`
      )
    }

    return true
  }

  const runSave = (afterSave?: () => void) => {
    if (saveInFlight.current) {
      return
    }

    saveInFlight.current = true

    startTransition(async () => {
      try {
        if (await saveChanges()) {
          afterSave?.()
        }
      } finally {
        saveInFlight.current = false
      }
    })
  }

  const handleSave = () => {
    runSave()
  }

  const handleTabChange = (nextTab: number) => {
    if (nextTab === tab || isPending || saveInFlight.current) {
      return
    }

    if (!isDirty) {
      setTab(nextTab)

      return
    }

    runSave(() => setTab(nextTab))
  }

  const handleStatus = (status: 'draft' | 'published' | 'archived') => {
    setError(null)
    setNotice(null)

    startTransition(async () => {
      const result = await setServiceStatusAction({ serviceId: detail.service.id, status })

      if (!result.success) {
        setError(result.error)

        return
      }

      setNotice(status === 'published' ? 'Service is live on your site.' : `Service moved to ${status}.`)
      await refresh()
    })
  }

  const handleRegenerate = () => {
    setError(null)
    setNotice(null)

    startTransition(async () => {
      const result = await regenerateServiceSlotsAction(detail.service.id)

      if (!result.success) {
        setError(result.error)

        return
      }

      setNotice(`Rebuilt ${result.materialisation.generated} upcoming sessions.`)
      await refresh()
    })
  }

  const handleSlotStatusChange = (slotId: string, status: ServiceSlotStatus) => {
    setError(null)
    setNotice(null)

    startTransition(async () => {
      const result = await setServiceSlotStatusAction({ slotId, status })

      if (!result.success) {
        setError(result.error)

        return
      }

      setNotice(`Session ${SERVICE_SLOT_STATUS_LABELS[status].toLowerCase()}.`)
      await refresh()
    })
  }

  const handleAddOneOff = (date: string, startMinutes: number, capacity: number) => {
    setError(null)
    setNotice(null)

    startTransition(async () => {
      const result = await createOneOffSessionAction({
        serviceId: detail.service.id,
        date,
        startMinutes,
        capacity
      })

      if (!result.success) {
        setError(result.error)

        return
      }

      setNotice('One-off session added to the calendar.')
      await refresh()
    })
  }

  return (
    <Stack spacing={5}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Box>
          <Button component={Link} href='/services' size='small' color='secondary' sx={{ mb: 1, ml: -2 }}>
            Back to services
          </Button>
          <Stack direction='row' spacing={2} alignItems='center' flexWrap='wrap' useFlexGap>
            <Typography variant='h4'>{form.name || 'Untitled service'}</Typography>
            <Chip
              size='small'
              variant='tonal'
              color={detail.service.status === 'published' ? 'success' : 'secondary'}
              label={detail.service.status}
            />
            <Chip size='small' variant='tonal' label={SERVICE_SLOT_MODE_LABELS[form.slotMode]} />
            <Chip size='small' variant='tonal' label={SERVICE_PURCHASE_MODE_LABELS[form.purchaseMode]} />
          </Stack>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            /site/{tenantSlug}/services/{form.slug}
          </Typography>
        </Box>

        <Stack direction='row' spacing={2}>
          <Button variant='outlined' color='secondary' disabled={isPending || isDirty} onClick={handleRegenerate}>
            Rebuild sessions
          </Button>
          {detail.service.status === 'published' ? (
            <Button
              variant='outlined'
              color='secondary'
              disabled={isPending || isDirty}
              onClick={() => handleStatus('draft')}
            >
              Unpublish
            </Button>
          ) : (
            <Button variant='outlined' disabled={isPending || isDirty} onClick={() => handleStatus('published')}>
              Publish
            </Button>
          )}
          <Button variant='contained' disabled={isPending} onClick={handleSave}>
            Save changes
          </Button>
        </Stack>
      </Stack>

      <Typography
        variant='caption'
        color={isPending ? 'primary.main' : isDirty ? 'warning.main' : 'text.secondary'}
        aria-live='polite'
      >
        {isPending
          ? 'Saving changes…'
          : isDirty
            ? 'Unsaved changes — switching tabs will save them.'
            : 'All changes saved'}
      </Typography>

      {error ? <Alert severity='error'>{error}</Alert> : null}
      {warning ? <Alert severity='warning'>{warning}</Alert> : null}
      {notice ? <Alert severity='success'>{notice}</Alert> : null}

      <Tabs
        value={tab}
        onChange={(_, value: number) => handleTabChange(value)}
        sx={{ pointerEvents: isPending ? 'none' : 'auto' }}
      >
        <Tab label='Details' />
        <Tab label='Schedule' />
        <Tab label={`Sessions (${detail.stats.upcoming})`} />
      </Tabs>

      <Box component='fieldset' disabled={isPending} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }} aria-busy={isPending}>
        {tab === 0 ? (
          <Box sx={{ display: 'flex', gap: 5, alignItems: 'flex-start', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
            <Stack spacing={5} sx={{ flex: '1 1 560px', minWidth: 0 }}>
              <Card>
                <CardContent>
                  <Stack spacing={4}>
                    <Typography variant='h6'>Basics</Typography>
                    <TextField
                      label='Service name'
                      fullWidth
                      value={form.name}
                      onChange={event => set('name', event.target.value)}
                    />
                    <TextField
                      label='Link'
                      fullWidth
                      value={form.slug}
                      helperText='Used in the public URL for this service'
                      onChange={event => set('slug', event.target.value)}
                    />
                    <TextField
                      label='Tagline'
                      fullWidth
                      placeholder='A calm start to your morning'
                      value={form.tagline}
                      onChange={event => set('tagline', event.target.value)}
                    />
                    <TextField
                      label='Description'
                      fullWidth
                      multiline
                      minRows={4}
                      value={form.description}
                      onChange={event => set('description', event.target.value)}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                      <TextField
                        label='Category'
                        fullWidth
                        placeholder='Yoga'
                        value={form.category}
                        onChange={event => set('category', event.target.value)}
                      />
                    </Stack>
                    <MediaSourceField
                      label='Service image'
                      value={form.coverImageUrl}
                      enableUnsplash
                      unsplashDefaultQuery={form.category || form.name || 'professional service'}
                      onChange={url => set('coverImageUrl', url)}
                      clearLabel='Remove service image'
                      urlPlaceholder='Paste an image URL'
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant='h6'>Format</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {isOneToOne
                          ? 'Customers pick an open time inside the hours you publish.'
                          : 'Everyone books the same session, up to the number of seats you set.'}
                      </Typography>
                    </Box>

                    {modeLocked ? (
                      <Alert severity='info'>
                        This service already has bookings, so its format is locked. Archive it and create a new service
                        to switch between group sessions and one-to-one.
                      </Alert>
                    ) : null}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                      <TextField
                        select
                        label='Booking type'
                        fullWidth
                        disabled={modeLocked}
                        value={form.purchaseMode}
                        helperText={
                          form.purchaseMode === 'term'
                            ? 'Customers choose one labelled batch and book every class in the term.'
                            : 'Customers choose and book one session at a time.'
                        }
                        onChange={event => {
                          const purchaseMode = event.target.value as ServicePurchaseMode

                          setForm(previous => ({
                            ...previous,
                            purchaseMode,
                            slotMode: purchaseMode === 'term' ? 'fixed' : previous.slotMode,
                            priceModel:
                              purchaseMode === 'term' && previous.priceModel !== 'free'
                                ? 'package'
                                : previous.priceModel
                          }))
                        }}
                      >
                        <MenuItem value='single_session'>{SERVICE_PURCHASE_MODE_LABELS.single_session}</MenuItem>
                        <MenuItem value='term'>{SERVICE_PURCHASE_MODE_LABELS.term}</MenuItem>
                      </TextField>
                      <TextField
                        select
                        label='Booking format'
                        fullWidth
                        disabled={modeLocked}
                        value={form.slotMode}
                        onChange={event => {
                          const next = event.target.value as ServiceSlotMode

                          setForm(previous => ({
                            ...previous,
                            slotMode: next,
                            defaultCapacity: next === 'rolling' ? 1 : Math.max(2, previous.defaultCapacity),
                            maxSeatsPerBooking: next === 'rolling' ? 1 : previous.maxSeatsPerBooking,
                            bufferAfterMinutes: next === 'rolling' ? previous.bufferAfterMinutes || 10 : 0
                          }))
                        }}
                      >
                        <MenuItem value='fixed'>{SERVICE_SLOT_MODE_LABELS.fixed}</MenuItem>
                        <MenuItem value='rolling'>{SERVICE_SLOT_MODE_LABELS.rolling}</MenuItem>
                      </TextField>

                      <TextField
                        select
                        label='Duration'
                        fullWidth
                        value={form.durationMinutes}
                        onChange={event => set('durationMinutes', Number(event.target.value))}
                      >
                        {DURATION_OPTIONS.map(minutes => (
                          <MenuItem key={minutes} value={minutes}>
                            {formatDuration(minutes)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>

                    {isOneToOne ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                        <TextField
                          select
                          label='Gap after each appointment'
                          fullWidth
                          value={form.bufferAfterMinutes}
                          onChange={event => set('bufferAfterMinutes', Number(event.target.value))}
                        >
                          {BUFFER_OPTIONS.map(minutes => (
                            <MenuItem key={minutes} value={minutes}>
                              {minutes === 0 ? 'No gap' : `${minutes} min`}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          label='Start times every'
                          fullWidth
                          value={form.slotIntervalMinutes ?? 0}
                          helperText={`Auto keeps appointments back to back (${formatDuration(
                            form.durationMinutes + form.bufferAfterMinutes
                          )})`}
                          onChange={event => {
                            const value = Number(event.target.value)

                            set('slotIntervalMinutes', value === 0 ? null : value)
                          }}
                        >
                          <MenuItem value={0}>Auto</MenuItem>
                          {INTERVAL_OPTIONS.map(minutes => (
                            <MenuItem key={minutes} value={minutes}>
                              {formatDuration(minutes)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                    ) : (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                        <TextField
                          type='number'
                          label='Seats per session'
                          fullWidth
                          value={form.defaultCapacity}
                          onChange={event => set('defaultCapacity', Math.max(1, Number(event.target.value) || 1))}
                        />
                        <TextField
                          type='number'
                          label='Max seats per booking'
                          fullWidth
                          helperText='Lets someone bring a friend'
                          value={form.maxSeatsPerBooking}
                          onChange={event => set('maxSeatsPerBooking', Math.max(1, Number(event.target.value) || 1))}
                        />
                      </Stack>
                    )}
                  </Stack>
                  {form.purchaseMode === 'term' ? (
                    <Alert severity='info'>
                      Term classes use the dates below as the term window. Give matching weekly blocks the same label in
                      the Schedule tab, for example “5 PM Batch” for Mondays and Fridays.
                    </Alert>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={4}>
                    <Typography variant='h6'>Booking rules</Typography>

                    <TextField
                      select
                      label='When someone books'
                      fullWidth
                      value={form.bookingMode}
                      onChange={event => set('bookingMode', event.target.value as ServiceBookingMode)}
                    >
                      <MenuItem value='instant'>Confirm automatically</MenuItem>
                      <MenuItem value='request'>Hold the seat until I approve</MenuItem>
                    </TextField>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                      <TextField
                        select
                        label='Generate sessions for'
                        fullWidth
                        value={form.scheduleHorizonDays}
                        helperText='How far ahead the system creates sessions'
                        onChange={event => set('scheduleHorizonDays', Number(event.target.value))}
                      >
                        {SCHEDULE_HORIZON_OPTIONS.map(days => (
                          <MenuItem key={days} value={days}>
                            {days === 365 ? '1 year' : `${days} days`}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        type='number'
                        label='Minimum notice (hours)'
                        fullWidth
                        value={form.minNoticeHours}
                        onChange={event => set('minNoticeHours', Math.max(0, Number(event.target.value) || 0))}
                      />
                      <TextField
                        type='number'
                        label='Bookable up to (days ahead)'
                        fullWidth
                        value={form.maxDaysAhead}
                        onChange={event => set('maxDaysAhead', Math.max(1, Number(event.target.value) || 1))}
                      />
                    </Stack>
                    <Box>
                      <Typography variant='subtitle2'>
                        Season or term dates {form.purchaseMode === 'term' ? '(required)' : '(optional)'}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                        {form.purchaseMode === 'term'
                          ? 'Customers enrolled in the term will be booked into every matching class between these dates.'
                          : 'Limit this weekly timetable to a defined period, such as Term 1. For example, add Tuesday and Wednesday blocks in the Schedule tab and set the term dates here.'}
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                      <TextField
                        type='date'
                        label={form.purchaseMode === 'term' ? 'Term starts' : 'Season starts'}
                        fullWidth
                        value={form.scheduleStartDate ?? ''}
                        onChange={event => set('scheduleStartDate', event.target.value || null)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        type='date'
                        label={form.purchaseMode === 'term' ? 'Term ends' : 'Season ends'}
                        fullWidth
                        value={form.scheduleEndDate ?? ''}
                        onChange={event => set('scheduleEndDate', event.target.value || null)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                      <TextField
                        type='number'
                        label='Free cancellation (hours)'
                        fullWidth
                        value={form.cancellationWindowHours}
                        onChange={event => set('cancellationWindowHours', Math.max(0, Number(event.target.value) || 0))}
                      />
                      {!isOneToOne ? (
                        <FormControlLabel
                          sx={{ minWidth: { sm: 280 } }}
                          control={
                            <Switch
                              checked={form.waitlistEnabled}
                              onChange={event => set('waitlistEnabled', event.target.checked)}
                            />
                          }
                          label='Waitlist when full'
                        />
                      ) : null}
                      <FormControlLabel
                        sx={{ minWidth: { sm: 300 } }}
                        control={
                          <Switch
                            checked={form.excludePublicHolidays}
                            onChange={event => set('excludePublicHolidays', event.target.checked)}
                          />
                        }
                        label='Skip public holidays'
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={4}>
                    <Typography variant='h6'>Location &amp; pricing</Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                      <TextField
                        select
                        label='Location'
                        fullWidth
                        value={form.locationType}
                        onChange={event => set('locationType', event.target.value as ServiceLocationType)}
                      >
                        <MenuItem value='in_person'>In person</MenuItem>
                        <MenuItem value='online'>Online</MenuItem>
                      </TextField>
                      <TextField
                        label={form.locationType === 'online' ? 'Meeting note' : 'Address'}
                        fullWidth
                        value={form.locationLabel}
                        onChange={event => set('locationLabel', event.target.value)}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <TextField
                        select
                        label='Site timezone'
                        fullWidth
                        helperText='Sessions are generated in this timezone. Visitors see them in their own timezone.'
                        value={form.timezone}
                        onChange={event => set('timezone', event.target.value)}
                      >
                        {SERVICE_TIMEZONE_OPTIONS.map(timezone => (
                          <MenuItem key={timezone} value={timezone}>
                            {timezone.replaceAll('_', ' ')}
                          </MenuItem>
                        ))}
                        {!SERVICE_TIMEZONE_OPTIONS.includes(
                          form.timezone as (typeof SERVICE_TIMEZONE_OPTIONS)[number]
                        ) ? (
                          <MenuItem value={form.timezone}>{form.timezone}</MenuItem>
                        ) : null}
                      </TextField>
                      <Button
                        size='small'
                        color='secondary'
                        sx={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                          const browserTimeZone = getBrowserTimeZone()

                          set('timezone', browserTimeZone)
                          set('currency', inferCurrencyFromTimeZone(browserTimeZone))
                        }}
                      >
                        Use my current timezone and currency
                      </Button>
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Service pricing
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Choose how customers see the price. The currency starts with your site default, but can be
                        changed for this service.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gap: 3,
                        gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 1fr' },
                        alignItems: 'start'
                      }}
                    >
                      <TextField
                        select
                        label='Pricing model'
                        fullWidth
                        value={form.priceModel}
                        onChange={event => set('priceModel', event.target.value as ServicePriceModel)}
                      >
                        {SERVICE_PRICE_MODELS.filter(
                          model => form.purchaseMode !== 'term' || model === 'free' || model === 'package'
                        ).map(model => (
                          <MenuItem key={model} value={model}>
                            {SERVICE_PRICE_MODEL_LABELS[model]}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label='Amount'
                        fullWidth
                        disabled={form.priceModel === 'free'}
                        value={form.priceMajor}
                        placeholder={form.priceModel === 'free' ? 'No charge' : '0.00'}
                        onChange={event => set('priceMajor', event.target.value.replace(/[^\d.]/g, ''))}
                      />
                      <TextField
                        select
                        label='Currency'
                        fullWidth
                        value={form.currency}
                        onChange={event => set('currency', event.target.value)}
                      >
                        {SERVICE_CURRENCY_OPTIONS.map(option => (
                          <MenuItem key={option.code} value={option.code}>
                            {option.label}
                          </MenuItem>
                        ))}
                        {!SERVICE_CURRENCY_OPTIONS.some(option => option.code === form.currency) ? (
                          <MenuItem value={form.currency}>{form.currency}</MenuItem>
                        ) : null}
                      </TextField>
                    </Box>

                    <Stack direction='row' spacing={1} alignItems='center'>
                      <i className='ri-information-line' style={{ fontSize: '1rem', opacity: 0.65 }} />
                      <Typography variant='caption' color='text.secondary'>
                        Payment is not collected yet. Bookings are recorded as unpaid so you can settle in person.
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>

            <Box sx={{ flex: '0 1 380px', minWidth: 300, width: '100%' }}>
              <ServicePreviewCard
                name={form.name}
                tagline={form.tagline}
                durationMinutes={form.durationMinutes}
                slotMode={form.slotMode}
                locationType={form.locationType}
                locationLabel={form.locationLabel}
                priceModel={form.priceModel}
                priceAmountMinor={Math.round((Number(form.priceMajor) || 0) * 100)}
                currency={form.currency}
                timezone={form.timezone}
                coverImageUrl={form.coverImageUrl}
                slots={detail.upcomingSlots}
              />
            </Box>
          </Box>
        ) : null}

        {tab === 1 ? (
          <Card>
            <CardContent>
              <SchedulePainter
                drafts={drafts}
                onChange={setDrafts}
                slotMode={form.slotMode}
                purchaseMode={form.purchaseMode}
                durationMinutes={form.durationMinutes}
                bufferAfterMinutes={form.bufferAfterMinutes}
                slotIntervalMinutes={form.slotIntervalMinutes}
                defaultCapacity={form.defaultCapacity}
                disabled={isPending}
              />
              <Alert severity='info' sx={{ mt: 5 }}>
                Times are in {form.timezone}. Sessions are generated for the next {form.scheduleHorizonDays} days and
                topped up automatically. Changes save automatically when you switch tabs.
              </Alert>
              <Box sx={{ mt: 5 }}>
                <SessionCalendar
                  slots={detail.upcomingSlots}
                  timezone={form.timezone}
                  slotMode={form.slotMode}
                  durationMinutes={form.durationMinutes}
                  defaultCapacity={form.defaultCapacity}
                  scheduleHorizonDays={form.scheduleHorizonDays}
                  disabled={isPending || isDirty}
                  onStatusChange={handleSlotStatusChange}
                  onAddOneOff={handleAddOneOff}
                />
              </Box>
            </CardContent>
          </Card>
        ) : null}

        {tab === 2 ? (
          <Card>
            <CardContent>
              {groupedSlots.length === 0 ? (
                <Stack spacing={2} sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant='h6'>No upcoming sessions yet</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Paint your weekly availability on the Schedule tab, then save.
                  </Typography>
                </Stack>
              ) : (
                <Stack spacing={4}>
                  <Stack direction='row' spacing={4} flexWrap='wrap' useFlexGap>
                    <Chip variant='tonal' color='primary' label={`${detail.stats.upcoming} upcoming`} />
                    <Chip variant='tonal' label={`${detail.stats.seatsOffered} seats offered`} />
                  </Stack>

                  {groupedSlots.map(([day, slots]) => (
                    <Box key={day}>
                      <Typography variant='subtitle2' sx={{ mb: 2 }}>
                        {formatDayHeading(slots[0].startAt, form.timezone)}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {slots.map(slot => (
                          <Chip
                            key={slot.id}
                            variant='outlined'
                            label={`${formatClock(slot.startAt, form.timezone)} · ${slot.seatsAvailable}/${slot.capacity}`}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        ) : null}
      </Box>
    </Stack>
  )
}
