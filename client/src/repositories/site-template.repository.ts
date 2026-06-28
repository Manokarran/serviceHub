import { connectDB } from '@/lib/db'
import { SiteTemplateModel, type ISiteTemplateDocument } from '@/models/site-template'

export class SiteTemplateRepository {
  async findById(id: string): Promise<ISiteTemplateDocument | null> {
    await connectDB()

    return SiteTemplateModel.findById(id).exec()
  }

  async findBySlug(slug: string): Promise<ISiteTemplateDocument | null> {
    await connectDB()

    return SiteTemplateModel.findOne({ slug }).exec()
  }

  async listPublished(): Promise<ISiteTemplateDocument[]> {
    await connectDB()

    return SiteTemplateModel.find({ status: 'published' })
      .sort({ sortOrder: 1, name: 1 })
      .exec()
  }

  async listAll(): Promise<ISiteTemplateDocument[]> {
    await connectDB()

    return SiteTemplateModel.find({ status: { $ne: 'archived' } })
      .sort({ sortOrder: 1, name: 1 })
      .exec()
  }

  async create(data: Partial<ISiteTemplateDocument>): Promise<ISiteTemplateDocument> {
    await connectDB()

    return SiteTemplateModel.create(data)
  }

  async updateById(
    id: string,
    updates: Partial<ISiteTemplateDocument>
  ): Promise<ISiteTemplateDocument | null> {
    await connectDB()

    return SiteTemplateModel.findByIdAndUpdate(id, { $set: updates }, { returnDocument: 'after', runValidators: true }).exec()
  }

  async incrementUsageCount(id: string): Promise<void> {
    await connectDB()

    await SiteTemplateModel.updateOne({ _id: id }, { $inc: { usageCount: 1 } }).exec()
  }

  async archive(id: string): Promise<ISiteTemplateDocument | null> {
    return this.updateById(id, { status: 'archived' })
  }
}

export const siteTemplateRepository = new SiteTemplateRepository()
