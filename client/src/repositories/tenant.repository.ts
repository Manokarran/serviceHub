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

  async updateSettings(id: string, settings: Partial<ITenantDocument['settings']>): Promise<ITenantDocument | null> {
    await connectDB()

    const setPayload: Record<string, unknown> = {}
    const unsetPayload: Record<string, ''> = {}

    for (const [key, value] of Object.entries(settings)) {
      if (value === undefined || value === '') {
        unsetPayload[`settings.${key}`] = ''
      } else {
        setPayload[`settings.${key}`] = value
      }
    }

    const update: Record<string, unknown> = {}

    if (Object.keys(setPayload).length > 0) {
      update.$set = setPayload
    }

    if (Object.keys(unsetPayload).length > 0) {
      update.$unset = unsetPayload
    }

    if (Object.keys(update).length === 0) {
      return TenantModel.findById(id).exec()
    }

    return TenantModel.findByIdAndUpdate(id, update, { returnDocument: 'after' }).exec()
  }
}

export const tenantRepository = new TenantRepository()
