import { AppError } from '@/lib/errors'
import type { ServiceSummary } from '@/models/service'
import type { ServiceSlotSummary } from '@/models/service-slot'
import {
  serviceRepository,
  serviceScheduleRepository,
  serviceSlotRepository,
  tenantRepository,
  toServiceSummary,
  toSlotSummary
} from '@/repositories'
import { groupTermSchedules } from './term-batches'

export type PublicService = ServiceSummary & {
  nextAvailableAt: string | null
}

export type PublicSlot = Pick<
  ServiceSlotSummary,
  'id' | 'serviceId' | 'scheduleId' | 'startAt' | 'endAt' | 'timezone' | 'capacity' | 'seatsBooked' | 'seatsAvailable'
>

export type PublicTermBatch = {
  id: string
  label: string
  weekdays: number[]
  startMinutes: number
  endMinutes: number
  capacity: number
  occurrenceCount: number
  availableOccurrences: number
  minimumSeatsAvailable: number
  slots: PublicSlot[]
}

function toPublicSlot(slot: ServiceSlotSummary): PublicSlot {
  return {
    id: slot.id,
    serviceId: slot.serviceId,
    scheduleId: slot.scheduleId,
    startAt: slot.startAt,
    endAt: slot.endAt,
    timezone: slot.timezone,
    capacity: slot.capacity,
    seatsBooked: slot.seatsBooked,
    seatsAvailable: slot.seatsAvailable
  }
}

export class PublicServiceService {
  private async resolveTenant(tenantSlug: string) {
    const tenant = await tenantRepository.findBySlug(tenantSlug)

    if (!tenant || tenant.status === 'suspended') {
      throw new AppError('Website not found', 404, 'TENANT_NOT_FOUND')
    }

    return tenant
  }

  async listServices(tenantSlug: string): Promise<PublicService[]> {
    const tenant = await this.resolveTenant(tenantSlug)
    const services = await serviceRepository.listPublishedByTenantId(tenant._id.toString())

    return Promise.all(
      services.map(async service => {
        const stats = await serviceSlotRepository.getStats(tenant._id.toString(), service._id.toString())

        return {
          ...toServiceSummary(service),
          nextAvailableAt: stats.nextAvailableAt
        }
      })
    )
  }

  async getService(tenantSlug: string, serviceSlug: string): Promise<PublicService> {
    const tenant = await this.resolveTenant(tenantSlug)
    const service = await serviceRepository.findPublishedBySlug(tenant._id.toString(), serviceSlug)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const stats = await serviceSlotRepository.getStats(tenant._id.toString(), service._id.toString())

    return {
      ...toServiceSummary(service),
      nextAvailableAt: stats.nextAvailableAt
    }
  }

  async listAvailability(
    tenantSlug: string,
    serviceSlug: string,
    options: { from?: Date; to?: Date; limit?: number } = {}
  ): Promise<{ service: PublicService; slots: PublicSlot[]; batches: PublicTermBatch[] }> {
    const tenant = await this.resolveTenant(tenantSlug)
    const service = await serviceRepository.findPublishedBySlug(tenant._id.toString(), serviceSlug)

    if (!service) {
      throw new AppError('Service not found', 404, 'SERVICE_NOT_FOUND')
    }

    const stats = await serviceSlotRepository.getStats(tenant._id.toString(), service._id.toString())

    const slots = await serviceSlotRepository.listAvailableByServiceId(tenant._id.toString(), service._id.toString(), {
      ...options,
      includeFull: true
    })

    const schedules =
      service.purchaseMode === 'term'
        ? await serviceScheduleRepository.listActiveByServiceId(tenant._id.toString(), service._id.toString())
        : []

    const slotSummaries = slots.map(slot => toPublicSlot(toSlotSummary(slot)))

    const batches =
      service.purchaseMode === 'term'
        ? groupTermSchedules(schedules).map(batch => {
            const scheduleIds = new Set(batch.schedules.map(schedule => schedule._id.toString()))
            const batchSlots = slotSummaries.filter(slot => scheduleIds.has(slot.scheduleId))

            return {
              id: batch.id,
              label: batch.schedules[0]?.label?.trim() || 'Class batch',
              weekdays: [...new Set(batch.schedules.flatMap(schedule => schedule.byWeekday))].sort((a, b) => a - b),
              startMinutes: batch.schedules[0]?.startMinutes ?? 0,
              endMinutes: batch.schedules[0]?.endMinutes ?? 0,
              capacity: batch.schedules[0]?.capacity ?? 0,
              occurrenceCount: batchSlots.length,
              availableOccurrences: batchSlots.filter(slot => slot.seatsAvailable > 0).length,
              minimumSeatsAvailable:
                batchSlots.length > 0 ? Math.min(...batchSlots.map(slot => slot.seatsAvailable)) : 0,
              slots: batchSlots
            }
          })
        : []

    return {
      service: {
        ...toServiceSummary(service),
        nextAvailableAt: stats.nextAvailableAt
      },
      slots: slotSummaries,
      batches
    }
  }
}

export const publicServiceService = new PublicServiceService()
