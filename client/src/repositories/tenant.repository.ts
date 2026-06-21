import { connectDB } from '@/lib/db'
import { TenantModel, type ITenantDocument } from '@/models/tenant'

export class TenantRepository {
  async findById(id: string): Promise<ITenantDocument | null> {
    await connectDB()

    return TenantModel.findById(id).exec()
  }

  async findBySlug(slug: string): Promise<ITenantDocument | null> {
    await connectDB()

    return TenantModel.findOne({ slug: slug.toLowerCase() }).exec()
  }

  async create(data: Pick<ITenantDocument, 'name' | 'slug'>): Promise<ITenantDocument> {
    await connectDB()

    return TenantModel.create(data)
  }

  async deleteById(id: string): Promise<void> {
    await connectDB()

    await TenantModel.findByIdAndDelete(id).exec()
  }
}

export const tenantRepository = new TenantRepository()
