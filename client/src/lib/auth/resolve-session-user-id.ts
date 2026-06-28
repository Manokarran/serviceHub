import mongoose from 'mongoose'
import type { Session } from 'next-auth'

import { AppError } from '@/lib/errors'
import { authService } from '@/services/auth'

export async function resolveSessionUserId(session: Session): Promise<string> {
  const sessionId = session.user?.id?.trim()

  if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
    return new mongoose.Types.ObjectId(sessionId).toString()
  }

  const email = session.user?.email?.trim()

  if (email) {
    const profile = await authService.getUserProfileByEmail(email)

    if (profile?.id && mongoose.Types.ObjectId.isValid(profile.id)) {
      return profile.id
    }
  }

  throw new AppError('Could not resolve your user account. Sign out and sign in again.', 401, 'INVALID_USER_ID')
}

export function formatActionError(error: unknown, fallback: string): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const firstIssue = Object.values(error.errors)[0]?.message

    return firstIssue ?? error.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
