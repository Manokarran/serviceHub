'use client'

import { useMemo, useState, useTransition } from 'react'

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
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  getTenantBookingsAction,
  sendBookingNotificationAction,
  updateBookingStatusAction
} from '@/app/actions/booking.actions'
import type { BookingStatus, BookingSummary } from '@/models/booking'

type Props = {
  initialBookings: BookingSummary[]
}

type BookingFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'removed'

const FILTERS: { value: BookingFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Needs approval' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'removed', label: 'Service removed' }
]

function formatDate(value: string, timezone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone
  }).format(new Date(value))
}

function statusColor(status: BookingStatus): 'warning' | 'success' | 'error' | 'info' | 'default' {
  if (status === 'pending') return 'warning'
  if (status === 'confirmed') return 'success'
  if (status === 'cancelled') return 'error'
  if (status === 'attended') return 'info'
  if (status === 'removed') return 'warning'

  return 'default'
}

function statusLabel(status: BookingStatus): string {
  return status === 'removed' ? 'service removed' : status.replace('_', ' ')
}

function InsightCard({ icon, label, value, hint }: { icon: string; label: string; value: string; hint: string }) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        border: theme => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 20px rgba(48, 20, 80, 0.04)'
      }}
    >
      <Box className='flex items-center gap-1.5' sx={{ color: 'primary.main', mb: 0.75 }}>
        <i className={icon} />
        <Typography variant='caption' sx={{ fontWeight: 700 }} noWrap>
          {label}
        </Typography>
      </Box>
      <Typography variant='h5' sx={{ fontWeight: 750, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant='caption' color='text.secondary'>
        {hint}
      </Typography>
    </Box>
  )
}

