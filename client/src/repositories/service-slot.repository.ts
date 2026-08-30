import { Types } from 'mongoose'

import { connectDB } from '@/lib/db'
import type { ServiceSlotStatus } from '@/lib/constants/service'
import {
  ServiceSlotModel,
  type IServiceSlotDocument,
  type ServiceSlotStats,
  type ServiceSlotSummary
} from '@/models/service-slot'

export type SlotUpsertInput = {
  tenantId: Types.ObjectId
  serviceId: Types.ObjectId
  scheduleId: Types.ObjectId
  staffUserId: Types.ObjectId | null
  startAt: Date
  endAt: Date
  timezone: string
  capacity: number
}

export function toSlotSummary(doc: IServiceSlotDocument): ServiceSlotSummary {
  const seatsAvailable = Math.max(0, doc.capacity - doc.seatsBooked - doc.seatsHeld)

  return {
    id: doc._id.toString(),
    serviceId: doc.serviceId.toString(),
    scheduleId: doc.scheduleId.toString(),
    staffUserId: doc.staffUserId ? doc.staffUserId.toString() : null,
    startAt: doc.startAt.toISOString(),
    endAt: doc.endAt.toISOString(),
    timezone: doc.timezone,
    capacity: doc.capacity,
    seatsBooked: doc.seatsBooked,
    seatsHeld: doc.seatsHeld,
    seatsAvailable,
    status: doc.status
  }
}

export class ServiceSlotRepository {
  async findById(tenantId: string, slotId: string): Promise<IServiceSlotDocument | null> {
    await connectDB()

    return ServiceSlotModel.findOne({ _id: slotId, tenantId }).exec()
  }

  async findOverlapping(
    tenantId: string,
    serviceId: string,
    startAt: Date,
    endAt: Date
  ): Promise<IServiceSlotDocument | null> {
    await connectDB()

    return ServiceSlotModel.findOne({
      tenantId,
      serviceId,
      startAt: { $lt: endAt },
      endAt: { $gt: startAt }
    }).exec()
  }

  /**
   * Upsert generated slots. Existing seat counters are preserved, and capacity
   * is only rewritten on slots that nobody has booked yet — shrinking a session
   * out from under a confirmed booking is never acceptable.
   */
  async bulkUpsert(slots: SlotUpsertInput[], materialisedAt: Date): Promise<{ created: number; updated: number }> {
    await connectDB()

    if (slots.length === 0) {
      return { created: 0, updated: 0 }
    }

    const operations = slots.map(slot => ({
      updateOne: {
        filter: {
          tenantId: slot.tenantId,
          serviceId: slot.serviceId,
          staffUserId: slot.staffUserId,
          startAt: slot.startAt
        },
        update: [
          {
            $set: {
              scheduleId: slot.scheduleId,
              endAt: slot.endAt,
              timezone: slot.timezone,
              materialisedAt,
              capacity: {
                $cond: [{ $gt: [{ $ifNull: ['$seatsBooked', 0] }, 0] }, { $ifNull: ['$capacity', slot.capacity] }, slot.capacity]
              },
              seatsBooked: { $ifNull: ['$seatsBooked', 0] },
              seatsHeld: { $ifNull: ['$seatsHeld', 0] },
              status: { $ifNull: ['$status', 'scheduled'] },
              priceOverrideMinor: { $ifNull: ['$priceOverrideMinor', null] },
              createdAt: { $ifNull: ['$createdAt', '$$NOW'] },
              updatedAt: '$$NOW'
            }
          }
        ],
        upsert: true
      }
    }))

    const result = await ServiceSlotModel.bulkWrite(operations, { ordered: false })

    return {
      created: result.upsertedCount ?? 0,
      updated: result.modifiedCount ?? 0
    }
  }

  /** Remove future slots this run did not regenerate, as long as nobody holds a seat. */
  async pruneStale(serviceId: string, from: Date, materialisedAt: Date): Promise<number> {
    await connectDB()

    const result = await ServiceSlotModel.deleteMany({
      serviceId,
      startAt: { $gte: from },
      seatsBooked: 0,
      seatsHeld: 0,
      materialisedAt: { $lt: materialisedAt }
    }).exec()

    return result.deletedCount ?? 0
  }

  /**
   * Future slots that a rule change orphaned but which already have bookings.
   * These are surfaced to the owner rather than deleted.
   */
  async findStaleWithBookings(serviceId: string, from: Date, materialisedAt: Date): Promise<IServiceSlotDocument[]> {
    await connectDB()

    return ServiceSlotModel.find({
      serviceId,
      startAt: { $gte: from },
      seatsBooked: { $gt: 0 },
      materialisedAt: { $lt: materialisedAt }
    })
      .sort({ startAt: 1 })
      .exec()
  }

