'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  DEFAULT_SERVICE_CURRENCY,
  DEFAULT_SERVICE_TIMEZONE,
  DEFAULT_SCHEDULE_HORIZON_DAYS,
  inferCurrencyFromTimeZone,
  type ServicePurchaseMode,
  type ServiceSlotMode
} from '@/lib/constants/service'
import { createServiceAction, deleteServiceAction, getServicesAction } from '@/app/actions/service.actions'
import { getImageKitThumbnailUrl } from '@/lib/imagekit/urls'
import { getBrowserTimeZone } from '@/lib/utils/timezone'
import type { ServiceListItem } from '@/services/booking/service-catalog.service'

import { formatDuration, formatMoney, formatPrice, formatRelativeDays } from '../utils/format'

const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120]

type Props = {
  initialServices: ServiceListItem[]
  tenantSlug: string
  siteDefaults: {
    timezone: string
    currency: string
  }
}

const MODE_CHOICES: {
  mode: ServiceSlotMode
  title: string
  blurb: string
  example: string
}[] = [
  {
    mode: 'fixed',
    title: 'Group sessions',
    blurb: 'Everyone books the same time. You set how many seats each session has.',
    example: 'Yoga class, tuition batch, workshop'
  },
  {
    mode: 'rolling',
    title: 'One-to-one',
    blurb: 'You publish the hours you are open and people pick an open time.',
    example: 'Consultation, salon chair, clinic visit'
  }
]

