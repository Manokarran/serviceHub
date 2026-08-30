import { connectDB } from '@/lib/db'
import {
  ServiceScheduleModel,
  type IServiceSchedule,
  type IServiceScheduleDocument,
  type ServiceScheduleSummary
} from '@/models/service-schedule'

export function toScheduleSummary(doc: IServiceScheduleDocument): ServiceScheduleSummary {
  return {
    id: doc._id.toString(),
    serviceId: doc.serviceId.toString(),
    label: doc.label ?? '',
    byWeekday: [...(doc.byWeekday ?? [])].sort((a, b) => a - b),
    startMinutes: doc.startMinutes,
    endMinutes: doc.endMinutes,
    capacity: doc.capacity,
    staffUserId: doc.staffUserId ? doc.staffUserId.toString() : null,
    validFrom: doc.validFrom ? doc.validFrom.toISOString() : null,
    validTo: doc.validTo ? doc.validTo.toISOString() : null,
    exceptionDates: doc.exceptionDates ?? [],
    isActive: doc.isActive
  }
}

export class ServiceScheduleRepository {
  async listByServiceId(tenantId: string, serviceId: string): Promise<IServiceScheduleDocument[]> {
    await connectDB()

    return ServiceScheduleModel.find({ tenantId, serviceId }).sort({ startMinutes: 1 }).exec()
  }

  async listActiveByServiceId(tenantId: string, serviceId: string): Promise<IServiceScheduleDocument[]> {
    await connectDB()

    return ServiceScheduleModel.find({ tenantId, serviceId, isActive: true }).sort({ startMinutes: 1 }).exec()
  }

  async create(data: Partial<IServiceSchedule>): Promise<IServiceScheduleDocument> {
    await connectDB()

    return ServiceScheduleModel.create(data)
  }

  async update(
    tenantId: string,
    id: string,
    patch: Partial<IServiceSchedule>
  ): Promise<IServiceScheduleDocument | null> {
    await connectDB()

    return ServiceScheduleModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: patch },
      { returnDocument: 'after' }
    ).exec()
  }

  async deleteById(tenantId: string, id: string): Promise<boolean> {
    await connectDB()

    const result = await ServiceScheduleModel.deleteOne({ _id: id, tenantId }).exec()

    return result.deletedCount > 0
  }

  async deleteByServiceId(tenantId: string, serviceId: string): Promise<void> {
    await connectDB()

    await ServiceScheduleModel.deleteMany({ tenantId, serviceId }).exec()
  }
}

export const serviceScheduleRepository = new ServiceScheduleRepository()
