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

export function BookingsPageClient({ initialBookings }: Props) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<BookingFilter>('all')
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

  const refresh = () => {
    startTransition(async () => {
      const result = await getTenantBookingsAction()

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
            <Stack direction='row' spacing={1} sx={{ overflowX: 'auto' }}>
              {FILTERS.map(item => (
                <Button
                  key={item.value}
                  variant={filter === item.value ? 'contained' : 'outlined'}
                  onClick={() => setFilter(item.value)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {item.label} ({counts[item.value]})
                </Button>
              ))}
            </Stack>
            <Button variant='outlined' onClick={refresh} disabled={isPending}>
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

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
                              renderValue={() => 'More'}
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
