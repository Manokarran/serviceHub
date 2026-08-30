import { randomUUID } from 'node:crypto'

import { Types } from 'mongoose'

import { connectDB } from '@/lib/db'
import { AppError } from '@/lib/errors'
import type { BookingInsights, BookingStatus, BookingSummary, IBookingDocument } from '@/models/booking'
import {
  bookingRepository,
  bookingHoldRepository,
  serviceRepository,
  serviceScheduleRepository,
  serviceSlotRepository,
  siteCustomerRepository,
  tenantRepository,
  userRepository,
  waitlistRepository
} from '@/repositories'
import type { CreateBookingInput, CreateTermBookingInput } from '@/lib/validators/booking.validator'
import { emailService, type BookingEmailPayload } from '@/services/email/email.service'
import { groupTermSchedules } from './term-batches'

export class BookingService {
  async createHold(
    tenantId: string,
    serviceId: string,
    slotId: string,
    quantity: number
  ): Promise<{ holdToken: string; expiresAt: string }> {
    const service = await serviceRepository.findById(tenantId, serviceId)
    const slot = await serviceSlotRepository.findById(tenantId, slotId)

    if (!service || !slot || slot.serviceId.toString() !== service._id.toString() || slot.status !== 'scheduled') {
      throw new AppError('This time is no longer available', 409, 'SLOT_UNAVAILABLE')
    }

    if (quantity > service.maxSeatsPerBooking) {
      throw new AppError(`You can book up to ${service.maxSeatsPerBooking} seat(s)`, 400, 'QUANTITY_NOT_ALLOWED')
    }

    const expiredQuantity = await bookingHoldRepository.releaseExpired(tenantId, slotId)

    if (expiredQuantity > 0) {
      await serviceSlotRepository.releaseHeldSeats(tenantId, slotId, expiredQuantity)
    }

    const held = await serviceSlotRepository.holdSeats(tenantId, slotId, quantity)

    if (!held) {
      throw new AppError('This time was just booked by someone else', 409, 'SLOT_UNAVAILABLE')
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const holdToken = randomUUID()

    try {
      await bookingHoldRepository.create({
        tenantId: service.tenantId,
        serviceId: service._id,
        slotId: slot._id,
        holdToken,
        quantity,
        status: 'active',
        expiresAt
      })
    } catch (error) {
      await serviceSlotRepository.releaseHeldSeats(tenantId, slotId, quantity)
      throw error
    }

    return { holdToken, expiresAt: expiresAt.toISOString() }
  }

  async createBooking(
    sessionUser: {
      context?: 'staff' | 'customer'
      customerId?: string
      email?: string | null
      tenantId?: string
    },
    input: CreateBookingInput
  ): Promise<BookingSummary> {
    if (sessionUser.context !== 'customer' || !sessionUser.customerId || !sessionUser.tenantId) {
      throw new AppError('Sign in with Google before booking', 401, 'CUSTOMER_AUTH_REQUIRED')
    }

    const tenantId = sessionUser.tenantId
    const customer = await siteCustomerRepository.findById(tenantId, sessionUser.customerId)

    if (!customer) {
      throw new AppError('Customer account not found', 401, 'CUSTOMER_NOT_FOUND')
    }

    const customerEmail = customer.email?.trim().toLowerCase() || sessionUser.email?.trim().toLowerCase()

    if (!customerEmail) {
      throw new AppError(
        'We could not read your Google email. Please sign in again before booking.',
        422,
        'CUSTOMER_EMAIL_REQUIRED'
      )
    }

    const existingBooking = await bookingRepository.findByIdempotencyKey(
      tenantId,
      customer._id.toString(),
      input.idempotencyKey
    )

    if (existingBooking) {
      return this.toSummary(existingBooking)
    }

    const service = await serviceRepository.findPublishedBySlug(tenantId, input.serviceSlug)

    if (!service) {
      throw new AppError('Service is no longer available', 404, 'SERVICE_NOT_FOUND')
    }

    const slot = await serviceSlotRepository.findById(tenantId, input.slotId)

    if (!slot || slot.serviceId.toString() !== service._id.toString() || slot.status !== 'scheduled') {
      throw new AppError('This time is no longer available', 409, 'SLOT_UNAVAILABLE')
    }

    if (input.quantity > service.maxSeatsPerBooking || input.quantity > slot.capacity) {
      throw new AppError(`You can book up to ${service.maxSeatsPerBooking} seat(s)`, 400, 'QUANTITY_NOT_ALLOWED')
    }

    if (new Date(slot.startAt).getTime() - Date.now() < service.minNoticeHours * 60 * 60 * 1000) {
      throw new AppError('This time is inside the minimum booking notice window', 409, 'MIN_NOTICE')
    }

    if (new Date(slot.startAt).getTime() > Date.now() + service.maxDaysAhead * 24 * 60 * 60 * 1000) {
      throw new AppError('This time is outside the booking window', 409, 'MAX_DAYS_AHEAD')
    }

    await siteCustomerRepository.updateProfile(tenantId, customer._id.toString(), {
      name: input.name,
      email: customerEmail,
      phone: input.phone
    })

    let seatsReserved = false

    if (input.holdToken) {
      const hold = await bookingHoldRepository.findActive(tenantId, input.holdToken)

      if (
        !hold ||
        hold.serviceId.toString() !== service._id.toString() ||
        hold.slotId.toString() !== slot._id.toString() ||
        hold.quantity !== input.quantity
      ) {
        throw new AppError('Your time hold has expired. Please choose the time again.', 409, 'HOLD_EXPIRED')
      }

      seatsReserved = await serviceSlotRepository.convertHeldSeats(tenantId, input.slotId, input.quantity)
      const consumed = seatsReserved ? await bookingHoldRepository.markConsumed(tenantId, input.holdToken) : null

      if (!seatsReserved || !consumed) {
        if (seatsReserved) {
          await bookingRepository.releaseSeats(tenantId, input.slotId, input.quantity)
        }

        throw new AppError('Your time hold has expired. Please choose the time again.', 409, 'HOLD_EXPIRED')
      }
    } else {
      seatsReserved = Boolean(await bookingRepository.reserveSeats(tenantId, input.slotId, input.quantity))

      if (!seatsReserved) {
        throw new AppError('This time was just booked by someone else', 409, 'SLOT_UNAVAILABLE')
      }
    }

    const priceAmountMinor =
      service.priceModel === 'per_session' ? service.priceAmountMinor * input.quantity : service.priceAmountMinor

    try {
      const booking = await bookingRepository.create({
        tenantId: service.tenantId,
        serviceId: service._id,
        slotId: slot._id,
        customerId: customer._id,
        customerEmail,
        customerName: input.name.trim(),
        customerPhone: input.phone.trim(),
        quantity: input.quantity,
        status: service.bookingMode === 'request' ? 'pending' : 'confirmed',
        statusHistory: [
          {
            status: service.bookingMode === 'request' ? 'pending' : 'confirmed',
            changedAt: new Date(),
            changedBy: null
          }
        ],
        confirmationCode: randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase(),
        idempotencyKey: input.idempotencyKey,
        priceAmountMinor,
        currency: service.currency,
        serviceName: service.name,
        startAt: slot.startAt,
        endAt: slot.endAt,
        timezone: slot.timezone
      })

      try {
        await serviceRepository.markHasBookings(service._id.toString())
      } catch (error) {
        console.error('[BookingService] Failed to lock service booking mode', error)
      }

      await this.notifyBookingCreated(booking, service.bookingMode === 'request' ? 'pending' : 'confirmed')

      return this.toSummary(booking)
    } catch (error) {
      if (seatsReserved) {
        await bookingRepository.releaseSeats(tenantId, input.slotId, input.quantity)
      }

      const duplicate = await bookingRepository.findByIdempotencyKey(
        tenantId,
        customer._id.toString(),
        input.idempotencyKey
      )

      if (duplicate) {
        return this.toSummary(duplicate)
      }

      throw error
    }
  }

  async createTermBooking(
    sessionUser: {
      context?: 'staff' | 'customer'
      customerId?: string
      email?: string | null
      tenantId?: string
    },
    input: CreateTermBookingInput
  ): Promise<{ bookings: BookingSummary[]; occurrenceCount: number }> {
    if (sessionUser.context !== 'customer' || !sessionUser.customerId || !sessionUser.tenantId) {
      throw new AppError('Sign in with Google before booking', 401, 'CUSTOMER_AUTH_REQUIRED')
    }

    const tenantId = sessionUser.tenantId
    const customer = await siteCustomerRepository.findById(tenantId, sessionUser.customerId)

    if (!customer) {
      throw new AppError('Customer account not found', 401, 'CUSTOMER_NOT_FOUND')
    }

    const customerEmail = customer.email?.trim().toLowerCase() || sessionUser.email?.trim().toLowerCase()

    if (!customerEmail) {
      throw new AppError(
        'We could not read your Google email. Please sign in again before booking.',
        422,
        'CUSTOMER_EMAIL_REQUIRED'
      )
    }

    const existing = await bookingRepository.findByTermEnrollmentId(tenantId, input.idempotencyKey)

    if (existing.length > 0 && existing[0].customerId.toString() === customer._id.toString()) {
      return { bookings: existing.map(booking => this.toSummary(booking)), occurrenceCount: existing.length }
    }

    const service = await serviceRepository.findPublishedBySlug(tenantId, input.serviceSlug)

    if (!service || service.purchaseMode !== 'term' || service.slotMode !== 'fixed') {
      throw new AppError('This service is not accepting term enrolments', 400, 'TERM_BOOKING_UNAVAILABLE')
    }

    if (!service.scheduleStartDate || !service.scheduleEndDate) {
      throw new AppError('This term is not configured with start and end dates', 400, 'TERM_DATES_REQUIRED')
    }

    const schedules = await serviceScheduleRepository.listActiveByServiceId(tenantId, service._id.toString())
    const batch = groupTermSchedules(schedules).find(item => item.id === input.batchId)

    if (!batch) {
      throw new AppError('Choose a valid class batch', 400, 'TERM_BATCH_INVALID')
    }

    const termEnd = new Date(new Date(`${service.scheduleEndDate}T23:59:59.999Z`).getTime() + 24 * 60 * 60 * 1000)

    const slots = await serviceSlotRepository.listAvailableByServiceId(tenantId, service._id.toString(), {
      from: new Date(),
      to: termEnd,
      limit: 500
    })

    const scheduleIds = new Set(batch.schedules.map(schedule => schedule._id.toString()))

    const batchSlots = slots
      .filter(slot => scheduleIds.has(slot.scheduleId.toString()))
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

    if (batchSlots.length === 0) {
      throw new AppError('This batch has no upcoming classes available', 409, 'TERM_NO_OCCURRENCES')
    }

    if (batchSlots.some(slot => slot.capacity - slot.seatsBooked - slot.seatsHeld < input.quantity)) {
      throw new AppError(
        'This batch no longer has enough seats in every class. Choose another batch or fewer seats.',
        409,
        'TERM_NOT_AVAILABLE'
      )
    }

    if (batchSlots[0].startAt.getTime() - Date.now() < service.minNoticeHours * 60 * 60 * 1000) {
      throw new AppError('This term starts inside the minimum booking notice window', 409, 'MIN_NOTICE')
    }

    await siteCustomerRepository.updateProfile(tenantId, customer._id.toString(), {
      name: input.name,
      email: customerEmail,
      phone: input.phone
    })

    const status = service.bookingMode === 'request' ? 'pending' : 'confirmed'
    const enrollmentId = input.idempotencyKey
    const db = await connectDB()
    const session = await db.startSession()
    let created: Awaited<ReturnType<typeof bookingRepository.createMany>> = []

    try {
      await session.withTransaction(async () => {
        const reserved = await bookingRepository.reserveTermSeats(
          tenantId,
          batchSlots.map(slot => slot._id.toString()),
          input.quantity,
          session
        )

        if (!reserved) {
          throw new AppError('This batch was just booked by someone else', 409, 'TERM_NOT_AVAILABLE')
        }

        created = await bookingRepository.createMany(
          batchSlots.map((slot, index) => ({
            tenantId: service.tenantId,
            serviceId: service._id,
            slotId: slot._id,
            customerId: customer._id,
            customerEmail,
            customerName: input.name.trim(),
            customerPhone: input.phone.trim(),
            quantity: input.quantity,
            termEnrollmentId: enrollmentId,
            status,
            statusHistory: [
              {
                status,
                changedAt: new Date(),
                changedBy: null,
                reason: index === 0 ? `Term enrolment created for ${batchSlots.length} classes.` : undefined
              }
            ],
            confirmationCode: randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase(),
            idempotencyKey: `${input.idempotencyKey}:${index}`,
            priceAmountMinor: index === 0 ? service.priceAmountMinor : 0,
            currency: service.currency,
            serviceName: service.name,
            startAt: slot.startAt,
            endAt: slot.endAt,
            timezone: slot.timezone
          })),
          session
        )
      })
    } finally {
      await session.endSession()
    }

    try {
      await this.notifyTermBookingCreated(created, status)
    } catch (error) {
      console.error('[BookingService] Failed to send term booking email', error)
    }

    try {
      await serviceRepository.markHasBookings(service._id.toString())
    } catch (error) {
      console.error('[BookingService] Failed to lock term service booking mode', error)
    }

    return { bookings: created.map(booking => this.toSummary(booking)), occurrenceCount: created.length }
  }

  private async notifyTermBookingCreated(bookings: IBookingDocument[], status: 'pending' | 'confirmed'): Promise<void> {
    const firstBooking = bookings[0]

    if (!firstBooking) {
      return
    }

    const payload = await this.getBookingEmailPayload(firstBooking)

    try {
      const recipient = await this.resolveTenantNotificationEmail(firstBooking.tenantId.toString())

      if (recipient) {
        await emailService.sendBookingCreatedNotification(recipient, payload, status)
      }
    } catch (error) {
      console.error('[BookingService] Failed to send term owner notification', error)
    }

    await this.notifyTermBookingCustomer(bookings, status)
  }

  private async notifyTermBookingCustomer(
    bookings: IBookingDocument[],
    status: 'pending' | 'confirmed'
  ): Promise<void> {
    const firstBooking = bookings[0]

    if (!firstBooking) {
      return
    }

    const payload = await this.getBookingEmailPayload(firstBooking)

    await emailService.sendTermBookingNotification(firstBooking.customerEmail, payload, bookings.length, status)
  }

  async listBookings(tenantId: string, customerId: string): Promise<BookingSummary[]> {
    return bookingRepository.listByCustomer(tenantId, customerId)
  }

  async joinWaitlist(
    sessionUser: { context?: 'staff' | 'customer'; customerId?: string; tenantId?: string },
    input: CreateBookingInput
  ): Promise<{ success: true }> {
    if (sessionUser.context !== 'customer' || !sessionUser.customerId || !sessionUser.tenantId) {
      throw new AppError('Sign in with Google before joining a waitlist', 401, 'CUSTOMER_AUTH_REQUIRED')
    }

    const service = await serviceRepository.findPublishedBySlug(sessionUser.tenantId, input.serviceSlug)

    if (!service || !service.waitlistEnabled) {
      throw new AppError('Waitlist is not available for this service', 400, 'WAITLIST_DISABLED')
    }

    const slot = await serviceSlotRepository.findById(sessionUser.tenantId, input.slotId)

    if (!slot || slot.serviceId.toString() !== service._id.toString() || slot.status !== 'scheduled') {
      throw new AppError('This session is no longer available', 409, 'SLOT_UNAVAILABLE')
    }

    const seatsAvailable = Math.max(0, slot.capacity - slot.seatsBooked - slot.seatsHeld)

    if (seatsAvailable > 0) {
      throw new AppError('This session still has seats available', 409, 'SLOT_HAS_AVAILABILITY')
    }

    await siteCustomerRepository.updateProfile(sessionUser.tenantId, sessionUser.customerId, {
      name: input.name,
      phone: input.phone
    })

    const existing = await waitlistRepository.findByCustomerAndSlot(
      sessionUser.tenantId,
      input.slotId,
      sessionUser.customerId
    )

    if (!existing) {
      await waitlistRepository.create({
        tenantId: service.tenantId,
        serviceId: service._id,
        slotId: slot._id,
        customerId: new Types.ObjectId(sessionUser.customerId),
        quantity: input.quantity,
        status: 'waiting'
      })
    }

    return { success: true }
  }

  async listTenantBookings(tenantId: string, options: { from?: Date; limit?: number } = {}): Promise<BookingSummary[]> {
    return bookingRepository.listByTenant(tenantId, options)
  }

  async getTenantInsights(tenantId: string, rangeDays = 30): Promise<BookingInsights> {
    return bookingRepository.getTenantInsights(tenantId, rangeDays)
  }

  async sendBookingNotification(tenantId: string, bookingId: string): Promise<void> {
    const booking = await bookingRepository.findForTenant(tenantId, bookingId)

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND')
    }

    const payload = await this.getBookingEmailPayload(booking)
    let sent = false

    if (booking.status === 'pending') {
      sent = await emailService.sendBookingRequestReceived(payload.customerEmail, payload)
    } else if (booking.status === 'confirmed') {
      sent = await emailService.sendBookingConfirmation(payload.customerEmail, payload)
    } else if (booking.status === 'cancelled') {
      sent = await emailService.sendBookingCancellation(payload.customerEmail, payload)
    } else {
      throw new AppError('There is no customer notification for this booking state', 409, 'NO_BOOKING_NOTIFICATION')
    }

    if (!sent) {
      throw new AppError('Email is not configured. Add SMTP settings and try again.', 503, 'EMAIL_NOT_CONFIGURED')
    }
  }

