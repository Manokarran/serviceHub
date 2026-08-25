'use server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { isManagerRole } from '@/lib/constants/roles'
import type { UpdateTenantProfileInput } from '@/lib/validators/tenant-profile.validator'
import type { TenantProfileView, TenantSlugAvailability } from '@/services/tenant'
import { tenantProfileService } from '@/services/tenant'

function assertManagerAccess(role?: string) {
  if (!isManagerRole(role)) {
    throw new AppError('You do not have permission to update organization settings', 403, 'FORBIDDEN')
  }
}

type ProfileResult = { success: true; profile: TenantProfileView } | { success: false; error: string }

type SlugAvailabilityResult =
  | { success: true; availability: TenantSlugAvailability }
  | { success: false; error: string }

export async function getTenantProfileAction(): Promise<ProfileResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in.' }
    }

    const profile = await tenantProfileService.getProfile(session.user.tenantId)

    return { success: true, profile }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[getTenantProfileAction]', error)

    return { success: false, error: 'Failed to load profile.' }
  }
}

export async function checkTenantSlugAvailabilityAction(slug: string): Promise<SlugAvailabilityResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in.' }
    }

    const availability = await tenantProfileService.checkSlugAvailability(session.user.tenantId, slug)

    return { success: true, availability }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[checkTenantSlugAvailabilityAction]', error)

    return { success: false, error: 'Failed to check URL availability.' }
  }
}

export async function updateTenantProfileAction(input: UpdateTenantProfileInput): Promise<ProfileResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId) {
      return { success: false, error: 'You must be signed in.' }
    }

    assertManagerAccess(session.user.role)

    const profile = await tenantProfileService.updateProfile(session.user.tenantId, input)

    return { success: true, profile }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[updateTenantProfileAction]', error)

    return { success: false, error: 'Failed to update profile.' }
  }
}
