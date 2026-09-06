'use server'

import { auth } from '@/lib/auth'
import { formatActionError, resolveSessionUserId } from '@/lib/auth/resolve-session-user-id'
import type { CompleteRegistrationInput } from '@/lib/validators'
import { tenantService } from '@/services/tenant'

type CompleteRegistrationResult =
  | { success: true; tenantSlug: string; tenantName: string }
  | { success: false; error: string }

export async function completeRegistrationAction(
  input: CompleteRegistrationInput
): Promise<CompleteRegistrationResult> {
  try {
    const session = await auth()

    if (!session?.user) {
      return { success: false, error: 'You must sign in with Google first.' }
    }

    if (session.user.registrationComplete) {
      return { success: false, error: 'Registration is already complete.' }
    }

    const userId = await resolveSessionUserId(session)
    const result = await tenantService.completeRegistration(userId, input)

    return {
      success: true,
      tenantSlug: result.slug,
      tenantName: input.companyName
    }
  } catch (error) {
    console.error('[completeRegistrationAction]', error)

    return { success: false, error: formatActionError(error, 'Registration failed. Please try again.') }
  }
}
