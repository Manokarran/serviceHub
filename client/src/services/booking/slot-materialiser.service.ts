import type { Types } from 'mongoose'

import { DEFAULT_SCHEDULE_HORIZON_DAYS, resolveSlotInterval } from '@/lib/constants/service'
import { AppError } from '@/lib/errors'
import { addDays, getCalendarDateInZone, toIsoDate, weekdayOf, zonedWallClockToUtc } from '@/lib/utils/timezone'
import type { IServiceDocument } from '@/models/service'
import type { IServiceScheduleDocument } from '@/models/service-schedule'
import { serviceRepository, serviceScheduleRepository, serviceSlotRepository } from '@/repositories'
import type { SlotUpsertInput } from '@/repositories'
import { getPublicHolidayDates } from './public-holidays.service'

/** Safety valve so a careless rule cannot generate an unbounded collection. */
const MAX_SLOTS_PER_RUN = 5000

export type MaterialiseConflict = {
  slotId: string
  startAt: string
  seatsBooked: number
}

export type MaterialiseResult = {
  generated: number
  created: number
  updated: number
  removed: number
  horizonDays: number
  truncated: boolean
  nextAvailableAt: string | null
  conflicts: MaterialiseConflict[]
}

/** Appointment start times inside an availability window, never overlapping. */
function rollingStarts(
  windowStart: number,
  windowEnd: number,
  durationMinutes: number,
  intervalMinutes: number
): number[] {
  const starts: number[] = []

  for (let start = windowStart; start + durationMinutes <= windowEnd; start += intervalMinutes) {
    starts.push(start)
  }

  return starts
}

function slotKey(staffUserId: Types.ObjectId | null, startAt: Date): string {
  return `${staffUserId ? staffUserId.toString() : 'any'}@${startAt.getTime()}`
}

export class SlotMaterialiserService {
  private buildSlots(
    service: IServiceDocument,
    schedules: IServiceScheduleDocument[],
    horizonDays: number
  ): { slots: SlotUpsertInput[]; truncated: boolean } {
    const timezone = service.timezone
    const today = getCalendarDateInZone(new Date(), timezone)
    const now = Date.now()
    const durationMs = service.durationMinutes * 60_000

    const holidayDates = service.excludePublicHolidays
      ? getPublicHolidayDates(timezone, today.year, addDays(today, horizonDays).year)
      : new Set<string>()

    const interval = resolveSlotInterval(
      service.durationMinutes,
      service.bufferAfterMinutes,
      service.slotIntervalMinutes
    )

    const deduped = new Map<string, SlotUpsertInput>()
    let truncated = false

    for (const schedule of schedules) {
      const weekdays = new Set(schedule.byWeekday)
      const exceptions = new Set(schedule.exceptionDates ?? [])
      const capacity = service.slotMode === 'rolling' ? 1 : schedule.capacity
      const staffUserId = schedule.staffUserId ?? null
      const isOneOff = Boolean(schedule.validFrom && schedule.validTo)

      for (let offset = 0; offset <= horizonDays; offset += 1) {
        const date = addDays(today, offset)
        const dateKey = toIsoDate(date)

        if (service.scheduleStartDate && dateKey < service.scheduleStartDate) {
          continue
        }

        if (service.scheduleEndDate && dateKey > service.scheduleEndDate) {
          continue
        }

        if (!weekdays.has(weekdayOf(date))) {
          continue
        }

        if (exceptions.has(dateKey)) {
          continue
        }

        if (!isOneOff && holidayDates.has(dateKey)) {
          continue
        }

        const startMinutesList =
          service.slotMode === 'fixed'
            ? [schedule.startMinutes]
            : rollingStarts(schedule.startMinutes, schedule.endMinutes, service.durationMinutes, interval)

        for (const startMinutes of startMinutesList) {
          const startAt = zonedWallClockToUtc(date, startMinutes, timezone)

          if (startAt.getTime() <= now) {
            continue
          }

          if (schedule.validFrom && startAt < schedule.validFrom) {
            continue
          }

          if (schedule.validTo && startAt > schedule.validTo) {
            continue
          }

          const key = slotKey(staffUserId, startAt)

          if (deduped.has(key)) {
            continue
          }

          if (deduped.size >= MAX_SLOTS_PER_RUN) {
            truncated = true
            break
          }

          deduped.set(key, {
            tenantId: service.tenantId,
            serviceId: service._id,
            scheduleId: schedule._id,
            staffUserId,
            startAt,
            endAt: new Date(startAt.getTime() + durationMs),
            timezone,
            capacity
          })
        }

        if (truncated) {
          break
        }
      }

      if (truncated) {
        break
      }
    }

    return { slots: [...deduped.values()], truncated }
  }

  /**
   * Expand a service's active schedule rules into concrete slots across the
   * rolling horizon, then prune anything the rules no longer produce.
   */
  async materialiseService(tenantId: string, serviceId: string): Promise<MaterialiseResult> {
    const service = await serviceRepository.findById(tenantId, serviceId)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const materialisedAt = new Date()
    const from = new Date()

    const schedules =
      service.status === 'archived' ? [] : await serviceScheduleRepository.listActiveByServiceId(tenantId, serviceId)

    const horizonDays = service.scheduleHorizonDays ?? DEFAULT_SCHEDULE_HORIZON_DAYS

    const { slots, truncated } = this.buildSlots(service, schedules, horizonDays)

    const { created, updated } = await serviceSlotRepository.bulkUpsert(slots, materialisedAt)

    const conflictDocs = await serviceSlotRepository.findStaleWithBookings(serviceId, from, materialisedAt)
    const removed = await serviceSlotRepository.pruneStale(serviceId, from, materialisedAt)

    const next = await serviceSlotRepository.findNextAvailable(tenantId, serviceId)

    await serviceRepository.setNextAvailableAt(serviceId, next ? next.startAt : null)

    return {
      generated: slots.length,
      created,
      updated,
      removed,
      horizonDays,
      truncated,
      nextAvailableAt: next ? next.startAt.toISOString() : null,
      conflicts: conflictDocs.map(doc => ({
        slotId: doc._id.toString(),
        startAt: doc.startAt.toISOString(),
        seatsBooked: doc.seatsBooked
      }))
    }
  }

  /** Preview the appointment start times a window would produce, without writing. */
  previewRollingStarts(
    windowStart: number,
    windowEnd: number,
    durationMinutes: number,
    bufferAfterMinutes: number,
    slotIntervalMinutes?: number | null
  ): number[] {
    const interval = resolveSlotInterval(durationMinutes, bufferAfterMinutes, slotIntervalMinutes)

    return rollingStarts(windowStart, windowEnd, durationMinutes, interval)
  }
}

export const slotMaterialiserService = new SlotMaterialiserService()