  async listUpcomingByServiceId(
    tenantId: string,
    serviceId: string,
    options: { from?: Date; limit?: number } = {}
  ): Promise<IServiceSlotDocument[]> {
    await connectDB()

    const { from = new Date(), limit = 60 } = options

    return ServiceSlotModel.find({
      tenantId,
      serviceId,
      status: { $in: ['scheduled', 'paused', 'cancelled'] },
      startAt: { $gte: from }
    })
      .sort({ startAt: 1 })
      .limit(limit)
      .exec()
  }

  async listAvailableByServiceId(
    tenantId: string,
    serviceId: string,
    options: { from?: Date; to?: Date; limit?: number; includeFull?: boolean } = {}
  ): Promise<IServiceSlotDocument[]> {
    await connectDB()

    const { from = new Date(), to, limit = 500, includeFull = false } = options
    const startAt: Record<string, Date> = { $gte: from }

    if (to) {
      startAt.$lt = to
    }

    const query: Record<string, unknown> = {
      tenantId,
      serviceId,
      status: 'scheduled',
      startAt
    }

    if (!includeFull) {
      query.$expr = { $lt: [{ $add: ['$seatsBooked', '$seatsHeld'] }, '$capacity'] }
    }

    return ServiceSlotModel.find(query)
      .sort({ startAt: 1 })
      .limit(limit)
      .exec()
  }

  async holdSeats(tenantId: string, slotId: string, quantity: number): Promise<boolean> {
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
      { $inc: { seatsHeld: quantity } },
      { returnDocument: 'after', projection: { _id: 1 } }
    ).exec()

    return Boolean(slot)
  }

  async convertHeldSeats(tenantId: string, slotId: string, quantity: number): Promise<boolean> {
    await connectDB()

    const slot = await ServiceSlotModel.findOneAndUpdate(
      { _id: slotId, tenantId, status: 'scheduled', seatsHeld: { $gte: quantity } },
      { $inc: { seatsHeld: -quantity, seatsBooked: quantity } },
      { returnDocument: 'after', projection: { _id: 1 } }
    ).exec()

    return Boolean(slot)
  }

  async releaseHeldSeats(tenantId: string, slotId: string, quantity: number): Promise<void> {
    await connectDB()

    await ServiceSlotModel.updateOne(
      { _id: slotId, tenantId, seatsHeld: { $gte: quantity } },
      { $inc: { seatsHeld: -quantity } }
    ).exec()
  }

  async getStats(tenantId: string, serviceId: string): Promise<ServiceSlotStats> {
    await connectDB()

    if (!Types.ObjectId.isValid(serviceId)) {
      return { total: 0, upcoming: 0, seatsOffered: 0, nextAvailableAt: null }
    }

    const now = new Date()

    const [total, rows, next] = await Promise.all([
      ServiceSlotModel.countDocuments({ tenantId, serviceId }).exec(),
      ServiceSlotModel.aggregate<{ upcoming: number; seatsOffered: number }>([
        {
          $match: {
            serviceId: new Types.ObjectId(serviceId),
            status: 'scheduled',
            startAt: { $gte: now }
          }
        },
        {
          $group: {
            _id: null,
            upcoming: { $sum: 1 },
            seatsOffered: { $sum: '$capacity' }
          }
        }
      ]).exec(),
      this.findNextAvailable(tenantId, serviceId)
    ])

    return {
      total,
      upcoming: rows[0]?.upcoming ?? 0,
      seatsOffered: rows[0]?.seatsOffered ?? 0,
      nextAvailableAt: next ? next.startAt.toISOString() : null
    }
  }

  async findNextAvailable(tenantId: string, serviceId: string): Promise<IServiceSlotDocument | null> {
    await connectDB()

    return ServiceSlotModel.findOne({
      tenantId,
      serviceId,
      status: 'scheduled',
      startAt: { $gte: new Date() },
      $expr: { $lt: [{ $add: ['$seatsBooked', '$seatsHeld'] }, '$capacity'] }
    })
      .sort({ startAt: 1 })
      .exec()
  }

  async hasBookedSlots(serviceId: string): Promise<boolean> {
    await connectDB()

    const existing = await ServiceSlotModel.exists({ serviceId, seatsBooked: { $gt: 0 } }).exec()

    return Boolean(existing)
  }

  async updateStatus(
    tenantId: string,
    slotId: string,
    status: ServiceSlotStatus
  ): Promise<IServiceSlotDocument | null> {
    await connectDB()

    return ServiceSlotModel.findOneAndUpdate(
      { _id: slotId, tenantId },
      { $set: { status } },
      { returnDocument: 'after' }
    ).exec()
  }

  async deleteByServiceId(serviceId: string): Promise<void> {
    await connectDB()

    await ServiceSlotModel.deleteMany({ serviceId }).exec()
  }
}

export const serviceSlotRepository = new ServiceSlotRepository()
