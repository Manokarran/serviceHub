'use server'

import { requireSuperAdminSession } from '@/lib/auth/require-super-admin'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { AppError } from '@/lib/errors'
import { authService } from '@/services/auth'

type StartResult =
  | { success: true; userId: string; name: string; email: string }
  | { success: false; error: string }

/**
 * Validates that the caller is a super admin and the target is a registered staff user.
 * The client must then call `session.update({ impersonateUserId })` to rewrite the JWT.
 */
export async function prepareImpersonationAction(userId: string): Promise<StartResult> {
  try {
    const session = await requireSuperAdminSession()

    if (session.user.impersonating) {
      return { success: false, error: 'Stop the current impersonation session first.' }
    }

    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return { success: false, error: 'Invalid user id.' }
    }

    if (userId === session.user.id) {
      return { success: false, error: 'You are already signed in as this user.' }
    }

    const profile = await authService.getUserProfile(userId)

    if (!profile) {
      return { success: false, error: 'User not found.' }
    }

    if (!profile.registrationComplete) {
      return { success: false, error: 'That user has not finished registration.' }
    }

    if (isSuperAdminEmail(profile.email)) {
      return { success: false, error: 'Cannot impersonate another super admin.' }
    }

    return {
      success: true,
      userId: profile.id,
      name: profile.name,
      email: profile.email
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Unable to start impersonation.' }
  }
}
