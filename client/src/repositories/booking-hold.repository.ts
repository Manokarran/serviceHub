import { connectDB } from '@/lib/db'
import { BookingHoldModel, type IBookingHold, type IBookingHoldDocument } from '@/models/booking-hold'

export class BookingHoldRepository {
  async findActive(tenantId: string, holdToken: string): Promise<IBookingHoldDocument | null> {
    await connectDB()

    return BookingHoldModel.findOne({
      tenantId,
      holdToken,
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).exec()
  }

  async create(data: Partial<IBookingHold>): Promise<IBookingHoldDocument> {
    await connectDB()

    return BookingHoldModel.create(data)
  }

  async releaseExpired(tenantId: string, slotId: string): Promise<number> {
    await connectDB()

    const expired = await BookingHoldModel.find({
      tenantId,
      slotId,
      status: 'active',
      expiresAt: { $lte: new Date() }
    })
      .select('quantity')
      .lean()
      .exec()

    if (expired.length === 0) {
      return 0
    }

    await BookingHoldModel.updateMany(
      { tenantId, slotId, status: 'active', expiresAt: { $lte: new Date() } },
      { $set: { status: 'released' } }
    ).exec()

    return expired.reduce((total, hold) => total + hold.quantity, 0)
  }

  async markConsumed(tenantId: string, holdToken: string): Promise<IBookingHoldDocument | null> {
    await connectDB()

    return BookingHoldModel.findOneAndUpdate(
      { tenantId, holdToken, status: 'active', expiresAt: { $gt: new Date() } },
      { $set: { status: 'consumed' } },
      { returnDocument: 'after' }
    ).exec()
  }

  async release(tenantId: string, holdToken: string): Promise<IBookingHoldDocument | null> {
    await connectDB()

    return BookingHoldModel.findOneAndUpdate(
      { tenantId, holdToken, status: 'active' },
      { $set: { status: 'released' } },
      { returnDocument: 'after' }
    ).exec()
  }

  async deleteByServiceId(tenantId: string, serviceId: string): Promise<void> {
    await connectDB()

    await BookingHoldModel.deleteMany({ tenantId, serviceId }).exec()
  }
}

export const bookingHoldRepository = new BookingHoldRepository()