export function ServicesPageClient({ initialServices, tenantSlug, siteDefaults }: Props) {
  const theme = useTheme()
  const router = useRouter()
  const [services, setServices] = useState(initialServices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<ServiceSlotMode>('fixed')
  const [purchaseMode, setPurchaseMode] = useState<ServicePurchaseMode>('single_session')
  const [name, setName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [capacity, setCapacity] = useState(10)
  const [timezone, setTimezone] = useState(siteDefaults.timezone || DEFAULT_SERVICE_TIMEZONE)
  const [currency, setCurrency] = useState(siteDefaults.currency || DEFAULT_SERVICE_CURRENCY)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ServiceListItem | null>(null)
  const [isPending, startTransition] = useTransition()

  const totals = useMemo(
    () => ({
      published: services.filter(service => service.status === 'published').length,
      upcoming: services.reduce((sum, service) => sum + service.upcomingSlots, 0),
      seats: services.reduce((sum, service) => sum + service.seatsOffered, 0)
    }),
    [services]
  )

  useEffect(() => {
    if (!siteDefaults.timezone) {
      const browserTimeZone = getBrowserTimeZone()

      setTimezone(browserTimeZone)

      if (!siteDefaults.currency) {
        setCurrency(inferCurrencyFromTimeZone(browserTimeZone))
      }
    }
  }, [siteDefaults.currency, siteDefaults.timezone])

  const openDialog = (preset: ServiceSlotMode) => {
    setMode(preset)
    setPurchaseMode('single_session')
    setName('')
    setDurationMinutes(preset === 'rolling' ? 30 : 60)
    setCapacity(preset === 'rolling' ? 1 : 10)

    // An explicit profile default wins. Otherwise detect the current browser
    // location instead of reusing an older service's legacy fallback.
    const siteTimeZone = siteDefaults.timezone || getBrowserTimeZone()

    setTimezone(siteTimeZone)
    setCurrency(siteDefaults.currency || inferCurrencyFromTimeZone(siteTimeZone))
    setError(null)
    setDialogOpen(true)
  }

  const refresh = async () => {
    const result = await getServicesAction()

    if (result.success) {
      setServices(result.services)
    }
  }

  const handleCreate = () => {
    setError(null)

    startTransition(async () => {
      const result = await createServiceAction({
        name,
        slotMode: mode,
        purchaseMode,
        durationMinutes,
        defaultCapacity: mode === 'rolling' ? 1 : capacity,
        timezone,
        currency,
        scheduleHorizonDays: DEFAULT_SCHEDULE_HORIZON_DAYS,
        scheduleStartDate: null,
        scheduleEndDate: null,
        excludePublicHolidays: false
      })

      if (!result.success) {
        setError(result.error)

        return
      }

      setDialogOpen(false)
      router.push(`/services/${result.service.id}`)
    })
  }

  const openDeleteDialog = (service: ServiceListItem) => {
    setError(null)
    setMessage(null)
    setDeleteTarget(service)
  }

  const handleDelete = () => {
    if (!deleteTarget) {
      return
    }

    setError(null)

    startTransition(async () => {
      const result = await deleteServiceAction(deleteTarget.id)

      if (!result.success) {
        setError(result.error)

        return
      }

      const { deletion } = result

      setDeleteTarget(null)
      setMessage(
        deletion.removedBookings === 0
          ? 'Service deleted.'
          : `Service deleted. ${deletion.removedBookings} booking${
              deletion.removedBookings === 1 ? '' : 's'
            } marked as removed. ${
              deletion.notificationFailures === 0
                ? `${deletion.notifiedBookings} customer notification${
                    deletion.notifiedBookings === 1 ? '' : 's'
                  } sent.`
                : `${deletion.notificationFailures} customer notification${
                    deletion.notificationFailures === 1 ? '' : 's'
                  } could not be sent.`
            }`
      )
      await refresh()
    })
  }

  return (
    <Stack spacing={5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Box>
          <Typography variant='h4'>Services</Typography>
          <Typography variant='body2' color='text.secondary'>
            Anything people can book on your site — classes, appointments, workshops.
          </Typography>
        </Box>
        {services.length > 0 ? (
          <Button variant='contained' onClick={() => openDialog('fixed')}>
            New service
          </Button>
        ) : null}
      </Stack>

      {message ? <Alert severity='success'>{message}</Alert> : null}
      {error ? <Alert severity='error'>{error}</Alert> : null}

      {services.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 10 }}>
            <Stack spacing={6} alignItems='center'>
              <Box sx={{ textAlign: 'center', maxWidth: 520 }}>
                <Typography variant='h5'>What do people book with you?</Typography>
                <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                  Pick a format to start. You can add more services later, and each one can use a different format.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ width: '100%', maxWidth: 720 }}>
                {MODE_CHOICES.map(choice => (
                  <Box
                    key={choice.mode}
                    onClick={() => openDialog(choice.mode)}
                    sx={{
                      flex: 1,
                      p: 5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'border-color 150ms ease, background-color 150ms ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.04)
                      }
                    }}
                  >
                    <Typography variant='h6'>{choice.title}</Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                      {choice.blurb}
                    </Typography>
                    <Typography variant='caption' color='text.disabled' sx={{ display: 'block', mt: 3 }}>
                      {choice.example}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stack direction='row' spacing={6} flexWrap='wrap' useFlexGap>
            <Box>
              <Typography variant='h5'>{services.length}</Typography>
              <Typography variant='caption' color='text.secondary'>
                Services
              </Typography>
            </Box>
            <Box>
              <Typography variant='h5'>{totals.published}</Typography>
              <Typography variant='caption' color='text.secondary'>
                Live on your site
              </Typography>
            </Box>
            <Box>
              <Typography variant='h5'>{totals.upcoming}</Typography>
              <Typography variant='caption' color='text.secondary'>
                Upcoming sessions
              </Typography>
            </Box>
            <Box>
              <Typography variant='h5'>{totals.seats}</Typography>
              <Typography variant='caption' color='text.secondary'>
                Seats offered
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }
            }}
          >
            {services.map(service => (
              <Card
                key={service.id}
                sx={{
                  overflow: 'hidden',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '16 / 8',
                    overflow: 'hidden',
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }}
                >
                  {service.coverImageUrl ? (
                    <Box
                      component='img'
                      src={getImageKitThumbnailUrl(service.coverImageUrl, 640)}
                      alt={service.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        transition: 'transform 400ms ease',
                        '.MuiCard-root:hover &': {
                          transform: 'scale(1.04)'
                        }
                      }}
                    />
                  ) : (
                    <Stack
                      alignItems='center'
                      justifyContent='center'
                      spacing={1}
                      sx={{ height: '100%', color: 'primary.main' }}
                    >
                      <i className='ri-calendar-event-line' style={{ fontSize: '2rem' }} />
                      <Typography variant='caption' color='text.secondary'>
                        Add a service image
                      </Typography>
                    </Stack>
                  )}
                  <Chip
                    size='small'
                    variant='outlined'
                    color={
                      service.status === 'published' ? 'success' : service.status === 'archived' ? 'default' : 'warning'
                    }
                    label={service.status}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'background.paper',
                      fontWeight: 600,
                      '& .MuiChip-label': { textTransform: 'capitalize' }
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Stack direction='row' spacing={2} justifyContent='space-between' alignItems='flex-start'>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant='h6' noWrap>
                          {service.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' noWrap>
                          {service.tagline || `/site/${tenantSlug}/book?service=${service.slug}`}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
                      <Chip
                        size='small'
                        variant='outlined'
                        label={service.slotMode === 'rolling' ? 'One-to-one' : 'Group'}
                      />
                      <Chip size='small' variant='outlined' label={formatDuration(service.durationMinutes)} />
                      <Chip
                        size='small'
                        variant='outlined'
                        label={
                          service.purchaseMode === 'term'
                            ? `${formatMoney(service.priceAmountMinor, service.currency)} / term`
                            : formatPrice(service.priceModel, service.priceAmountMinor, service.currency)
                        }
                      />
                    </Stack>

                    <Stack direction='row' spacing={6}>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {service.upcomingSlots}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Upcoming
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {service.scheduleCount}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Time blocks
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {formatRelativeDays(service.nextAvailableAt)}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Next opening
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction='row' spacing={2} justifyContent='space-between' alignItems='center'>
                      <Button component={Link} href={`/services/${service.id}`} size='small' variant='outlined'>
                        Open studio
                      </Button>
                      <Button size='small' color='error' disabled={isPending} onClick={() => openDeleteDialog(service)}>
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>New service</DialogTitle>
        <DialogContent>
          <Stack spacing={4} sx={{ pt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              {MODE_CHOICES.map(choice => (
                <Box
                  key={choice.mode}
                  onClick={() => {
                    setMode(choice.mode)

                    if (choice.mode === 'rolling') {
                      setPurchaseMode('single_session')
                    }

                    setDurationMinutes(choice.mode === 'rolling' ? 30 : 60)
                    setCapacity(choice.mode === 'rolling' ? 1 : 10)
                  }}
                  sx={{
                    flex: 1,
                    p: 4,
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: `1px solid ${mode === choice.mode ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: mode === choice.mode ? alpha(theme.palette.primary.main, 0.06) : 'transparent'
                  }}
                >
                  <Typography variant='subtitle2'>{choice.title}</Typography>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                    {choice.example}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <TextField
              select
              label='Booking type'
              value={purchaseMode}
              helperText={
                purchaseMode === 'term'
                  ? 'Customers choose one batch and are booked into every class in the term.'
                  : 'Customers choose and book one session at a time.'
              }
              onChange={event => {
                const next = event.target.value as ServicePurchaseMode

                setPurchaseMode(next)

                if (next === 'term') {
                  setMode('fixed')
                }
              }}
            >
              <MenuItem value='single_session'>Book one session</MenuItem>
              <MenuItem value='term'>Book the whole term</MenuItem>
            </TextField>

            <TextField
              autoFocus
              label='Service name'
              fullWidth
              placeholder={mode === 'rolling' ? 'Initial consultation' : 'Sunrise Vinyasa'}
              value={name}
              onChange={event => setName(event.target.value)}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <TextField
                select
                label='Duration'
                fullWidth
                value={durationMinutes}
                onChange={event => setDurationMinutes(Number(event.target.value))}
              >
                {DURATION_OPTIONS.map(minutes => (
                  <MenuItem key={minutes} value={minutes}>
                    {formatDuration(minutes)}
                  </MenuItem>
                ))}
              </TextField>

              {mode === 'fixed' ? (
                <TextField
                  type='number'
                  label='Seats per session'
                  fullWidth
                  value={capacity}
                  onChange={event => setCapacity(Math.max(1, Number(event.target.value) || 1))}
                />
              ) : null}
            </Stack>

            <TextField
              label='Timezone'
              fullWidth
              helperText='Where these sessions physically happen'
              value={timezone}
              onChange={event => setTimezone(event.target.value)}
            />

            {error ? <Alert severity='error'>{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant='contained' disabled={isPending || name.trim().length < 2} onClick={handleCreate}>
            Create and set up
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!isPending) {
            setDeleteTarget(null)
          }
        }}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            {deleteTarget?.status === 'published' ? (
              <Alert severity='warning'>
                This service is currently published and visible on your site. Deleting it will remove it from the
                booking page permanently.
              </Alert>
            ) : null}
            {deleteTarget?.hasBookings ? (
              <Alert severity='warning'>
                This service has booking history. Deleting it will mark all related bookings as removed and email the
                affected customers. Their booking history will remain available in the Bookings section.
              </Alert>
            ) : (
              <Typography>
                This permanently deletes the service, its schedule, and its upcoming sessions. This action cannot be
                undone.
              </Typography>
            )}
            {error ? <Alert severity='error'>{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' disabled={isPending} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color='error' variant='contained' disabled={isPending} onClick={handleDelete}>
            Delete permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
