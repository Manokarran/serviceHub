import { Types } from 'mongoose'

import { AppError } from '@/lib/errors'
import { slugify } from '@/lib/utils/slug'
import type { ServiceSummary } from '@/models/service'
import type { ServiceScheduleSummary } from '@/models/service-schedule'
import type { ServiceSlotStats, ServiceSlotSummary } from '@/models/service-slot'
import type {
  CreateServiceInput,
  CreateOneOffSessionInput,
  SaveSchedulesInput,
  UpdateServiceInput
} from '@/lib/validators/service.validator'
import type { ServiceSlotStatus, ServiceStatus } from '@/lib/constants/service'
import {
  addDays,
  getCalendarDateInZone,
  type CalendarDate,
  toIsoDate,
  weekdayOf,
  zonedWallClockToUtc
} from '@/lib/utils/timezone'
import {
  bookingHoldRepository,
  bookingRepository,
  serviceRepository,
  serviceScheduleRepository,
  serviceSlotRepository,
  tenantRepository,
  toScheduleSummary,
  toServiceSummary,
  toSlotSummary,
  waitlistRepository
} from '@/repositories'

import { emailService, type BookingEmailPayload } from '@/services/email/email.service'

import { slotMaterialiserService, type MaterialiseResult } from './slot-materialiser.service'

export type ServiceListItem = ServiceSummary & {
  scheduleCount: number
  upcomingSlots: number
  seatsOffered: number
}

export type ServiceDetail = {
  service: ServiceSummary
  schedules: ServiceScheduleSummary[]
  upcomingSlots: ServiceSlotSummary[]
  stats: ServiceSlotStats
}

export type DeleteServiceResult = {
  removedBookings: number
  notifiedBookings: number
  notificationFailures: number
}

function toObjectIdOrNull(value: string | null | undefined): Types.ObjectId | null {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null
  }

  return new Types.ObjectId(value)
}

export class ServiceCatalogService {
  private async buildUniqueSlug(tenantId: string, desired: string, excludeId?: string): Promise<string> {
    const base = slugify(desired) || 'service'
    let candidate = base
    let suffix = 2

    while (await serviceRepository.slugExists(tenantId, candidate, excludeId)) {
      candidate = `${base}-${suffix}`
      suffix += 1

      if (suffix > 200) {
        throw new AppError('Could not generate a unique link for this service', 409, 'SLUG_EXHAUSTED')
      }
    }

    return candidate
  }

  async listServices(tenantId: string): Promise<ServiceListItem[]> {
    const services = await serviceRepository.listByTenantId(tenantId, { includeArchived: true })

    return Promise.all(
      services.map(async doc => {
        const serviceId = doc._id.toString()

        const [schedules, stats] = await Promise.all([
          serviceScheduleRepository.listByServiceId(tenantId, serviceId),
          serviceSlotRepository.getStats(tenantId, serviceId)
        ])

        return {
          ...toServiceSummary(doc),
          scheduleCount: schedules.filter(schedule => schedule.isActive).length,
          upcomingSlots: stats.upcoming,
          seatsOffered: stats.seatsOffered
        }
      })
    )
  }

  async getServiceDetail(tenantId: string, serviceId: string): Promise<ServiceDetail> {
    const service = await serviceRepository.findById(tenantId, serviceId)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const [schedules, slots, stats] = await Promise.all([
      serviceScheduleRepository.listByServiceId(tenantId, serviceId),
      serviceSlotRepository.listUpcomingByServiceId(tenantId, serviceId, { limit: 500 }),
      serviceSlotRepository.getStats(tenantId, serviceId)
    ])

    return {
      service: toServiceSummary(service),
      schedules: schedules.map(toScheduleSummary),
      upcomingSlots: slots.map(toSlotSummary),
      stats
    }
  }

