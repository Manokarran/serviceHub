'use server'

import { revalidatePath } from 'next/cache'

import { requireSuperAdminSession } from '@/lib/auth/require-super-admin'
import { AppError } from '@/lib/errors'
import type { TenantApprovalStatus } from '@/lib/constants/tenant'
import {
  tenantAdminService,
  type TenantRegistrationRequest
} from '@/services/tenant/tenant-admin.service'

type ListResult =
  | { success: true; requests: TenantRegistrationRequest[]; pendingCount: number }
  | { success: false; error: string }

type SimpleResult = { success: true } | { success: false; error: string }

export async function listTenantRegistrationRequestsAction(
  filter: TenantApprovalStatus | 'all' = 'all'
): Promise<ListResult> {
  try {
    await requireSuperAdminSession()
    const [requests, pendingCount] = await Promise.all([
      tenantAdminService.listRegistrationRequests(filter),
      tenantAdminService.countPendingRequests()
    ])

    return { success: true, requests, pendingCount }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to load registration requests.' }
  }
}

export async function approveTenantRegistrationAction(tenantId: string): Promise<SimpleResult> {
  try {
    const session = await requireSuperAdminSession()

    await tenantAdminService.approveTenant(tenantId, session.user.email ?? 'super-admin')
    revalidatePath('/super-admin/requests')
    revalidatePath('/super-admin')

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to approve organization.' }
  }
}

export async function rejectTenantRegistrationAction(tenantId: string): Promise<SimpleResult> {
  try {
    await requireSuperAdminSession()
    await tenantAdminService.rejectTenant(tenantId)
    revalidatePath('/super-admin/requests')
    revalidatePath('/super-admin')

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to update organization approval.' }
  }
}

export async function deleteTenantRegistrationAction(tenantId: string): Promise<SimpleResult> {
  try {
    await requireSuperAdminSession()
    await tenantAdminService.deleteTenantCompletely(tenantId)
    revalidatePath('/super-admin/requests')
    revalidatePath('/super-admin')

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Failed to delete organization.' }
  }
}
