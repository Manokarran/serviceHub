'use server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
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

    if (!session?.user?.id) {
      return { success: false, error: 'You must sign in with Google first.' }
    }

    if (session.user.registrationComplete) {
      return { success: false, error: 'Registration is already complete.' }
    }

    const result = await tenantService.completeRegistration(session.user.id, input)

    return {
      success: true,
      tenantSlug: result.slug,
      tenantName: input.companyName
    }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    return { success: false, error: 'Registration failed. Please try again.' }
  }
}
