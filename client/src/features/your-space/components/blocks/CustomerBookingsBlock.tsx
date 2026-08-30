'use client'

import { useEffect, useMemo, useState } from 'react'

import { signIn, useSession } from 'next-auth/react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import type { BookingSummary } from '@/models/booking'
import { formatDateTime, formatMoney } from '@/features/services/utils/format'
import { usePublicTenantSlug } from '../../hooks/usePublicTenantSlug'
import { getSiteButtonSx } from '../../utils/siteStylesHelpers'
import { useSiteStyles } from '../SiteStylesScope'
import type { CustomerBookingsBlockProps } from '../../types'

import { ChromeBlockBackground } from './ChromeBlockBackground'

type Props = {
  props: CustomerBookingsBlockProps
}

function formatBookingDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone
  }).format(new Date(iso))
}

function formatBookingTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    timeZone
  }).format(new Date(iso))
}

function formatBookingTiming(group: BookingSummary[], timeZone: string): string {
  const first = group[0]

  if (!first || group.length === 1) {
    return first ? formatDateTime(first.startAt, timeZone) : ''
  }

  const last = group[group.length - 1]
  const firstDate = formatBookingDate(first.startAt, timeZone)
  const lastDate = formatBookingDate(last.startAt, timeZone)
  const dateRange = firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`

  return `${group.length} classes · ${dateRange} · ${formatBookingTime(first.startAt, timeZone)}`
}

export function CustomerBookingsBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const { data: session, status: sessionStatus } = useSession()
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const bookingGroups = useMemo(() => {
    const groups = new Map<string, BookingSummary[]>()

    for (const booking of bookings) {
      const key = booking.termEnrollmentId ?? booking.id

      groups.set(key, [...(groups.get(key) ?? []), booking])
    }

    return [...groups.entries()]
      .map(([key, group]) => ({
        key,
        bookings: [...group].sort((a, b) => a.startAt.localeCompare(b.startAt))
      }))
      .sort((a, b) => a.bookings[0].startAt.localeCompare(b.bookings[0].startAt))
  }, [bookings])

  const isCustomerForTenant = session?.user?.context === 'customer' && session.user.tenantSlug === tenantSlug

  useEffect(() => {
    if (isCustomerForTenant) {
      void fetch('/api/public/booking/context', { method: 'DELETE' })
    }
  }, [isCustomerForTenant])

  useEffect(() => {
    if (!isCustomerForTenant) {
      setBookings([])
      setShowAll(false)

      return
    }

    let active = true

    setLoading(true)

    fetch(`/api/public/bookings?tenantSlug=${encodeURIComponent(tenantSlug)}`)
      .then(response => response.json() as Promise<{ bookings?: BookingSummary[]; error?: string }>)
      .then(result => {
        if (!active) {
          return
        }

        if (!result.bookings) {
          setError(result.error ?? 'Unable to load bookings')

          return
        }

        setBookings(result.bookings)
      })
      .catch(() => {
        if (active) {
          setError('Unable to load bookings')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [isCustomerForTenant, tenantSlug])

  const startSignIn = async () => {
    const response = await fetch('/api/public/booking/context', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tenantSlug })
    })

    if (response.ok) {
      await signIn('google', { callbackUrl: window.location.href })
    } else {
      setError('Unable to start Google sign-in')
    }
  }

  return (
    <ChromeBlockBackground
      component='section'
      props={props}
      fallbackColor={siteStyles.colors.background}
      sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 7 } }}
      contentSx={{ width: '100%' }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'flex-end' }}
            justifyContent='space-between'
          >
            <Box sx={{ textAlign: props.alignment }}>
              <Typography
                variant='overline'
                sx={{ color: siteStyles.colors.accent, fontWeight: 750, letterSpacing: '0.12em' }}
              >
                Member dashboard
              </Typography>
              <Typography variant='h3' sx={{ mt: 0.25, fontWeight: 800, letterSpacing: '-0.03em' }}>
                {props.title}
              </Typography>
              <Typography color='text.secondary' sx={{ mt: 0.75 }}>
                {props.subtitle}
              </Typography>
            </Box>
            {isCustomerForTenant && bookings.length > 0 ? (
              <Stack direction='row' spacing={1} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 92,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: alpha(siteStyles.colors.accent, 0.1),
                    textAlign: 'center'
                  }}
                >
                  <Typography variant='h6' sx={{ color: siteStyles.colors.accent, fontWeight: 800 }}>
                    {bookingGroups.length}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    bookings
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 92,
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: alpha(siteStyles.colors.text, 0.06),
                    textAlign: 'center'
                  }}
                >
                  <Typography variant='h6' sx={{ fontWeight: 800 }}>
                    {bookings.length}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    sessions
                  </Typography>
                </Box>
              </Stack>
            ) : null}
          </Stack>
          {error ? <Alert severity='error'>{error}</Alert> : null}
          {!isCustomerForTenant ? (
            <Card
              variant='outlined'
              sx={{
                background: `linear-gradient(135deg, ${alpha(siteStyles.colors.background, 0.68)} 0%, ${alpha(siteStyles.colors.accent, 0.1)} 100%)`,
                backdropFilter: 'blur(14px)',
                borderColor: alpha(siteStyles.colors.text, 0.14),
                boxShadow: `0 16px 36px ${alpha(siteStyles.colors.text, 0.1)}`
              }}
            >
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ sm: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      borderRadius: 2,
                      color: siteStyles.colors.accent,
                      bgcolor: alpha(siteStyles.colors.accent, 0.12)
                    }}
                  >
                    <i className='ri-calendar-check-line' style={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h6'>Your schedule, all in one place</Typography>
                    <Typography color='text.secondary' sx={{ mt: 0.5 }}>
                      Sign in to view your appointments, class terms, and session details.
                    </Typography>
                  </Box>
                  <Button
                    variant='contained'
                    onClick={startSignIn}
                    disabled={sessionStatus === 'loading'}
                    sx={getSiteButtonSx('primary', siteStyles)}
                  >
                    Continue with Google
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : loading ? (
            <Typography color='text.secondary'>Loading your bookings…</Typography>
          ) : bookings.length === 0 ? (
            <Card
              variant='outlined'
              sx={{
                background: `linear-gradient(135deg, ${alpha(siteStyles.colors.background, 0.68)} 0%, ${alpha(siteStyles.colors.accent, 0.08)} 100%)`,
                backdropFilter: 'blur(14px)',
                borderColor: alpha(siteStyles.colors.text, 0.14)
              }}
            >
              <CardContent>
                <Stack spacing={1} alignItems='center' sx={{ py: 2, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      color: siteStyles.colors.accent,
                      bgcolor: alpha(siteStyles.colors.accent, 0.12)
                    }}
                  >
                    <i className='ri-calendar-line' style={{ fontSize: 26 }} />
                  </Box>
                  <Typography variant='h6'>Your next booking starts here</Typography>
                  <Typography color='text.secondary'>
                    Confirmed and requested bookings will appear in this space.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <>
              <Stack direction='row' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='h6' sx={{ fontWeight: 750 }}>
                    Upcoming schedule
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Your next sessions and enrolments
                  </Typography>
                </Box>
                {bookingGroups.length > 5 ? (
                  <Button
                    size='small'
                    variant='text'
                    onClick={() => setShowAll(value => !value)}
                    sx={getSiteButtonSx('tertiary', siteStyles)}
                  >
                    {showAll ? 'Show less' : `View all (${bookingGroups.length})`}
                  </Button>
                ) : null}
              </Stack>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2
                }}
              >
                {(showAll ? bookingGroups : bookingGroups.slice(0, 5)).map(({ key, bookings: group }) => {
                  const booking = group[0]
                  const isMultiSession = group.length > 1

                  const statusLabel =
                    booking.status === 'removed' ? 'service removed' : booking.status.replace(/_/g, ' ')

                  const statusSx =
                    booking.status === 'confirmed'
                      ? { bgcolor: alpha('#16a34a', 0.14), color: '#15803d' }
                      : booking.status === 'removed'
                        ? { bgcolor: alpha('#d97706', 0.14), color: '#b45309' }
                        : { bgcolor: alpha(siteStyles.colors.text, 0.08), color: siteStyles.colors.text }

                  return (
                    <Card
                      key={key}
                      variant='outlined'
                      sx={{
                        gridColumn: isMultiSession ? { md: '1 / -1' } : undefined,
                        background: `linear-gradient(145deg, ${alpha(siteStyles.colors.background, 0.74)} 0%, ${alpha(siteStyles.colors.accent, 0.09)} 100%)`,
                        backdropFilter: 'blur(14px) saturate(120%)',
                        borderColor: alpha(siteStyles.colors.text, 0.14),
                        boxShadow: `0 12px 28px ${alpha(siteStyles.colors.text, 0.1)}`,
                        transition: 'transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: siteStyles.colors.accent,
                          boxShadow: `0 18px 34px ${alpha(siteStyles.colors.accent, 0.2)}`
                        }
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction='row' spacing={1.5} alignItems='center'>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                borderRadius: 2,
                                color: siteStyles.colors.accent,
                                bgcolor: alpha(siteStyles.colors.accent, 0.12)
                              }}
                            >
                              <i
                                className={isMultiSession ? 'ri-calendar-schedule-line' : 'ri-calendar-check-line'}
                                style={{ fontSize: 22 }}
                              />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant='caption'
                                sx={{
                                  color: siteStyles.colors.accent,
                                  fontWeight: 750,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em'
                                }}
                              >
                                {isMultiSession ? 'Term enrolment' : 'Appointment'}
                              </Typography>
                              <Typography variant='h6' noWrap sx={{ fontWeight: 750 }}>
                                {booking.serviceName}
                              </Typography>
                            </Box>
                            <Chip
                              size='small'
                              label={statusLabel}
                              sx={{ ...statusSx, fontWeight: 650, textTransform: 'capitalize' }}
                            />
                          </Stack>
                          {booking.status === 'removed' ? (
                            <Alert severity='warning' sx={{ py: 0 }}>
                              This service was removed by the business, so this booking is no longer available.
                            </Alert>
                          ) : null}
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                              gap: 1
                            }}
                          >
                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha(siteStyles.colors.text, 0.045) }}>
                              <Typography variant='caption' color='text.secondary'>
                                {isMultiSession ? 'Schedule' : 'Date & time'}
                              </Typography>
                              <Typography variant='body2' sx={{ mt: 0.25, fontWeight: 650 }}>
                                {formatBookingTiming(group, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha(siteStyles.colors.text, 0.045) }}>
                              <Typography variant='caption' color='text.secondary'>
                                {isMultiSession ? 'Attendance' : 'Seats'}
                              </Typography>
                              <Typography variant='body2' sx={{ mt: 0.25, fontWeight: 650 }}>
                                {isMultiSession
                                  ? `${group.length} classes`
                                  : `${booking.quantity} ${booking.quantity === 1 ? 'seat' : 'seats'}`}
                              </Typography>
                            </Box>
                            <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: alpha(siteStyles.colors.text, 0.045) }}>
                              <Typography variant='caption' color='text.secondary'>
                                Investment
                              </Typography>
                              <Typography variant='body2' sx={{ mt: 0.25, fontWeight: 650 }}>
                                {formatMoney(booking.priceAmountMinor, booking.currency)}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider />
                          <Typography variant='caption' color='text.secondary'>
                            Booking reference: <strong>{booking.confirmationCode}</strong>
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  )
                })}
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </ChromeBlockBackground>
  )
}
