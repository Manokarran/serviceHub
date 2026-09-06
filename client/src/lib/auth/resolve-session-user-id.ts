import mongoose from 'mongoose'
import type { Session } from 'next-auth'

import { AppError } from '@/lib/errors'
import { userRepository } from '@/repositories'

/** Auth.js / Mongo ObjectIds are 24 hex chars. UUIDs must not pass. */
export function isStrictMongoObjectId(value?: string | null): boolean {
  return Boolean(value && /^[a-fA-F0-9]{24}$/.test(value))
}

/**
 * Resolve the MongoDB staff user id for the current session.
 * Recreates the user row when it was removed (e.g. tenant cascade delete)
 * but the browser session is still signed in.
 */
export async function resolveSessionUserId(session: Session): Promise<string> {
  const sessionId = session.user?.id?.trim()

  if (isStrictMongoObjectId(sessionId)) {
    const existing = await userRepository.findById(sessionId!)

    if (existing?.isActive) {
      return existing._id.toString()
    }
  }

  const email = session.user?.email?.trim().toLowerCase()

  if (!email) {
    throw new AppError('Could not resolve your user account. Sign out and sign in again.', 401, 'INVALID_USER_ID')
  }

  let user = await userRepository.findByEmail(email)

  if (!user || !user.isActive) {
    const googleId = session.user.googleId?.trim() || `recovered:${email}`

    const byGoogle = session.user.googleId?.trim()
      ? await userRepository.findByGoogleId(session.user.googleId.trim())
      : null

    if (byGoogle?.isActive) {
      user = byGoogle
    } else {
      user = await userRepository.createFromGoogle({
        googleId,
        email,
        name: session.user.name?.trim() || 'User',
        image: session.user.image ?? undefined
      })
    }
  }

  if (!user?._id) {
    throw new AppError('Could not resolve your user account. Sign out and sign in again.', 401, 'INVALID_USER_ID')
  }

  return user._id.toString()
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
