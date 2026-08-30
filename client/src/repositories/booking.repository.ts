import { Types, type ClientSession } from 'mongoose'

import { connectDB } from '@/lib/db'
import {
  BookingModel,
  type BookingStatus,
  type BookingSummary,
  type IBooking,
  type IBookingDocument
} from '@/models/booking'
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

  async listByTenant(tenantId: string): Promise<BookingSummary[]> {
    await connectDB()

    const bookings = await BookingModel.find({ tenantId }).sort({ startAt: 1, createdAt: -1 }).limit(500).exec()

    return bookings.map(toBookingSummary)
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
