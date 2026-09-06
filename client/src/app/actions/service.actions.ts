'use server'

import { revalidatePath } from 'next/cache'

import { requireTenantWorkspace } from '@/lib/auth/require-tenant-workspace'
import { isManagerRole } from '@/lib/constants/roles'
import { hasUnlimitedCredits } from '@/lib/credits/has-unlimited-credits'
import { AppError } from '@/lib/errors'
import {
  createServiceSchema,
  createOneOffSessionSchema,
  saveSchedulesSchema,
  setServiceSlotStatusSchema,
  serviceIdSchema,
  setServiceStatusSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type CreateOneOffSessionInput,
  type SaveSchedulesInput,
  type SetServiceSlotStatusInput,
  type SetServiceStatusInput,
  type UpdateServiceInput
} from '@/lib/validators/service.validator'
import type { ServiceSummary } from '@/models/service'
import type { ServiceScheduleSummary } from '@/models/service-schedule'
import type { ServiceSlotSummary } from '@/models/service-slot'
import {
  serviceCatalogService,
  type DeleteServiceResult,
  type ServiceDetail,
  type ServiceListItem
} from '@/services/booking/service-catalog.service'
import { slotMaterialiserService, type MaterialiseResult } from '@/services/booking/slot-materialiser.service'

type TenantContext = { tenantId: string; userId: string; unlimited: boolean }

type ActionFailure = { success: false; error: string }

type ServicesResult = { success: true; services: ServiceListItem[] } | ActionFailure
type ServiceResult = { success: true; service: ServiceSummary } | ActionFailure
type ServiceDetailResult = { success: true; detail: ServiceDetail } | ActionFailure
type SchedulesResult =
  | { success: true; schedules: ServiceScheduleSummary[]; materialisation: MaterialiseResult }
  | ActionFailure
type MaterialiseActionResult = { success: true; materialisation: MaterialiseResult } | ActionFailure
type SlotStatusResult = { success: true; slot: ServiceSlotSummary } | ActionFailure
type OneOffSessionResult = { success: true; materialisation: MaterialiseResult } | ActionFailure
type DeleteResult = { success: true; deletion: DeleteServiceResult } | ActionFailure

async function requireManagerContext(): Promise<TenantContext> {
  const session = await requireTenantWorkspace()

  if (!session.user.tenantId) {
    throw new AppError('Finish setting up your organization first.', 400, 'NO_TENANT')
  }

  if (!isManagerRole(session.user.role)) {
    throw new AppError('You do not have permission to manage services.', 403, 'FORBIDDEN')
  }

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
    unlimited: hasUnlimitedCredits(session.user)
  }
}

function toFailure(scope: string, error: unknown): ActionFailure {
  if (error instanceof AppError) {
    return { success: false, error: error.message }
  }

  console.error(`[${scope}]`, error)

  return { success: false, error: 'Something went wrong. Please try again.' }
}

export async function getServicesAction(): Promise<ServicesResult> {
  try {
    const { tenantId } = await requireManagerContext()

    return { success: true, services: await serviceCatalogService.listServices(tenantId) }
  } catch (error) {
    return toFailure('getServicesAction', error)
  }
}

export async function getServiceDetailAction(serviceId: string): Promise<ServiceDetailResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = serviceIdSchema.safeParse({ serviceId })

    if (!parsed.success) {
      return { success: false, error: 'Invalid service' }
    }

    return { success: true, detail: await serviceCatalogService.getServiceDetail(tenantId, parsed.data.serviceId) }
  } catch (error) {
    return toFailure('getServiceDetailAction', error)
  }
}