  async updateStatus(
    tenantId: string,
    bookingId: string,
    status: BookingStatus,
    changedBy?: string,
    reason?: string
  ): Promise<BookingSummary> {
    const booking = await bookingRepository.findForTenant(tenantId, bookingId)

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND')
    }

    if (booking.status === status) {
      return this.toSummary(booking)
    }

    const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['cancelled', 'attended', 'no_show'],
      cancelled: [],
      attended: [],
      no_show: [],
      removed: []
    }

    if (!allowedTransitions[booking.status].includes(status)) {
      throw new AppError(
        `A ${booking.status} booking cannot be changed to ${status}`,
        409,
        'INVALID_BOOKING_TRANSITION'
      )
    }

    if (booking.termEnrollmentId && (status === 'confirmed' || status === 'cancelled')) {
      const termBookings = await bookingRepository.findByTermEnrollmentId(tenantId, booking.termEnrollmentId)

      const canUpdateWholeTerm =
        status === 'confirmed'
          ? termBookings.length > 0 && termBookings.every(item => item.status === 'pending')
          : termBookings.length > 0 &&
            termBookings.every(item => item.status === 'pending' || item.status === 'confirmed')

      if (canUpdateWholeTerm) {
        const updatedTerm =
          status === 'cancelled'
            ? await bookingRepository.cancelTermWithSeatRelease(
                tenantId,
                booking.termEnrollmentId,
                ['pending', 'confirmed'],
                changedBy,
                reason
              )
            : await bookingRepository.transitionTermStatus(
                tenantId,
                booking.termEnrollmentId,
                ['pending'],
                'confirmed',
                changedBy,
                reason
              )

        const updatedBooking = updatedTerm.find(item => item._id.toString() === bookingId)

        if (!updatedBooking) {
          throw new AppError(
            'This term booking was updated by someone else. Refresh and try again.',
            409,
            'BOOKING_CHANGED'
          )
        }

        if (status === 'cancelled') {
          await this.notifyBookingCancelled(updatedBooking, reason)
        } else {
          await this.notifyTermBookingCustomer(updatedTerm, 'confirmed')
        }

        return this.toSummary(updatedBooking)
      }
    }

    const updated =
      status === 'cancelled'
        ? await bookingRepository.cancelWithSeatRelease(tenantId, bookingId, [booking.status], changedBy, reason)
        : await bookingRepository.transitionStatus(tenantId, bookingId, [booking.status], status, changedBy, reason)

    if (!updated) {
      throw new AppError('This booking was updated by someone else. Refresh and try again.', 409, 'BOOKING_CHANGED')
    }

    if (status === 'cancelled') {
      await this.notifyBookingCancelled(updated, reason)
    } else if (status === 'confirmed') {
      await this.notifyBookingConfirmed(updated)
    }

    return this.toSummary(updated)
  }

  private async notifyBookingCreated(
    booking: {
      customerId: { toString(): string }
      serviceId: { toString(): string }
      customerEmail: string
      customerName: string
      serviceName: string
      confirmationCode: string
      startAt: Date
      endAt: Date
      timezone: string
      quantity: number
      priceAmountMinor: number
      currency: string
      tenantId: { toString(): string }
    },
    status: 'pending' | 'confirmed'
  ): Promise<void> {
    let payload: BookingEmailPayload | null = null

    try {
      payload = await this.getBookingEmailPayload(booking)
    } catch (error) {
      console.error('[BookingService] Failed to build booking email payload', error)

      return
    }

    if (!payload) {
      return
    }

    try {
      const recipient = await this.resolveTenantNotificationEmail(booking.tenantId.toString())

      if (recipient) {
        await emailService.sendBookingCreatedNotification(recipient, payload, status)
      }
    } catch (error) {
      console.error('[BookingService] Failed to send owner booking notification', error)
    }

    try {
      if (status === 'pending') {
        await emailService.sendBookingRequestReceived(payload.customerEmail, payload)
      } else {
        await emailService.sendBookingConfirmation(payload.customerEmail, payload)
      }
    } catch (error) {
      console.error('[BookingService] Failed to send customer booking email', error)
    }
  }

  private async notifyBookingConfirmed(booking: {
    customerId: { toString(): string }
    serviceId: { toString(): string }
    customerEmail: string
    customerName: string
    serviceName: string
    confirmationCode: string
    startAt: Date
    endAt: Date
    timezone: string
    quantity: number
    priceAmountMinor: number
    currency: string
    tenantId: { toString(): string }
  }): Promise<void> {
    try {
      const payload = await this.getBookingEmailPayload(booking)

      await emailService.sendBookingConfirmation(payload.customerEmail, payload)
    } catch (error) {
      console.error('[BookingService] Failed to send booking confirmation email', error)
    }
  }

  private async notifyBookingCancelled(
    booking: {
      customerId: { toString(): string }
      serviceId: { toString(): string }
      customerEmail?: string
      customerName: string
      serviceName: string
      confirmationCode: string
      startAt: Date
      endAt: Date
      timezone: string
      quantity: number
      priceAmountMinor: number
      currency: string
      tenantId: { toString(): string }
    },
    reason?: string
  ): Promise<void> {
    try {
      const payload = await this.getBookingEmailPayload(booking)

      await emailService.sendBookingCancellation(payload.customerEmail, payload, reason)
    } catch (error) {
      console.error('[BookingService] Failed to send booking cancellation email', error)
    }
  }

  private async resolveTenantNotificationEmail(tenantId: string): Promise<string | null> {
    const tenant = await tenantRepository.findById(tenantId)

    if (!tenant) {
      return null
    }

    const override = tenant.settings?.contactNotificationEmail?.trim()

    if (override) {
      return override.toLowerCase()
    }

    const owner = await userRepository.findOwnerByTenantId(tenantId)

    return owner?.email?.toLowerCase() ?? null
  }

  private async getBookingEmailPayload(booking: {
    customerId: { toString(): string }
    serviceId: { toString(): string }
    customerEmail?: string
    customerName: string
    serviceName: string
    confirmationCode: string
    startAt: Date
    endAt: Date
    timezone: string
    quantity: number
    priceAmountMinor: number
    currency: string
    tenantId: { toString(): string }
  }): Promise<BookingEmailPayload> {
    const customerEmail =
      booking.customerEmail?.trim().toLowerCase() ||
      (await siteCustomerRepository.findById(booking.tenantId.toString(), booking.customerId.toString()))?.email

    if (!customerEmail) {
      throw new AppError('The customer does not have a valid email address', 422, 'CUSTOMER_EMAIL_REQUIRED')
    }

    const tenant = await tenantRepository.findById(booking.tenantId.toString())
    const service = await serviceRepository.findById(booking.tenantId.toString(), booking.serviceId.toString())
    const tenantLocation = tenant?.settings?.location
    const serviceLocationLabel = service?.locationLabel?.trim() ?? ''

    const locationLabel =
      serviceLocationLabel || (service?.locationType === 'in_person' ? tenantLocation?.address?.trim() ?? '' : '')

    const hasCoordinates = Boolean(
      tenantLocation &&
        Number.isFinite(tenantLocation.latitude) &&
        Number.isFinite(tenantLocation.longitude)
    )

    const mapQuery = hasCoordinates && tenantLocation
      ? `${tenantLocation.latitude},${tenantLocation.longitude}`
      : service?.locationType === 'in_person'
        ? locationLabel
        : ''

    const mapUrl = mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
      : undefined

    const onlineUrl =
      service?.locationType === 'online' && /^https?:\/\//i.test(locationLabel) ? locationLabel : undefined

    return {
      tenantName: tenant?.name ?? 'the business',
      customerName: booking.customerName,
      customerEmail,
      serviceName: booking.serviceName,
      confirmationCode: booking.confirmationCode,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      timezone: booking.timezone,
      quantity: booking.quantity,
      priceAmountMinor: booking.priceAmountMinor,
      currency: booking.currency,
      locationType: service?.locationType,
      locationLabel,
      mapUrl,
      onlineUrl
    }
  }

  private toSummary(doc: {
    _id: { toString(): string }
    serviceId: { toString(): string }
    slotId: { toString(): string }
    termEnrollmentId?: string | null
    quantity: number
    status: BookingSummary['status']
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    confirmationCode: string
    priceAmountMinor: number
    currency: string
    serviceName: string
    startAt: Date
    endAt: Date
    timezone: string
    createdAt: Date
  }): BookingSummary {
    return {
      id: doc._id.toString(),
      serviceId: doc.serviceId.toString(),
      slotId: doc.slotId.toString(),
      termEnrollmentId: doc.termEnrollmentId ?? null,
      quantity: doc.quantity,
      status: doc.status,
      customerName: doc.customerName ?? 'Customer',
      customerEmail: doc.customerEmail ?? '',
      customerPhone: doc.customerPhone ?? '',
      confirmationCode: doc.confirmationCode,
      priceAmountMinor: doc.priceAmountMinor,
      currency: doc.currency,
      serviceName: doc.serviceName,
      startAt: doc.startAt.toISOString(),
      endAt: doc.endAt.toISOString(),
      timezone: doc.timezone,
      createdAt: doc.createdAt.toISOString()
    }
  }
}

export const bookingService = new BookingService()
