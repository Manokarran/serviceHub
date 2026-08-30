'use client'

import { useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  SERVICE_SLOT_GRANULARITY_MINUTES,
  minutesToLabel,
  resolveSlotInterval,
  type ServicePurchaseMode,
  type ServiceSlotMode
} from '@/lib/constants/service'

import { createDraftKey, type ScheduleDraft } from '../services.types'

const DAY_START = 5 * 60
const DAY_END = 23 * 60
const PX_PER_MINUTE = 0.62
const SNAP = SERVICE_SLOT_GRANULARITY_MINUTES

/** Monday-first column order, mapped onto JS weekday numbers. */
const COLUMNS: { weekday: number; label: string; short: string }[] = [
  { weekday: 1, label: 'Monday', short: 'Mon' },
  { weekday: 2, label: 'Tuesday', short: 'Tue' },
  { weekday: 3, label: 'Wednesday', short: 'Wed' },
  { weekday: 4, label: 'Thursday', short: 'Thu' },
  { weekday: 5, label: 'Friday', short: 'Fri' },
  { weekday: 6, label: 'Saturday', short: 'Sat' },
  { weekday: 0, label: 'Sunday', short: 'Sun' }
]

const WEEKDAY_SET = [1, 2, 3, 4, 5]
const ALL_DAYS = [1, 2, 3, 4, 5, 6, 0]

type DragState =
  | { mode: 'create'; key: string; weekday: number; anchor: number }
  | { mode: 'move'; key: string; grabOffset: number; length: number }
  | { mode: 'resize'; key: string }

type Props = {
  drafts: ScheduleDraft[]
  onChange: (drafts: ScheduleDraft[]) => void
  slotMode: ServiceSlotMode
  purchaseMode: ServicePurchaseMode
  durationMinutes: number
  bufferAfterMinutes: number
  slotIntervalMinutes: number | null
  defaultCapacity: number
  disabled?: boolean
}

function snap(minutes: number): number {
  return Math.round(minutes / SNAP) * SNAP
}

function clampToDay(minutes: number): number {
  return Math.max(DAY_START, Math.min(DAY_END, minutes))
}

/**
 * Keep a block inside its lane: it may grow until it touches a neighbour on the
 * same weekday, and is rejected outright if there is no room for one session.
 */
function resolveCollision(drafts: ScheduleDraft[], candidate: ScheduleDraft, minLength: number): ScheduleDraft | null {
  const neighbours = drafts
    .filter(draft => draft.key !== candidate.key && draft.weekday === candidate.weekday)
    .sort((a, b) => a.startMinutes - b.startMinutes)

  let start = clampToDay(candidate.startMinutes)
  let end = clampToDay(candidate.endMinutes)

  for (const neighbour of neighbours) {
    const overlaps = start < neighbour.endMinutes && end > neighbour.startMinutes

    if (!overlaps) {
      continue
    }

    const candidateMidpoint = (start + end) / 2
    const neighbourMidpoint = (neighbour.startMinutes + neighbour.endMinutes) / 2

    if (candidateMidpoint >= neighbourMidpoint) {
      start = Math.max(start, neighbour.endMinutes)
    } else {
      end = Math.min(end, neighbour.startMinutes)
    }
  }

  if (end - start < minLength) {
    return null
  }

  return { ...candidate, startMinutes: start, endMinutes: end }
}