export async function createServiceAction(input: CreateServiceInput): Promise<ServiceResult> {
  try {
    const { tenantId, userId, unlimited } = await requireManagerContext()
    const parsed = createServiceSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid service details' }
    }

    const { creditsService } = await import('@/services/credits')

    await creditsService.assertCanAfford(tenantId, 'service_setup', { unlimited })

    const service = await serviceCatalogService.createService(tenantId, userId, parsed.data)

    try {
      await creditsService.spend({
        tenantId,
        feature: 'service_setup',
        actorUserId: userId,
        description: `Created service “${parsed.data.name}”`,
        metadata: { serviceId: service.id },
        unlimited
      })
    } catch (error) {
      try {
        await serviceCatalogService.deleteService(tenantId, service.id, userId)
      } catch (cleanupError) {
        console.error('[createServiceAction] Failed to roll back service after credit charge', cleanupError)
      }

      throw error
    }

    revalidatePath('/services')

    return { success: true, service }
  } catch (error) {
    return toFailure('createServiceAction', error)
  }
}

export async function updateServiceAction(input: UpdateServiceInput): Promise<ServiceResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = updateServiceSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid service details' }
    }

    const service = await serviceCatalogService.updateService(tenantId, parsed.data)

    revalidatePath('/services')
    revalidatePath(`/services/${parsed.data.serviceId}`)

    return { success: true, service }
  } catch (error) {
    return toFailure('updateServiceAction', error)
  }
}

export async function setServiceStatusAction(input: SetServiceStatusInput): Promise<ServiceResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = setServiceStatusSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: 'Invalid status' }
    }

    const service = await serviceCatalogService.setStatus(tenantId, parsed.data.serviceId, parsed.data.status)

    revalidatePath('/services')
    revalidatePath(`/services/${parsed.data.serviceId}`)

    return { success: true, service }
  } catch (error) {
    return toFailure('setServiceStatusAction', error)
  }
}

export async function saveServiceSchedulesAction(input: SaveSchedulesInput): Promise<SchedulesResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = saveSchedulesSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid schedule' }
    }

    const { schedules, materialisation } = await serviceCatalogService.saveSchedules(tenantId, parsed.data)

    revalidatePath('/services')
    revalidatePath(`/services/${parsed.data.serviceId}`)

    return { success: true, schedules, materialisation }
  } catch (error) {
    return toFailure('saveServiceSchedulesAction', error)
  }
}

export async function createOneOffSessionAction(input: CreateOneOffSessionInput): Promise<OneOffSessionResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = createOneOffSessionSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: 'Choose a valid date and time' }
    }

    const result = await serviceCatalogService.createOneOffSession(tenantId, parsed.data)

    revalidatePath('/services')

    return { success: true, materialisation: result.materialisation }
  } catch (error) {
    return toFailure('createOneOffSessionAction', error)
  }
}

export async function regenerateServiceSlotsAction(serviceId: string): Promise<MaterialiseActionResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = serviceIdSchema.safeParse({ serviceId })

    if (!parsed.success) {
      return { success: false, error: 'Invalid service' }
    }

    const materialisation = await slotMaterialiserService.materialiseService(tenantId, parsed.data.serviceId)

    revalidatePath(`/services/${parsed.data.serviceId}`)

    return { success: true, materialisation }
  } catch (error) {
    return toFailure('regenerateServiceSlotsAction', error)
  }
}

export async function deleteServiceAction(serviceId: string): Promise<DeleteResult> {
  try {
    const { tenantId, userId } = await requireManagerContext()
    const parsed = serviceIdSchema.safeParse({ serviceId })

    if (!parsed.success) {
      return { success: false, error: 'Invalid service' }
    }

    const deletion = await serviceCatalogService.deleteService(tenantId, parsed.data.serviceId, userId)

    revalidatePath('/services')
    revalidatePath('/bookings')

    return { success: true, deletion }
  } catch (error) {
    return toFailure('deleteServiceAction', error)
  }
}

export async function setServiceSlotStatusAction(input: SetServiceSlotStatusInput): Promise<SlotStatusResult> {
  try {
    const { tenantId } = await requireManagerContext()
    const parsed = setServiceSlotStatusSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: 'Invalid session update' }
    }

    const slot = await serviceCatalogService.setSlotStatus(tenantId, parsed.data.slotId, parsed.data.status)

    revalidatePath('/services')

    return { success: true, slot }
  } catch (error) {
    return toFailure('setServiceSlotStatusAction', error)
  }
}
