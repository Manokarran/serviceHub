import { connectDB } from '@/lib/db'
import { SiteCustomerModel, type ISiteCustomerDocument } from '@/models/site-customer'

export class SiteCustomerRepository {
  async findByTenantAndGoogleId(tenantId: string, googleId: string): Promise<ISiteCustomerDocument | null> {
    await connectDB()

    return SiteCustomerModel.findOne({ tenantId, googleId }).exec()
  }

  async findById(tenantId: string, customerId: string): Promise<ISiteCustomerDocument | null> {
    await connectDB()

    return SiteCustomerModel.findOne({ _id: customerId, tenantId, isActive: true }).exec()
  }

  async create(data: Partial<ISiteCustomerDocument>): Promise<ISiteCustomerDocument> {
    await connectDB()

    return SiteCustomerModel.create(data)
  }

  async updateProfile(
    tenantId: string,
    customerId: string,
    data: { name?: string; email?: string; phone?: string; image?: string }
  ): Promise<ISiteCustomerDocument | null> {
    await connectDB()

    return SiteCustomerModel.findOneAndUpdate(
      { _id: customerId, tenantId },
      { $set: { ...data, lastLoginAt: new Date() } },
      { returnDocument: 'after' }
    ).exec()
  }
}

export const siteCustomerRepository = new SiteCustomerRepository()