export function SchedulePainter({
  drafts,
  onChange,
  slotMode,
  purchaseMode,
  durationMinutes,
  bufferAfterMinutes,
  slotIntervalMinutes,
  defaultCapacity,
  disabled = false
}: Props) {
  const theme = useTheme()
  const gridRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const isOneToOne = slotMode === 'rolling'
  const isTerm = purchaseMode === 'term'
  const totalMinutes = DAY_END - DAY_START
  const gridHeight = totalMinutes * PX_PER_MINUTE
  const minLength = Math.max(SNAP, durationMinutes)

  const selected = useMemo(() => drafts.find(draft => draft.key === selectedKey) ?? null, [drafts, selectedKey])

  const interval = resolveSlotInterval(durationMinutes, bufferAfterMinutes, slotIntervalMinutes)

  const selectedPreview = useMemo(() => {
    if (!selected || !isOneToOne) {
      return []
    }

    const starts: number[] = []

    for (let start = selected.startMinutes; start + durationMinutes <= selected.endMinutes; start += interval) {
      starts.push(start)
    }

    return starts
  }, [selected, isOneToOne, durationMinutes, interval])

  const totalSessionsPerWeek = useMemo(() => {
    if (!isOneToOne) {
      return drafts.filter(draft => draft.isActive).length
    }

    return drafts
      .filter(draft => draft.isActive)
      .reduce((sum, draft) => sum + Math.max(0, Math.floor((draft.endMinutes - draft.startMinutes) / interval)), 0)
  }, [drafts, isOneToOne, interval])

  const totalSeatsPerWeek = useMemo(
    () =>
      drafts
        .filter(draft => draft.isActive)
        .reduce((sum, draft) => {
          if (!isOneToOne) {
            return sum + draft.capacity
          }

          return sum + Math.max(0, Math.floor((draft.endMinutes - draft.startMinutes) / interval))
        }, 0),
    [drafts, isOneToOne, interval]
  )

  const minutesFromPointer = (clientY: number): number => {
    const rect = gridRef.current?.getBoundingClientRect()

    if (!rect) {
      return DAY_START
    }

    return clampToDay(snap(DAY_START + (clientY - rect.top) / PX_PER_MINUTE))
  }

  const commit = (next: ScheduleDraft[]) => {
    onChange(next.sort((a, b) => a.weekday - b.weekday || a.startMinutes - b.startMinutes))
  }

  const handleColumnPointerDown = (event: React.PointerEvent<HTMLDivElement>, weekday: number) => {
    if (disabled || event.button !== 0) {
      return
    }

    const anchor = minutesFromPointer(event.clientY)
    const key = createDraftKey()

    const candidate: ScheduleDraft = {
      key,
      weekday,
      startMinutes: anchor,
      endMinutes: clampToDay(anchor + minLength),
      capacity: isOneToOne ? 1 : defaultCapacity,
      label: '',
      exceptionDates: [],
      isActive: true
    }

    const resolved = resolveCollision(drafts, candidate, minLength)

    if (!resolved) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { mode: 'create', key, weekday, anchor: resolved.startMinutes }
    setSelectedKey(key)
    commit([...drafts, resolved])
  }

  const handleBlockPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    draft: ScheduleDraft,
    mode: 'move' | 'resize'
  ) => {
    if (disabled || event.button !== 0) {
      return
    }

    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedKey(draft.key)

    if (mode === 'resize') {
      dragRef.current = { mode: 'resize', key: draft.key }

      return
    }

    dragRef.current = {
      mode: 'move',
      key: draft.key,
      grabOffset: minutesFromPointer(event.clientY) - draft.startMinutes,
      length: draft.endMinutes - draft.startMinutes
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current

    if (!drag) {
      return
    }

    const pointerMinutes = minutesFromPointer(event.clientY)
    const current = drafts.find(draft => draft.key === drag.key)

    if (!current) {
      return
    }

    let candidate: ScheduleDraft | null = null

    if (drag.mode === 'create') {
      if (isOneToOne) {
        const start = Math.min(drag.anchor, pointerMinutes)
        const end = Math.max(drag.anchor + minLength, pointerMinutes)

        candidate = { ...current, startMinutes: clampToDay(start), endMinutes: clampToDay(end) }
      } else {
        const start = clampToDay(Math.min(pointerMinutes, DAY_END - minLength))

        candidate = { ...current, startMinutes: start, endMinutes: start + minLength }
      }
    }

    if (drag.mode === 'move') {
      const start = clampToDay(Math.min(pointerMinutes - drag.grabOffset, DAY_END - drag.length))

      candidate = { ...current, startMinutes: start, endMinutes: start + drag.length }
    }

    if (drag.mode === 'resize') {
      const end = clampToDay(Math.max(pointerMinutes, current.startMinutes + minLength))

      candidate = { ...current, endMinutes: end }
    }

    if (!candidate) {
      return
    }

    const resolved = resolveCollision(drafts, candidate, minLength)

    if (!resolved) {
      return
    }

    commit(drafts.map(draft => (draft.key === resolved.key ? resolved : draft)))
  }

  const handlePointerUp = () => {
    dragRef.current = null
  }

  const updateSelected = (patch: Partial<ScheduleDraft>) => {
    if (!selected) {
      return
    }

    const candidate = { ...selected, ...patch }
    const resolved = resolveCollision(drafts, candidate, minLength)

    commit(drafts.map(draft => (draft.key === selected.key ? (resolved ?? draft) : draft)))
  }

  const removeSelected = () => {
    if (!selected) {
      return
    }

    commit(drafts.filter(draft => draft.key !== selected.key))
    setSelectedKey(null)
  }

  const copySelectedTo = (weekdays: number[]) => {
    if (!selected) {
      return
    }

    let next = [...drafts]

    for (const weekday of weekdays) {
      if (weekday === selected.weekday) {
        continue
      }

      const candidate: ScheduleDraft = {
        ...selected,
        key: createDraftKey(),
        id: undefined,
        weekday
      }

      const resolved = resolveCollision(next, candidate, minLength)

      if (resolved) {
        next = [...next, resolved]
      }
    }

    commit(next)
  }

  const clearAll = () => {
    commit([])
    setSelectedKey(null)
  }

  const hourMarks = useMemo(() => {
    const marks: number[] = []

    for (let minutes = DAY_START; minutes <= DAY_END; minutes += 60) {
      marks.push(minutes)
    }

    return marks
  }, [])

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent='space-between'
      >
        <Box>
          <Typography variant='h6'>Weekly availability</Typography>
          <Typography variant='body2' color='text.secondary'>
            {isOneToOne
              ? 'Drag to paint the hours you are open. Appointment times are generated inside each window.'
              : isTerm
                ? 'Draw each batch on every class day and give matching blocks the same label, such as "5 PM Batch".'
                : 'Drag on a day to place a session. Each block becomes one class, repeating every week.'}
          </Typography>
        </Box>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Chip
            size='small'
            variant='tonal'
            color='primary'
            label={`${totalSessionsPerWeek} ${isOneToOne ? 'appointments' : 'sessions'} / week`}
          />
          <Chip size='small' variant='tonal' label={`${totalSeatsPerWeek} seats / week`} />
          {drafts.length > 0 && !disabled ? (
            <Button size='small' color='secondary' onClick={clearAll}>
              Clear all
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        <Box
          sx={{
            flex: '1 1 640px',
            minWidth: 0,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `56px repeat(${COLUMNS.length}, minmax(0, 1fr))`,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: 'action.hover'
            }}
          >
            <Box />
            {COLUMNS.map(column => (
              <Box key={column.weekday} sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant='caption' sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
                  {column.short}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ maxHeight: 560, overflowY: 'auto' }}>
            <Box
              ref={gridRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: `56px repeat(${COLUMNS.length}, minmax(0, 1fr))`,
                height: gridHeight,
                touchAction: 'none',
                userSelect: 'none'
              }}
            >
              <Box sx={{ position: 'relative', borderRight: `1px solid ${theme.palette.divider}` }}>
                {hourMarks.map(minutes => (
                  <Typography
                    key={minutes}
                    variant='caption'
                    color='text.disabled'
                    sx={{
                      position: 'absolute',
                      top: (minutes - DAY_START) * PX_PER_MINUTE - 8,
                      right: 6,
                      fontSize: 11
                    }}
                  >
                    {minutesToLabel(minutes)}
                  </Typography>
                ))}
              </Box>

              {COLUMNS.map(column => (
                <Box
                  key={column.weekday}
                  onPointerDown={event => handleColumnPointerDown(event, column.weekday)}
                  sx={{
                    position: 'relative',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    cursor: disabled ? 'default' : 'crosshair',
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      ${alpha(theme.palette.divider, 0.9)} 0px,
                      ${alpha(theme.palette.divider, 0.9)} 1px,
                      transparent 1px,
                      transparent ${60 * PX_PER_MINUTE}px
                    )`
                  }}
                >
                  {drafts
                    .filter(draft => draft.weekday === column.weekday)
                    .map(draft => {
                      const top = (draft.startMinutes - DAY_START) * PX_PER_MINUTE
                      const height = (draft.endMinutes - draft.startMinutes) * PX_PER_MINUTE
                      const isSelected = draft.key === selectedKey

                      return (
                        <Box
                          key={draft.key}
                          onPointerDown={event => handleBlockPointerDown(event, draft, 'move')}
                          sx={{
                            position: 'absolute',
                            insetInline: 3,
                            top,
                            height,
                            borderRadius: 1,
                            px: 1.5,
                            py: 0.5,
                            overflow: 'hidden',
                            cursor: disabled ? 'default' : 'grab',
                            bgcolor: draft.isActive
                              ? alpha(theme.palette.primary.main, isSelected ? 0.32 : 0.18)
                              : alpha(theme.palette.text.disabled, 0.14),
                            border: `1px solid ${
                              isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4)
                            }`,
                            transition: 'background-color 120ms ease, border-color 120ms ease'
                          }}
                        >
                          <Typography
                            variant='caption'
                            sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3, fontSize: 11 }}
                          >
                            {minutesToLabel(draft.startMinutes)}
                          </Typography>
                          {height > 34 ? (
                            <Typography variant='caption' color='text.secondary' sx={{ fontSize: 10 }}>
                              {isOneToOne ? `${minutesToLabel(draft.endMinutes)}` : `${draft.capacity} seats`}
                            </Typography>
                          ) : null}

                          {isOneToOne && !disabled ? (
                            <Box
                              onPointerDown={event => handleBlockPointerDown(event, draft, 'resize')}
                              sx={{
                                position: 'absolute',
                                insetInline: 0,
                                bottom: 0,
                                height: 8,
                                cursor: 'ns-resize',
                                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.55) : 'transparent'
                              }}
                            />
                          ) : null}
                        </Box>
                      )
                    })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 280px', minWidth: 260 }}>
          {selected ? (
            <Stack spacing={3} sx={{ p: 4, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  {COLUMNS.find(column => column.weekday === selected.weekday)?.label}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {minutesToLabel(selected.startMinutes)} – {minutesToLabel(selected.endMinutes)}
                </Typography>
              </Box>

              <Stack direction='row' spacing={2}>
                <TextField
                  select
                  size='small'
                  fullWidth
                  label='Starts'
                  value={selected.startMinutes}
                  disabled={disabled}
                  onChange={event => {
                    const start = Number(event.target.value)
                    const length = isOneToOne ? selected.endMinutes - selected.startMinutes : minLength

                    updateSelected({ startMinutes: start, endMinutes: clampToDay(start + length) })
                  }}
                >
                  {Array.from({ length: (DAY_END - DAY_START) / SNAP }, (_, index) => DAY_START + index * SNAP).map(
                    minutes => (
                      <MenuItem key={minutes} value={minutes}>
                        {minutesToLabel(minutes)}
                      </MenuItem>
                    )
                  )}
                </TextField>

                {isOneToOne ? (
                  <TextField
                    select
                    size='small'
                    fullWidth
                    label='Until'
                    value={selected.endMinutes}
                    disabled={disabled}
                    onChange={event => updateSelected({ endMinutes: Number(event.target.value) })}
                  >
                    {Array.from({ length: (DAY_END - DAY_START) / SNAP }, (_, index) => DAY_START + (index + 1) * SNAP)
                      .filter(minutes => minutes >= selected.startMinutes + minLength)
                      .map(minutes => (
                        <MenuItem key={minutes} value={minutes}>
                          {minutesToLabel(minutes)}
                        </MenuItem>
                      ))}
                  </TextField>
                ) : (
                  <TextField
                    size='small'
                    fullWidth
                    type='number'
                    label='Seats'
                    value={selected.capacity}
                    disabled={disabled}
                    onChange={event =>
                      updateSelected({ capacity: Math.max(1, Math.min(1000, Number(event.target.value) || 1)) })
                    }
                  />
                )}
              </Stack>

              <TextField
                size='small'
                fullWidth
                label='Label (optional)'
                placeholder={isOneToOne ? 'Morning consultations' : isTerm ? '5 PM Batch' : 'Beginners batch'}
                value={selected.label}
                disabled={disabled}
                onChange={event => updateSelected({ label: event.target.value.slice(0, 120) })}
              />

              {isOneToOne ? (
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Generates {selectedPreview.length} appointment{selectedPreview.length === 1 ? '' : 's'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5, maxHeight: 120, overflowY: 'auto' }}>
                    {selectedPreview.map(minutes => (
                      <Chip key={minutes} size='small' variant='outlined' label={minutesToLabel(minutes)} />
                    ))}
                  </Box>
                </Box>
              ) : null}

              <Divider />

              <Stack spacing={2}>
                <Typography variant='caption' color='text.secondary'>
                  Copy this block to
                </Typography>
                <Stack direction='row' spacing={2}>
                  <Button
                    size='small'
                    variant='outlined'
                    disabled={disabled}
                    onClick={() => copySelectedTo(WEEKDAY_SET)}
                  >
                    Mon–Fri
                  </Button>
                  <Button size='small' variant='outlined' disabled={disabled} onClick={() => copySelectedTo(ALL_DAYS)}>
                    Every day
                  </Button>
                </Stack>
              </Stack>

              <Stack direction='row' spacing={2} justifyContent='space-between' alignItems='center'>
                <Tooltip title='Hide this block without deleting it'>
                  <Button
                    size='small'
                    color='secondary'
                    disabled={disabled}
                    onClick={() => updateSelected({ isActive: !selected.isActive })}
                  >
                    {selected.isActive ? 'Pause' : 'Resume'}
                  </Button>
                </Tooltip>
                <Button size='small' color='error' disabled={disabled} onClick={removeSelected}>
                  Delete
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack
              spacing={2}
              sx={{
                p: 4,
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Typography variant='subtitle2'>Nothing selected</Typography>
              <Typography variant='body2' color='text.secondary'>
                Drag anywhere on the grid to add {isOneToOne ? 'an availability window' : 'a session'}, then click it to
                fine-tune the details.
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  )
}
