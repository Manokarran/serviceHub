import { Types, type ClientSession } from 'mongoose'

import { connectDB } from '@/lib/db'
import {
  BookingModel,
  type BookingStatus,
  type BookingSummary,
  type IBooking,
  type IBookingDocument,
  type BookingInsights,
  type BookingServiceInsight
} from '@/models/booking'
import { ServiceModel } from '@/models/service'
import { ServiceSlotModel } from '@/models/service-slot'

function toBookingSummary(doc: IBookingDocument): BookingSummary {
  return {
    id: doc._id.toString(),
    serviceId: doc.serviceId.toString(),
    slotId: doc.slotId.toString(),
    quantity: doc.quantity,
    termEnrollmentId: doc.termEnrollmentId ?? null,
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

export class BookingRepository {
  async findByIdempotencyKey(
    tenantId: string,
    customerId: string,
    idempotencyKey: string
  ): Promise<IBookingDocument | null> {
    await connectDB()

    return BookingModel.findOne({ tenantId, customerId, idempotencyKey }).exec()
  }

  async reserveSeats(
    tenantId: string,
    slotId: string,
    quantity: number
  ): Promise<{ slotId: string; serviceId: string } | null> {
    await connectDB()

    const slot = await ServiceSlotModel.findOneAndUpdate(
      {
        _id: slotId,
        tenantId,
        status: 'scheduled',
        $expr: {
          $lte: [{ $add: ['$seatsBooked', '$seatsHeld', quantity] }, '$capacity']
        }
      },
      { $inc: { seatsBooked: quantity } },
      { returnDocument: 'after', projection: { _id: 1, serviceId: 1 } }
    ).exec()

    if (!slot) {
      return null
    }

    return { slotId: slot._id.toString(), serviceId: slot.serviceId.toString() }
  }

  async releaseSeats(tenantId: string, slotId: string, quantity: number): Promise<void> {
    await connectDB()

    await ServiceSlotModel.updateOne({ _id: slotId, tenantId }, { $inc: { seatsBooked: -quantity } }).exec()
  }

  async create(data: Partial<IBooking>): Promise<IBookingDocument> {
    await connectDB()

    return BookingModel.create(data)
  }

  async createMany(data: Partial<IBooking>[], session: ClientSession): Promise<IBookingDocument[]> {
    await connectDB()

    return BookingModel.insertMany(data, { session })
  }

  async findByTermEnrollmentId(tenantId: string, termEnrollmentId: string): Promise<IBookingDocument[]> {
    await connectDB()

    return BookingModel.find({ tenantId, termEnrollmentId }).sort({ startAt: 1 }).exec()
  }

  async reserveTermSeats(
    tenantId: string,
    slotIds: string[],
    quantity: number,
    session: ClientSession
  ): Promise<boolean> {
    await connectDB()

    if (new Set(slotIds).size !== slotIds.length) {
      return false
    }

    for (const slotId of slotIds) {
      const updated = await ServiceSlotModel.updateOne(
        {
          _id: slotId,
          tenantId,
          status: 'scheduled',
          $expr: {
            $lte: [{ $add: ['$seatsBooked', '$seatsHeld', quantity] }, '$capacity']
          }
        },
        { $inc: { seatsBooked: quantity } },
        { session }
      ).exec()

      if (updated.modifiedCount !== 1) {
        return false
      }
    }

    return true
  }

  async transitionTermStatus(
    tenantId: string,
    termEnrollmentId: string,
    fromStatuses: BookingStatus[],
    status: BookingStatus,
    changedBy?: string,
    reason?: string
  ): Promise<IBookingDocument[]> {
    await connectDB()

    const historyEntry: Record<string, unknown> = {
      status,
      changedAt: new Date(),
      changedBy: changedBy && Types.ObjectId.isValid(changedBy) ? new Types.ObjectId(changedBy) : null
    }

    if (reason?.trim()) {
      historyEntry.reason = reason.trim()
    }

    await BookingModel.updateMany(
      { tenantId, termEnrollmentId, status: { $in: fromStatuses } },
      {
        $set: { status },
        $push: { statusHistory: historyEntry }
      },
      { runValidators: true }
    ).exec()

    return BookingModel.find({ tenantId, termEnrollmentId }).sort({ startAt: 1 }).exec()
  }

  async cancelTermWithSeatRelease(
    tenantId: string,
    termEnrollmentId: string,
    fromStatuses: BookingStatus[],
    changedBy?: string,
    reason?: string
  ): Promise<IBookingDocument[]> {
    const db = await connectDB()
    const session = await db.startSession()
    let updated: IBookingDocument[] = []

    const historyEntry: Record<string, unknown> = {
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: changedBy && Types.ObjectId.isValid(changedBy) ? new Types.ObjectId(changedBy) : null
    }

    if (reason?.trim()) {
      historyEntry.reason = reason.trim()
    }

    try {
      await session.withTransaction(async () => {
        const bookings = await BookingModel.find({
          tenantId,
          termEnrollmentId,
          status: { $in: fromStatuses }
        })
          .session(session)
          .exec()

        for (const booking of bookings) {
          const changed = await BookingModel.updateOne(
            { _id: booking._id, tenantId, status: { $in: fromStatuses } },
            {
              $set: { status: 'cancelled' },
              $push: { statusHistory: historyEntry }
            },
            { runValidators: true, session }
          ).exec()

          if (changed.modifiedCount !== 1) {
            throw new Error('Unable to update the term booking')
          }

          const released = await ServiceSlotModel.updateOne(
            {
              _id: booking.slotId,
              tenantId,
              seatsBooked: { $gte: booking.quantity }
            },
            { $inc: { seatsBooked: -booking.quantity } },
            { session }
          ).exec()

          if (released.modifiedCount !== 1) {
            throw new Error('Unable to release the term booking seats')
          }
        }

        updated = await BookingModel.find({ tenantId, termEnrollmentId }).sort({ startAt: 1 }).session(session).exec()
      })

      return updated
    } finally {
      await session.endSession()
    }
  }

  async listByTenant(tenantId: string, options: { from?: Date; limit?: number } = {}): Promise<BookingSummary[]> {
    await connectDB()

    const query: Record<string, unknown> = { tenantId }

    if (options.from) {
      query.startAt = { $gte: options.from }
    }

    const bookings = await BookingModel.find(query)
      .sort({ startAt: options.from ? 1 : -1, createdAt: -1 })
      .limit(options.limit ?? 500)
      .exec()

    return bookings.map(toBookingSummary)
  }

  async getTenantInsights(tenantId: string, rangeDays = 30): Promise<BookingInsights> {
    await connectDB()

    const emptySeries = Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date()

      date.setUTCHours(0, 0, 0, 0)
      date.setUTCDate(date.getUTCDate() + index)

      return {
        date: date.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date),
        seatsOffered: 0,
        seatsBooked: 0
      }
    })

    if (!Types.ObjectId.isValid(tenantId)) {
      return {
        rangeDays,
        totalBookings: 0,
        seatsBooked: 0,
        seatsOffered: 0,
        utilization: 0,
        pendingRequests: 0,
        revenueMinor: 0,
        series: emptySeries,
        services: []
      }
    }

    const tenantObjectId = new Types.ObjectId(tenantId)
    const now = new Date()
    const end = new Date(now)

    end.setUTCDate(end.getUTCDate() + rangeDays)

    const [slotRows, bookingRows] = await Promise.all([
      ServiceSlotModel.aggregate<{
        _id: { date: string; serviceId: Types.ObjectId }
        seatsOffered: number
        seatsBooked: number
      }>([
        {
          $match: {
            tenantId: tenantObjectId,
            status: 'scheduled',
            startAt: { $gte: now, $lt: end }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$startAt', timezone: 'UTC' } },
              serviceId: '$serviceId'
            },
            seatsOffered: { $sum: '$capacity' },
            seatsBooked: { $sum: '$seatsBooked' }
          }
        }
      ]).exec(),
      BookingModel.aggregate<{
        _id: Types.ObjectId
        bookings: number
        seatsBooked: number
        revenueMinor: number
        pendingRequests: number
      }>([
        {
          $match: {
            tenantId: tenantObjectId,
            status: { $nin: ['cancelled', 'removed'] },
            startAt: { $gte: now, $lt: end }
          }
        },
        {
          $group: {
            _id: '$serviceId',
            bookings: { $sum: 1 },
            seatsBooked: { $sum: '$quantity' },
            revenueMinor: { $sum: '$priceAmountMinor' },
            pendingRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]).exec()
    ])

    const slotByDay = new Map<string, { seatsOffered: number; seatsBooked: number }>()
    const slotByService = new Map<string, { seatsOffered: number; seatsBooked: number }>()

    for (const row of slotRows) {
      const day = slotByDay.get(row._id.date) ?? { seatsOffered: 0, seatsBooked: 0 }

      day.seatsOffered += row.seatsOffered
      day.seatsBooked += row.seatsBooked
      slotByDay.set(row._id.date, day)

      const serviceId = row._id.serviceId.toString()
      const service = slotByService.get(serviceId) ?? { seatsOffered: 0, seatsBooked: 0 }

      service.seatsOffered += row.seatsOffered
      service.seatsBooked += row.seatsBooked
      slotByService.set(serviceId, service)
    }

    const serviceIds = [
      ...new Set([...slotByService.keys(), ...bookingRows.map(row => row._id.toString())])
    ].filter(Types.ObjectId.isValid)

    const services = await ServiceModel.find({ tenantId: tenantObjectId, _id: { $in: serviceIds } })
      .select({ _id: 1, name: 1 })
      .lean()
      .exec()

    const serviceNames = new Map(services.map(service => [service._id.toString(), service.name]))

    const bookingByService = new Map(bookingRows.map(row => [row._id.toString(), row]))

    const serviceInsights: BookingServiceInsight[] = serviceIds
      .map(serviceId => {
        const slots = slotByService.get(serviceId) ?? { seatsOffered: 0, seatsBooked: 0 }
        const bookings = bookingByService.get(serviceId)
        const seatsBooked = bookings?.seatsBooked ?? slots.seatsBooked

        return {
          serviceId,
          serviceName: serviceNames.get(serviceId) ?? 'Service',
          bookings: bookings?.bookings ?? 0,
          seatsBooked,
          seatsOffered: slots.seatsOffered,
          utilization: slots.seatsOffered > 0 ? Math.round((seatsBooked / slots.seatsOffered) * 100) : 0
        }
      })
      .sort((a, b) => b.seatsBooked - a.seatsBooked || b.bookings - a.bookings)

    const series = emptySeries.map(point => ({
      ...point,
      ...(slotByDay.get(point.date) ?? {})
    }))

    const seatsOffered = series.reduce((total, point) => total + point.seatsOffered, 0)
    const seatsBooked = bookingRows.reduce((total, row) => total + row.seatsBooked, 0)

    return {
      rangeDays,
      totalBookings: bookingRows.reduce((total, row) => total + row.bookings, 0),
      seatsBooked,
      seatsOffered,
      utilization: seatsOffered > 0 ? Math.round((seatsBooked / seatsOffered) * 100) : 0,
      pendingRequests: bookingRows.reduce((total, row) => total + row.pendingRequests, 0),
      revenueMinor: bookingRows.reduce((total, row) => total + row.revenueMinor, 0),
      series,
      services: serviceInsights
    }
  }

  async listByCustomer(tenantId: string, customerId: string): Promise<BookingSummary[]> {
    await connectDB()

    const bookings = await BookingModel.find({ tenantId, customerId }).sort({ startAt: -1 }).limit(100).exec()

    return bookings.map(toBookingSummary)
  }

  async findById(tenantId: string, bookingId: string, customerId: string): Promise<BookingSummary | null> {
    await connectDB()

    const booking = await BookingModel.findOne({ _id: bookingId, tenantId, customerId }).exec()

    return booking ? toBookingSummary(booking) : null
  }

  async findForTenant(tenantId: string, bookingId: string): Promise<IBookingDocument | null> {
    await connectDB()

    return BookingModel.findOne({ _id: bookingId, tenantId }).exec()
  }

  async markServiceBookingsRemoved(
    tenantId: string,
    serviceId: string,
    changedBy?: string,
    reason = 'The service was removed by the business.'
  ): Promise<IBookingDocument[]> {
    await connectDB()

    const bookings = await BookingModel.find({
      tenantId,
      serviceId,
      status: { $ne: 'removed' }
    }).exec()

    if (bookings.length === 0) {
      return []
    }

    const historyEntry: Record<string, unknown> = {
      status: 'removed',
      changedAt: new Date(),
      changedBy: changedBy && Types.ObjectId.isValid(changedBy) ? new Types.ObjectId(changedBy) : null,
      reason
    }

    await BookingModel.updateMany(
      { tenantId, serviceId, status: { $ne: 'removed' } },
      {
        $set: { status: 'removed' },
        $push: { statusHistory: historyEntry }
      },
      { runValidators: true }
    ).exec()

    return bookings
  }

  async transitionStatus(
    tenantId: string,
    bookingId: string,
    fromStatuses: BookingStatus[],
    status: BookingStatus,
    changedBy?: string,
    reason?: string
  ): Promise<IBookingDocument | null> {
    await connectDB()

    const historyEntry: Record<string, unknown> = {
      status,
      changedAt: new Date(),
      changedBy: changedBy && Types.ObjectId.isValid(changedBy) ? new Types.ObjectId(changedBy) : null
    }

    if (reason?.trim()) {
      historyEntry.reason = reason.trim()
    }

    return BookingModel.findOneAndUpdate(
      { _id: bookingId, tenantId, status: { $in: fromStatuses } },
      {
        $set: { status },
        $push: { statusHistory: historyEntry }
      },
      { returnDocument: 'after', runValidators: true }
    ).exec()
  }

  async cancelWithSeatRelease(
    tenantId: string,
    bookingId: string,
    fromStatuses: BookingStatus[],
    changedBy?: string,
    reason?: string
  ): Promise<IBookingDocument | null> {
    const db = await connectDB()
    const session = await db.startSession()

    const historyEntry: Record<string, unknown> = {
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: changedBy && Types.ObjectId.isValid(changedBy) ? new Types.ObjectId(changedBy) : null
    }

    if (reason?.trim()) {
      historyEntry.reason = reason.trim()
    }

    let updated: IBookingDocument | null = null

    try {
      await session.withTransaction(async () => {
        updated = await BookingModel.findOneAndUpdate(
          { _id: bookingId, tenantId, status: { $in: fromStatuses } },
          {
            $set: { status: 'cancelled' },
            $push: { statusHistory: historyEntry }
          },
          { returnDocument: 'after', runValidators: true, session }
        ).exec()

        if (!updated) {
          return
        }

        const released = await ServiceSlotModel.updateOne(
          {
            _id: updated.slotId,
            tenantId,
            seatsBooked: { $gte: updated.quantity }
          },
          { $inc: { seatsBooked: -updated.quantity } },
          { session }
        ).exec()

        if (released.modifiedCount !== 1) {
          throw new Error('Unable to release the booking seats')
        }
      })

      return updated
    } finally {
      await session.endSession()
    }
  }
}

export const bookingRepository = new BookingRepository()
