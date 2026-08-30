import { connectDB } from '@/lib/db'
import { ServiceModel, type IService, type IServiceDocument, type ServiceSummary } from '@/models/service'

export function toServiceSummary(doc: IServiceDocument): ServiceSummary {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    tagline: doc.tagline ?? '',
    description: doc.description ?? '',
    coverImageUrl: doc.coverImageUrl ?? '',
    category: doc.category ?? '',
    tags: doc.tags ?? [],

    slotMode: doc.slotMode,
    durationMinutes: doc.durationMinutes,
    slotIntervalMinutes: doc.slotIntervalMinutes ?? null,
    bufferAfterMinutes: doc.bufferAfterMinutes,
    defaultCapacity: doc.defaultCapacity,
    maxSeatsPerBooking: doc.maxSeatsPerBooking,

    bookingMode: doc.bookingMode,
    purchaseMode: doc.purchaseMode ?? 'single_session',
    minNoticeHours: doc.minNoticeHours,
    maxDaysAhead: doc.maxDaysAhead,
    scheduleHorizonDays: doc.scheduleHorizonDays ?? 60,
    scheduleStartDate: doc.scheduleStartDate ?? null,
    scheduleEndDate: doc.scheduleEndDate ?? null,
    cancellationWindowHours: doc.cancellationWindowHours,
    waitlistEnabled: doc.waitlistEnabled,
    excludePublicHolidays: doc.excludePublicHolidays ?? false,

    locationType: doc.locationType,
    locationLabel: doc.locationLabel ?? '',
    timezone: doc.timezone,

    priceModel: doc.priceModel,
    priceAmountMinor: doc.priceAmountMinor,
    currency: doc.currency,

    status: doc.status,
    sortOrder: doc.sortOrder,
    hasBookings: doc.hasBookings,
    nextAvailableAt: doc.nextAvailableAt ? doc.nextAvailableAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  }
}

export class ServiceRepository {
  async listByTenantId(tenantId: string, options: { includeArchived?: boolean } = {}): Promise<IServiceDocument[]> {
    await connectDB()

    const query: Record<string, unknown> = { tenantId }

    if (!options.includeArchived) {
      query.status = { $ne: 'archived' }
    }

    return ServiceModel.find(query).sort({ sortOrder: 1, createdAt: -1 }).exec()
  }

  async findById(tenantId: string, id: string): Promise<IServiceDocument | null> {
    await connectDB()

    return ServiceModel.findOne({ _id: id, tenantId }).exec()
  }

  async findPublishedBySlug(tenantId: string, slug: string): Promise<IServiceDocument | null> {
    await connectDB()

    return ServiceModel.findOne({ tenantId, slug: slug.toLowerCase(), status: 'published' }).exec()
  }

  async listPublishedByTenantId(tenantId: string): Promise<IServiceDocument[]> {
    await connectDB()

    return ServiceModel.find({ tenantId, status: 'published' }).sort({ sortOrder: 1, createdAt: -1 }).exec()
  }

  async slugExists(tenantId: string, slug: string, excludeId?: string): Promise<boolean> {
    await connectDB()

    const query: Record<string, unknown> = { tenantId, slug }

    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    const existing = await ServiceModel.exists(query).exec()

    return Boolean(existing)
  }

  async create(data: Partial<IService>): Promise<IServiceDocument> {
    await connectDB()

    return ServiceModel.create(data)
  }

  async update(tenantId: string, id: string, patch: Partial<IService>): Promise<IServiceDocument | null> {
    await connectDB()

    return ServiceModel.findOneAndUpdate({ _id: id, tenantId }, { $set: patch }, { returnDocument: 'after' }).exec()
  }

  async setNextAvailableAt(serviceId: string, nextAvailableAt: Date | null): Promise<void> {
    await connectDB()

    await ServiceModel.findByIdAndUpdate(serviceId, { $set: { nextAvailableAt } }).exec()
  }

  async markHasBookings(serviceId: string): Promise<void> {
    await connectDB()

    await ServiceModel.findByIdAndUpdate(serviceId, { $set: { hasBookings: true } }).exec()
  }

  async deleteById(tenantId: string, id: string): Promise<boolean> {
    await connectDB()

    const result = await ServiceModel.deleteOne({ _id: id, tenantId }).exec()

    return result.deletedCount > 0
  }

  async countByTenantId(tenantId: string): Promise<number> {
    await connectDB()

    return ServiceModel.countDocuments({ tenantId, status: { $ne: 'archived' } }).exec()
  }
}

export const serviceRepository = new ServiceRepository()
