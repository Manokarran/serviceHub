import { connectDB } from '@/lib/db'
import { WaitlistEntryModel, type IWaitlistEntry, type IWaitlistEntryDocument } from '@/models/waitlist'

export class WaitlistRepository {
  async findByCustomerAndSlot(
    tenantId: string,
    slotId: string,
    customerId: string
  ): Promise<IWaitlistEntryDocument | null> {
    await connectDB()

    return WaitlistEntryModel.findOne({ tenantId, slotId, customerId }).exec()
  }

  async create(data: Partial<IWaitlistEntry>): Promise<IWaitlistEntryDocument> {
    await connectDB()

    return WaitlistEntryModel.create(data)
  }

  async deleteByServiceId(tenantId: string, serviceId: string): Promise<void> {
    await connectDB()

    await WaitlistEntryModel.deleteMany({ tenantId, serviceId }).exec()
  }
}

export const waitlistRepository = new WaitlistRepository()