export function BookingsPageClient({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<BookingFilter>('all')
  const [showPastRecords, setShowPastRecords] = useState(false)
  const [cancelBooking, setCancelBooking] = useState<BookingSummary | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const counts = useMemo(
    () => ({
      all: bookings.length,
      pending: bookings.filter(booking => booking.status === 'pending').length,
      confirmed: bookings.filter(booking => booking.status === 'confirmed').length,
      cancelled: bookings.filter(booking => booking.status === 'cancelled').length,
      removed: bookings.filter(booking => booking.status === 'removed').length
    }),
    [bookings]
  )

  const visibleBookings = useMemo(
    () => (filter === 'all' ? bookings : bookings.filter(booking => booking.status === filter)),
    [bookings, filter]
  )

  const bookingStats = useMemo(() => {
    const now = Date.now()
    const activeBookings = visibleBookings.filter(booking => booking.status !== 'cancelled' && booking.status !== 'removed')

    return {
      seats: activeBookings.reduce((total, booking) => total + booking.quantity, 0),
      upcoming: activeBookings.filter(booking => new Date(booking.startAt).getTime() >= now).length,
      services: new Set(activeBookings.map(booking => booking.serviceId)).size
    }
  }, [visibleBookings])

  const serviceStats = useMemo(() => {
    const grouped = new Map<
      string,
      { serviceName: string; bookings: number; seats: number; pending: number; latest: string }
    >()

    visibleBookings.forEach(booking => {
      const current = grouped.get(booking.serviceId) ?? {
        serviceName: booking.serviceName,
        bookings: 0,
        seats: 0,
        pending: 0,
        latest: booking.startAt
      }

      const active = booking.status !== 'cancelled' && booking.status !== 'removed'

      current.bookings += active ? 1 : 0
      current.seats += active ? booking.quantity : 0
      current.pending += booking.status === 'pending' ? 1 : 0

      if (new Date(booking.startAt).getTime() > new Date(current.latest).getTime()) {
        current.latest = booking.startAt
      }

      grouped.set(booking.serviceId, current)
    })

    return [...grouped.values()].sort((a, b) => b.seats - a.seats || b.bookings - a.bookings)
  }, [visibleBookings])

  const batchStats = useMemo(() => {
    const grouped = new Map<
      string,
      { serviceName: string; seats: number; sessions: number; startAt: string; customerName: string }
    >()

    visibleBookings.forEach(booking => {
      if (!booking.termEnrollmentId || booking.status === 'cancelled' || booking.status === 'removed') {
        return
      }

      const current = grouped.get(booking.termEnrollmentId) ?? {
        serviceName: booking.serviceName,
        seats: booking.quantity,
        sessions: 0,
        startAt: booking.startAt,
        customerName: booking.customerName
      }

      current.sessions += 1

      if (new Date(booking.startAt).getTime() < new Date(current.startAt).getTime()) {
        current.startAt = booking.startAt
      }

      grouped.set(booking.termEnrollmentId, current)
    })

    return [...grouped.values()].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }, [visibleBookings])

  const refresh = () => {
    startTransition(async () => {
      const result = await getTenantBookingsAction({ includePast: showPastRecords })

      if (!result.success) {
        setError(result.error)

        return
      }

      setBookings(result.bookings)
      setError(null)
    })
  }

  const updateStatus = (booking: BookingSummary, status: BookingStatus, reason?: string) => {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateBookingStatusAction({
        bookingId: booking.id,
        status,
        reason
      })

      if (!result.success) {
        setError(result.error)

        return
      }

      setBookings(current =>
        current.map(item =>
          booking.termEnrollmentId && item.termEnrollmentId === booking.termEnrollmentId
            ? { ...item, status: result.booking.status }
            : item.id === result.booking.id
              ? result.booking
              : item
        )
      )
      setMessage(
        booking.termEnrollmentId
          ? status === 'confirmed'
            ? 'Term enrolment approved. A confirmation email was sent to the customer.'
            : status === 'cancelled'
              ? 'Term enrolment cancelled. A cancellation email was sent to the customer.'
              : `Booking marked as ${status.replace('_', ' ')}.`
          : status === 'confirmed'
            ? 'Booking approved. A confirmation email was sent to the customer.'
            : status === 'cancelled'
              ? 'Booking cancelled. A cancellation email was sent to the customer.'
              : `Booking marked as ${status.replace('_', ' ')}.`
      )
    })
  }

  const confirmCancellation = () => {
    if (!cancelBooking) return

    const booking = cancelBooking

    setCancelBooking(null)
    updateStatus(booking, 'cancelled', cancelReason)
    setCancelReason('')
  }

  const sendNotification = (booking: BookingSummary) => {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await sendBookingNotificationAction(booking.id)

      if (!result.success) {
        setError(result.error)

        return
      }

      setMessage(`Notification sent to ${booking.customerEmail}.`)
    })
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Box>
        <Typography variant='h4' className='mbe-1'>
          Bookings
        </Typography>
        <Typography color='text.secondary'>
          Review requests, approve sessions, and keep customers informed automatically.
        </Typography>
      </Box>

      {message ? (
        <Alert severity='success' onClose={() => setMessage(null)}>
          {message}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='space-between'>
            <Stack direction='row' spacing={1} sx={{ overflowX: 'auto', minWidth: 0, pb: 0.5 }}>
              {FILTERS.map(item => (
                <Button
                  key={item.value}
                  variant={filter === item.value ? 'contained' : 'outlined'}
                  onClick={() => setFilter(item.value)}
                  sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {item.label} ({counts[item.value]})
                </Button>
              ))}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
              <Button
                variant={showPastRecords ? 'contained' : 'outlined'}
                onClick={() => {
                  setShowPastRecords(current => !current)
                  startTransition(async () => {
                    const result = await getTenantBookingsAction({ includePast: !showPastRecords })

                    if (!result.success) {
                      setError(result.error)

                      return
                    }

                    setBookings(result.bookings)
                    setError(null)
                  })
                }}
                disabled={isPending}
              >
                {showPastRecords ? 'Recent only' : 'Include past records'}
              </Button>
              <Button variant='outlined' onClick={refresh} disabled={isPending}>
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }
        }}
      >
        <InsightCard icon='ri-calendar-check-line' label='Bookings' value={String(counts.all)} hint='in this view' />
        <InsightCard icon='ri-group-line' label='Seats reserved' value={String(bookingStats.seats)} hint='active demand' />
        <InsightCard icon='ri-time-line' label='Upcoming' value={String(bookingStats.upcoming)} hint='sessions ahead' />
        <InsightCard icon='ri-apps-line' label='Services' value={String(bookingStats.services)} hint='with bookings' />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }
        }}
      >
        <Card>
          <CardContent>
            <Box className='flex items-start justify-between gap-2 flex-wrap' sx={{ mb: 2 }}>
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Service performance
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Demand by service for the selected booking view.
                </Typography>
              </Box>
              <Chip label={`${serviceStats.length} services`} size='small' color='primary' variant='tonal' />
            </Box>
            {serviceStats.length === 0 ? (
              <Typography color='text.secondary'>Service insights will appear when bookings arrive.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {serviceStats.slice(0, 5).map(service => {
                  const maxSeats = Math.max(1, serviceStats[0]?.seats ?? 1)

                  return (
                    <Box key={service.serviceName}>
                      <Box className='flex items-center justify-between gap-2'>
                        <Typography variant='body2' sx={{ fontWeight: 650 }} noWrap>
                          {service.serviceName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
                          {service.seats} seats · {service.bookings} bookings
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={Math.min(100, (service.seats / maxSeats) * 100)}
                        sx={{ mt: 0.75, height: 7, borderRadius: 99 }}
                      />
                    </Box>
                  )
                })}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box className='flex items-start justify-between gap-2 flex-wrap' sx={{ mb: 2 }}>
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Batch snapshot
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Term enrolments grouped into one clear view.
                </Typography>
              </Box>
              <Chip label={`${batchStats.length} active`} size='small' color='secondary' variant='tonal' />
            </Box>
            {batchStats.length === 0 ? (
              <Typography color='text.secondary'>No term batches in the selected booking view.</Typography>
            ) : (
              <Stack spacing={1.25}>
                {batchStats.slice(0, 4).map(batch => (
                  <Box key={`${batch.serviceName}-${batch.startAt}`}>
                    <Typography variant='body2' sx={{ fontWeight: 650 }}>
                      {batch.serviceName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {batch.customerName} · {batch.seats} {batch.seats === 1 ? 'seat' : 'seats'} · {batch.sessions}{' '}
                      sessions
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      Starts {formatDate(batch.startAt, visibleBookings.find(item => item.serviceName === batch.serviceName)?.timezone ?? 'UTC')}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Customer confirmation, request-received, and cancellation emails are sent after each successful status
            change. Configure SMTP in the deployment environment to enable delivery.
          </Typography>

          {visibleBookings.length === 0 ? (
            <Typography color='text.secondary'>
              {filter === 'pending' ? 'There are no bookings waiting for approval.' : 'No bookings to show.'}
            </Typography>
          ) : (
            <>
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                {visibleBookings.map(booking => (
                  <Box
                    key={booking.id}
                    sx={{
                      p: 1.75,
                      borderRadius: 2.5,
                      border: theme => `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Box className='flex items-start justify-between gap-2'>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 700 }} noWrap>
                          {booking.serviceName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {booking.quantity} {booking.quantity === 1 ? 'seat' : 'seats'} · {booking.confirmationCode}
                        </Typography>
                      </Box>
                      <Chip label={statusLabel(booking.status)} size='small' color={statusColor(booking.status)} />
                    </Box>
                    <Divider sx={{ my: 1.25 }} />
                    <Typography variant='body2'>{booking.customerName}</Typography>
                    <Typography variant='caption' color='text.secondary' display='block' noWrap>
                      {booking.customerEmail}
                    </Typography>
                    <Typography variant='body2' sx={{ mt: 1, fontWeight: 600 }}>
                      {formatDate(booking.startAt, booking.timezone)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {booking.timezone}
                    </Typography>
                    <Stack direction='row' spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                      {booking.status === 'pending' ? (
                        <Button size='small' variant='contained' onClick={() => updateStatus(booking, 'confirmed')} disabled={isPending}>
                          Approve
                        </Button>
                      ) : null}
                      {booking.status === 'confirmed' || booking.status === 'pending' ? (
                        <Button size='small' color='error' variant='outlined' onClick={() => setCancelBooking(booking)} disabled={isPending}>
                          Cancel
                        </Button>
                      ) : null}
                      {booking.status === 'confirmed' ? (
                        <Select
                          size='small'
                          value=''
                          displayEmpty
                          onChange={event => {
                            const value = event.target.value as 'attended' | 'no_show'

                            if (value) updateStatus(booking, value)
                          }}
                          IconComponent={() => null}
                          renderValue={() => (
                            <Box className='flex items-center gap-1'>
                              More <i className='ri-arrow-down-s-line' />
                            </Box>
                          )}
                          inputProps={{ 'aria-label': 'More booking actions' }}
                          sx={{ minWidth: 78 }}
                        >
                          <MenuItem value='attended'>Attended</MenuItem>
                          <MenuItem value='no_show'>No-show</MenuItem>
                        </Select>
                      ) : null}
                      {booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'cancelled' ? (
                        <Button size='small' variant='text' onClick={() => sendNotification(booking)} disabled={isPending}>
                          Email
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Session</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>When</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell align='right'>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleBookings.map(booking => (
                        <TableRow key={booking.id} hover>
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {booking.serviceName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {booking.quantity} {booking.quantity === 1 ? 'seat' : 'seats'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>{booking.customerName}</Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {booking.customerEmail}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDate(booking.startAt, booking.timezone)}
                            <Typography variant='caption' color='text.secondary' display='block'>
                              {booking.timezone}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={statusLabel(booking.status)} size='small' color={statusColor(booking.status)} />
                          </TableCell>
                          <TableCell>{booking.confirmationCode}</TableCell>
                          <TableCell align='right'>
                            <Stack direction='row' spacing={1} justifyContent='flex-end'>
                              {booking.status === 'pending' ? (
                                <Button
                                  size='small'
                                  variant='contained'
                                  onClick={() => updateStatus(booking, 'confirmed')}
                                  disabled={isPending}
                                >
                                  Approve
                                </Button>
                              ) : null}
                              {booking.status === 'confirmed' || booking.status === 'pending' ? (
                                <Button
                                  size='small'
                                  color='error'
                                  variant='outlined'
                                  onClick={() => setCancelBooking(booking)}
                                  disabled={isPending}
                                >
                                  Cancel
                                </Button>
                              ) : null}
                              {booking.status === 'confirmed' ? (
                                <Select
                                  size='small'
                                  value=''
                                  displayEmpty
                                  onChange={event => {
                                    const value = event.target.value as 'attended' | 'no_show'

                                    if (value) updateStatus(booking, value)
                                  }}
                                  IconComponent={() => null}
                                  renderValue={() => (
                                    <Box className='flex items-center gap-1'>
                                      More <i className='ri-arrow-down-s-line' />
                                    </Box>
                                  )}
                                  inputProps={{ 'aria-label': 'More booking actions' }}
                                  sx={{ minWidth: 78 }}
                                >
                                  <MenuItem value='attended'>Attended</MenuItem>
                                  <MenuItem value='no_show'>No-show</MenuItem>
                                </Select>
                              ) : null}
                              {booking.status === 'pending' ||
                              booking.status === 'confirmed' ||
                              booking.status === 'cancelled' ? (
                                <Button
                                  size='small'
                                  variant='text'
                                  onClick={() => sendNotification(booking)}
                                  disabled={isPending}
                                >
                                  Email
                                </Button>
                              ) : null}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(cancelBooking)} onClose={() => setCancelBooking(null)} fullWidth maxWidth='sm'>
        <DialogTitle>Cancel booking?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3 }}>This releases the reserved seat and emails the customer immediately.</Typography>
          <TextField
            label='Reason (optional)'
            value={cancelReason}
            onChange={event => setCancelReason(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelBooking(null)}>Keep booking</Button>
          <Button color='error' variant='contained' onClick={confirmCancellation} disabled={isPending}>
            Cancel booking
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
