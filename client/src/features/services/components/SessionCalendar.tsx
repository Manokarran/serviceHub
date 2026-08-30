'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
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
  type ServiceSlotMode,
  type ServiceSlotStatus,
  SERVICE_SLOT_STATUS_LABELS
} from '@/lib/constants/service'
import type { ServiceSlotSummary } from '@/models/service-slot'
import { addDays, getCalendarDateInZone, toIsoDate } from '@/lib/utils/timezone'

import { formatClock } from '../utils/format'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Props = {
  slots: ServiceSlotSummary[]
  timezone: string
  slotMode: ServiceSlotMode
  durationMinutes: number
  defaultCapacity: number
  scheduleHorizonDays: number
  disabled?: boolean
  onStatusChange: (slotId: string, status: ServiceSlotStatus) => void
  onAddOneOff: (date: string, startMinutes: number, capacity: number) => void
}

function calendarDateKey(value: Date): string {
  return toIsoDate({
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate()
  })
}

export function SessionCalendar({
  slots,
  timezone,
  slotMode,
  durationMinutes,
  defaultCapacity,
  scheduleHorizonDays,
  disabled = false,
  onStatusChange,
  onAddOneOff
}: Props) {
  const theme = useTheme()
  const today = getCalendarDateInZone(new Date(), timezone)
  const todayKey = toIsoDate(today)
  const latestDateKey = toIsoDate(addDays(today, scheduleHorizonDays))
  const [monthCursor, setMonthCursor] = useState(() => new Date(Date.UTC(today.year, today.month - 1, 1)))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [startTime, setStartTime] = useState('09:00')
  const [capacity, setCapacity] = useState(defaultCapacity)

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: timezone
  }).format(monthCursor)

  const days = useMemo(() => {
    const year = monthCursor.getUTCFullYear()
    const month = monthCursor.getUTCMonth()
    const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const firstDayMondayIndex = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
    const cells: Array<number | null> = Array.from({ length: firstDayMondayIndex }, () => null)

    for (let day = 1; day <= count; day += 1) {
      cells.push(day)
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    return cells
  }, [monthCursor])

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, ServiceSlotSummary[]>()

    for (const slot of slots) {
      const dateParts = getCalendarDateInZone(new Date(slot.startAt), timezone)
      const key = toIsoDate(dateParts)

      grouped.set(key, [...(grouped.get(key) ?? []), slot])
    }

    for (const daySlots of grouped.values()) {
      daySlots.sort((a, b) => a.startAt.localeCompare(b.startAt))
    }

    return grouped
  }, [slots, timezone])

  const shiftMonth = (amount: number) => {
    setMonthCursor(previous => new Date(Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth() + amount, 1)))
  }

  const openOneOffDialog = (date: string) => {
    setSelectedDate(date)
    setCapacity(defaultCapacity)
  }

  const closeOneOffDialog = () => setSelectedDate(null)

  const saveOneOff = () => {
    if (!selectedDate) {
      return
    }

    const [hours, minutes] = startTime.split(':').map(Number)

    onAddOneOff(selectedDate, hours * 60 + minutes, slotMode === 'rolling' ? 1 : capacity)
    closeOneOffDialog()
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Box>
          <Typography variant='h6'>Monthly sessions</Typography>
          <Typography variant='body2' color='text.secondary'>
            Pause or remove individual sessions without changing the recurring schedule.
          </Typography>
        </Box>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ ml: { sm: 'auto' } }}>
          <Button size='small' variant='outlined' onClick={() => shiftMonth(-1)} disabled={disabled}>
            Previous
          </Button>
          <Typography variant='subtitle2' sx={{ minWidth: 132, textAlign: 'center' }}>
            {monthLabel}
          </Typography>
          <Button size='small' variant='outlined' onClick={() => shiftMonth(1)} disabled={disabled}>
            Next
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1 }}>
        {WEEKDAYS.map(day => (
          <Typography
            key={day}
            variant='caption'
            color='text.secondary'
            sx={{ px: 1, py: 1, fontWeight: 600, textAlign: 'center' }}
          >
            {day}
          </Typography>
        ))}

        {days.map((day, index) => {
          const key = day === null ? `empty-${index}` : calendarDateKey(new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth(), day)))
          const daySlots = day === null ? [] : slotsByDay.get(key) ?? []
          const isSelectable = day !== null && key >= todayKey && key <= latestDateKey
          const isToday = key === todayKey

          return (
            <Box
              key={key}
              sx={{
                minHeight: { xs: 90, sm: 136 },
                p: 1,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: day === null ? alpha(theme.palette.action.hover, 0.35) : 'background.paper',
                opacity: day === null || !isSelectable ? 0.55 : 1
              }}
            >
              {day !== null ? (
                <Stack spacing={1}>
                  <Typography
                    variant='caption'
                    sx={{
                      alignSelf: 'flex-start',
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'primary.main' : 'text.secondary',
                      bgcolor: isToday ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                    }}
                  >
                    {day}
                  </Typography>
                  <Button
                    size='small'
                    variant='text'
                    onClick={() => openOneOffDialog(key)}
                    disabled={disabled || !isSelectable}
                    sx={{ minWidth: 0, alignSelf: 'flex-start', px: 0.5, fontSize: 10 }}
                  >
                    {isSelectable ? '+ Session' : 'Unavailable'}
                  </Button>
                  <Stack spacing={0.75}>
                    {daySlots.map(slot => {
                      const isScheduled = slot.status === 'scheduled'
                      const isPaused = slot.status === 'paused'

                      return (
                        <Box
                          key={slot.id}
                          sx={{
                            p: 1,
                            borderRadius: 0.75,
                            bgcolor: isScheduled
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha(theme.palette.text.disabled, 0.08),
                            border: `1px solid ${
                              isScheduled ? alpha(theme.palette.primary.main, 0.28) : theme.palette.divider
                            }`
                          }}
                        >
                          <Typography variant='caption' sx={{ display: 'block', fontWeight: 700 }}>
                            {formatClock(slot.startAt, timezone)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>
                            {isScheduled
                              ? `${slot.seatsAvailable}/${slot.capacity} available`
                              : SERVICE_SLOT_STATUS_LABELS[slot.status]}
                          </Typography>
                          {!disabled ? (
                            <Stack direction='row' spacing={0.5} sx={{ mt: 0.5 }}>
                              {isScheduled ? (
                                <Button
                                  size='small'
                                  color='secondary'
                                  onClick={() => onStatusChange(slot.id, 'paused')}
                                  sx={{ minWidth: 0, px: 0.5, fontSize: 10 }}
                                >
                                  Pause
                                </Button>
                              ) : isPaused ? (
                                <Button
                                  size='small'
                                  color='primary'
                                  onClick={() => onStatusChange(slot.id, 'scheduled')}
                                  sx={{ minWidth: 0, px: 0.5, fontSize: 10 }}
                                >
                                  Resume
                                </Button>
                              ) : null}
                              {isScheduled || isPaused ? (
                                <Button
                                  size='small'
                                  color='error'
                                  onClick={() => onStatusChange(slot.id, 'cancelled')}
                                  sx={{ minWidth: 0, px: 0.5, fontSize: 10 }}
                                >
                                  Remove
                                </Button>
                              ) : null}
                            </Stack>
                          ) : null}
                        </Box>
                      )
                    })}
                  </Stack>
                </Stack>
              ) : null}
            </Box>
          )
        })}
      </Box>

      <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
        <Chip size='small' color='primary' variant='tonal' label='Scheduled' />
        <Chip size='small' variant='tonal' label='Paused' />
        <Chip size='small' variant='tonal' label='Removed' />
      </Stack>

      <Dialog open={Boolean(selectedDate)} onClose={closeOneOffDialog} fullWidth maxWidth='xs'>
        <DialogTitle>Add a one-off session</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              Add a session for {selectedDate}. This will not change your weekly availability.
            </Typography>
            <TextField
              type='time'
              label='Start time'
              value={startTime}
              onChange={event => setStartTime(event.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {slotMode === 'fixed' ? (
              <TextField
                select
                type='number'
                label='Seats'
                value={capacity}
                onChange={event => setCapacity(Number(event.target.value))}
                fullWidth
              >
                {Array.from({ length: Math.max(1, Math.min(defaultCapacity, 20)) }, (_, index) => index + 1).map(
                  seats => (
                    <MenuItem key={seats} value={seats}>
                      {seats} {seats === 1 ? 'seat' : 'seats'}
                    </MenuItem>
                  )
                )}
              </TextField>
            ) : null}
            <Typography variant='caption' color='text.secondary'>
              The service duration is {durationMinutes} minutes. Timezone: {timezone}.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeOneOffDialog}>Cancel</Button>
          <Button variant='contained' onClick={saveOneOff} disabled={!startTime}>
            Add session
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