  async createService(tenantId: string, userId: string, input: CreateServiceInput): Promise<ServiceSummary> {
    const slug = await this.buildUniqueSlug(tenantId, input.name)
    const isOneToOne = input.slotMode === 'rolling'

    const created = await serviceRepository.create({
      tenantId: new Types.ObjectId(tenantId),
      createdBy: new Types.ObjectId(userId),
      slug,
      name: input.name,
      slotMode: input.slotMode,
      durationMinutes: input.durationMinutes,
      defaultCapacity: isOneToOne ? 1 : input.defaultCapacity,
      purchaseMode: input.purchaseMode,
      maxSeatsPerBooking: 1,
      bufferAfterMinutes: isOneToOne ? 10 : 0,
      timezone: input.timezone,
      currency: input.currency,
      priceModel: input.purchaseMode === 'term' ? 'package' : 'per_session',
      scheduleHorizonDays: input.scheduleHorizonDays,
      scheduleStartDate: input.scheduleStartDate,
      scheduleEndDate: input.scheduleEndDate,
      waitlistEnabled: !isOneToOne,
      excludePublicHolidays: input.excludePublicHolidays,
      status: 'draft'
    })

    return toServiceSummary(created)
  }

  async updateService(tenantId: string, input: UpdateServiceInput): Promise<ServiceSummary> {
    const existing = await serviceRepository.findById(tenantId, input.serviceId)

    if (!existing) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    if (
      existing.hasBookings &&
      (existing.slotMode !== input.slotMode || (existing.purchaseMode ?? 'single_session') !== input.purchaseMode)
    ) {
      throw new AppError(
        'This service already has bookings, so its booking type can no longer change. Archive it and create a new one instead.',
        409,
        'SLOT_MODE_LOCKED'
      )
    }

    const slug =
      input.slug === existing.slug ? existing.slug : await this.buildUniqueSlug(tenantId, input.slug, input.serviceId)

    const updated = await serviceRepository.update(tenantId, input.serviceId, {
      slug,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      coverImageUrl: input.coverImageUrl,
      category: input.category,
      tags: input.tags,

      slotMode: input.slotMode,
      durationMinutes: input.durationMinutes,
      slotIntervalMinutes: input.slotIntervalMinutes ?? undefined,
      bufferAfterMinutes: input.bufferAfterMinutes,
      defaultCapacity: input.defaultCapacity,
      maxSeatsPerBooking: input.maxSeatsPerBooking,

      bookingMode: input.bookingMode,
      purchaseMode: input.purchaseMode,
      minNoticeHours: input.minNoticeHours,
      maxDaysAhead: input.maxDaysAhead,
      scheduleHorizonDays: input.scheduleHorizonDays,
      scheduleStartDate: input.scheduleStartDate,
      scheduleEndDate: input.scheduleEndDate,
      cancellationWindowHours: input.cancellationWindowHours,
      waitlistEnabled: input.waitlistEnabled,
      excludePublicHolidays: input.excludePublicHolidays,

      locationType: input.locationType,
      locationLabel: input.locationLabel,
      timezone: input.timezone,

      priceModel: input.priceModel,
      priceAmountMinor: input.priceModel === 'free' ? 0 : input.priceAmountMinor,
      currency: input.currency
    })

    if (!updated) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    return toServiceSummary(updated)
  }

  async setStatus(tenantId: string, serviceId: string, status: ServiceStatus): Promise<ServiceSummary> {
    const service = await serviceRepository.findById(tenantId, serviceId)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    if (status === 'published') {
      const schedules = await serviceScheduleRepository.listActiveByServiceId(tenantId, serviceId)

      if (schedules.length === 0) {
        throw new AppError('Add at least one time block before publishing this service', 400, 'NO_SCHEDULE')
      }

      if (service.purchaseMode === 'term' && !schedules.some(schedule => !schedule.validFrom && !schedule.validTo)) {
        throw new AppError('Add at least one recurring batch before publishing a term service', 400, 'NO_TERM_BATCH')
      }
    }

    const updated = await serviceRepository.update(tenantId, serviceId, { status })

    if (!updated) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    return toServiceSummary(updated)
  }

