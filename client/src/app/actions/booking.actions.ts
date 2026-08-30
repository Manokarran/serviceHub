'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { isManagerRole } from '@/lib/constants/roles'
import { AppError } from '@/lib/errors'
import {
  bookingIdSchema,
  updateBookingStatusSchema,
  type UpdateBookingStatusInput
} from '@/lib/validators/booking.validator'
import type { BookingSummary } from '@/models/booking'
import { bookingService } from '@/services/booking/booking.service'

type Result = { success: true; booking: BookingSummary } | { success: false; error: string }
type ListResult = { success: true; bookings: BookingSummary[] } | { success: false; error: string }
type NotificationResult = { success: true } | { success: false; error: string }

export async function getTenantBookingsAction(): Promise<ListResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !isManagerRole(session.user.role)) {
      throw new AppError('You do not have permission to view bookings.', 403, 'FORBIDDEN')
    }

    return { success: true, bookings: await bookingService.listTenantBookings(session.user.tenantId) }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[getTenantBookingsAction]', error)

    return { success: false, error: 'Unable to load bookings' }
  }
}

export async function updateBookingStatusAction(input: UpdateBookingStatusInput): Promise<Result> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !isManagerRole(session.user.role)) {
      throw new AppError('You do not have permission to update bookings.', 403, 'FORBIDDEN')
    }

    const parsed = updateBookingStatusSchema.safeParse(input)

    if (!parsed.success) {
      return { success: false, error: 'Invalid booking status' }
    }

    const booking = await bookingService.updateStatus(
      session.user.tenantId,
      parsed.data.bookingId,
      parsed.data.status,
      session.user.id,
      parsed.data.reason
    )

    revalidatePath('/bookings')
    revalidatePath('/services')

    return { success: true, booking }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[updateBookingStatusAction]', error)

    return { success: false, error: 'Unable to update booking' }
  }
}

export async function sendBookingNotificationAction(bookingId: string): Promise<NotificationResult> {
  try {
    const session = await auth()

    if (!session?.user?.tenantId || !isManagerRole(session.user.role)) {
      throw new AppError('You do not have permission to send booking notifications.', 403, 'FORBIDDEN')
    }

    const parsed = bookingIdSchema.safeParse({ bookingId })

    if (!parsed.success) {
      return { success: false, error: 'Invalid booking' }
    }

    await bookingService.sendBookingNotification(session.user.tenantId, parsed.data.bookingId)

    return { success: true }
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message }
    }

    console.error('[sendBookingNotificationAction]', error)

    return { success: false, error: 'Unable to send booking notification' }
  }
}