  /**
   * Replace a service's schedule rules with the blocks drawn in the editor,
   * then regenerate slots. Blocks keep their id across saves so existing slots
   * stay attached to their rule instead of being torn down and rebuilt.
   */
  async saveSchedules(
    tenantId: string,
    input: SaveSchedulesInput
  ): Promise<{ schedules: ServiceScheduleSummary[]; materialisation: MaterialiseResult }> {
    const service = await serviceRepository.findById(tenantId, input.serviceId)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    if (service.purchaseMode === 'term' && input.blocks.some(block => !block.label.trim())) {
      throw new AppError(
        'Give every term batch a label, such as "5 PM Batch" or "6 PM Batch".',
        400,
        'TERM_BATCH_LABEL_REQUIRED'
      )
    }

    if (service.purchaseMode === 'term' && service.scheduleEndDate) {
      const today = getCalendarDateInZone(new Date(), service.timezone)
      const latestGeneratedDate = toIsoDate(addDays(today, service.scheduleHorizonDays))

      if (service.scheduleEndDate > latestGeneratedDate) {
        throw new AppError(
          'Increase the session generation length so it reaches the end of the term.',
          400,
          'TERM_HORIZON_TOO_SHORT'
        )
      }
    }

    const existing = await serviceScheduleRepository.listByServiceId(tenantId, input.serviceId)
    const keptIds = new Set(input.blocks.map(block => block.id).filter(Boolean) as string[])

    for (const doc of existing) {
      const isOneOff = Boolean(doc.validFrom && doc.validTo)

      if (!keptIds.has(doc._id.toString()) && !isOneOff) {
        await serviceScheduleRepository.deleteById(tenantId, doc._id.toString())
      }
    }

    for (const block of input.blocks) {
      const payload = {
        tenantId: new Types.ObjectId(tenantId),
        serviceId: new Types.ObjectId(input.serviceId),
        label: block.label,
        byWeekday: [...new Set(block.byWeekday)].sort((a, b) => a - b),
        startMinutes: block.startMinutes,
        endMinutes: block.endMinutes,
        capacity: service.slotMode === 'rolling' ? 1 : block.capacity,
        staffUserId: toObjectIdOrNull(block.staffUserId),
        exceptionDates: block.exceptionDates,
        isActive: block.isActive
      }

      if (block.id && Types.ObjectId.isValid(block.id)) {
        await serviceScheduleRepository.update(tenantId, block.id, payload)
      } else {
        await serviceScheduleRepository.create(payload)
      }
    }

    const materialisation = await slotMaterialiserService.materialiseService(tenantId, input.serviceId)
    const schedules = await serviceScheduleRepository.listByServiceId(tenantId, input.serviceId)

    return { schedules: schedules.map(toScheduleSummary), materialisation }
  }

  async createOneOffSession(
    tenantId: string,
    input: CreateOneOffSessionInput
  ): Promise<{ schedule: ServiceScheduleSummary; materialisation: MaterialiseResult }> {
    const service = await serviceRepository.findById(tenantId, input.serviceId)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const [year, month, day] = input.date.split('-').map(Number)
    const calendarDate: CalendarDate = { year, month, day }

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) !== input.date
    ) {
      throw new AppError('Choose a real calendar date', 400, 'INVALID_SESSION_DATE')
    }

    if (input.startMinutes + service.durationMinutes > 24 * 60) {
      throw new AppError('This appointment would run past midnight', 400, 'INVALID_SESSION_TIME')
    }

    const today = getCalendarDateInZone(new Date(), service.timezone)
    const lastDate = addDays(today, service.scheduleHorizonDays ?? 60)

    if (input.date < toIsoDate(today) || input.date > toIsoDate(lastDate)) {
      throw new AppError(
        `Choose a date within the next ${service.scheduleHorizonDays ?? 60} days`,
        400,
        'SESSION_OUTSIDE_HORIZON'
      )
    }

    const startAt = zonedWallClockToUtc(calendarDate, input.startMinutes, service.timezone)

    if (startAt <= new Date()) {
      throw new AppError('Choose a future date and time', 400, 'SESSION_IN_PAST')
    }

    const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000)
    const conflict = await serviceSlotRepository.findOverlapping(tenantId, input.serviceId, startAt, endAt)

    if (conflict) {
      throw new AppError(
        'This time overlaps an existing session. Choose another time or adjust the weekly schedule first.',
        409,
        'SESSION_CONFLICT'
      )
    }

    const schedule = await serviceScheduleRepository.create({
      tenantId: new Types.ObjectId(tenantId),
      serviceId: new Types.ObjectId(input.serviceId),
      label: 'One-off session',
      byWeekday: [weekdayOf(calendarDate)],
      startMinutes: input.startMinutes,
      endMinutes: Math.min(24 * 60, input.startMinutes + service.durationMinutes),
      capacity: service.slotMode === 'rolling' ? 1 : input.capacity,
      staffUserId: null,
      validFrom: zonedWallClockToUtc(calendarDate, 0, service.timezone),
      validTo: zonedWallClockToUtc(calendarDate, 24 * 60 - 1, service.timezone),
      exceptionDates: [],
      isActive: true
    })

    const materialisation = await slotMaterialiserService.materialiseService(tenantId, input.serviceId)

    return { schedule: toScheduleSummary(schedule), materialisation }
  }

  async deleteService(tenantId: string, serviceId: string, changedBy?: string): Promise<DeleteServiceResult> {
    const service = await serviceRepository.findById(tenantId, serviceId)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const affectedBookings = await bookingRepository.markServiceBookingsRemoved(tenantId, serviceId, changedBy)

    await bookingHoldRepository.deleteByServiceId(tenantId, serviceId)
    await waitlistRepository.deleteByServiceId(tenantId, serviceId)

    await serviceSlotRepository.deleteByServiceId(serviceId)
    await serviceScheduleRepository.deleteByServiceId(tenantId, serviceId)

    const deleted = await serviceRepository.deleteById(tenantId, serviceId)

    if (!deleted) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const tenant = await tenantRepository.findById(tenantId)

    const notificationResults = await Promise.all(
      affectedBookings.map(async booking => {
        const payload: BookingEmailPayload = {
          tenantName: tenant?.name ?? 'the business',
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          serviceName: booking.serviceName,
          confirmationCode: booking.confirmationCode,
          startAt: booking.startAt.toISOString(),
          endAt: booking.endAt.toISOString(),
          timezone: booking.timezone,
          quantity: booking.quantity,
          priceAmountMinor: booking.priceAmountMinor,
          currency: booking.currency
        }

        try {
          return await emailService.sendServiceRemovedNotification(booking.customerEmail, payload)
        } catch (error) {
          console.error('[ServiceCatalogService] Failed to notify customer about removed service', error)

          return false
        }
      })
    )

    return {
      removedBookings: affectedBookings.length,
      notifiedBookings: notificationResults.filter(Boolean).length,
      notificationFailures: notificationResults.filter(sent => !sent).length
    }
  }

  async setSlotStatus(tenantId: string, slotId: string, status: ServiceSlotStatus): Promise<ServiceSlotSummary> {
    const slot = await serviceSlotRepository.findById(tenantId, slotId)

    if (!slot) {
      throw new AppError('Session not found', 404, 'SLOT_NOT_FOUND')
    }

    if ((status === 'cancelled' || status === 'paused') && slot.seatsBooked > 0) {
      throw new AppError(
        'This session already has bookings. Cancel the bookings first or keep the session scheduled.',
        409,
        'SLOT_HAS_BOOKINGS'
      )
    }

    const updated = await serviceSlotRepository.updateStatus(tenantId, slotId, status)

    if (!updated) {
      throw new AppError('Session not found', 404, 'SLOT_NOT_FOUND')
    }

    const next = await serviceSlotRepository.findNextAvailable(tenantId, updated.serviceId.toString())

    await serviceRepository.setNextAvailableAt(updated.serviceId.toString(), next ? next.startAt : null)

    return toSlotSummary(updated)
  }
}

export const serviceCatalogService = new ServiceCatalogService()
