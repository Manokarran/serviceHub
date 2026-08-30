import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { createBookingSchema, createTermBookingSchema } from '@/lib/validators/booking.validator'
import { bookingService } from '@/services/booking/booking.service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()

    if (typeof body?.batchId === 'string') {
      const parsedTerm = createTermBookingSchema.safeParse(body)

      if (!parsedTerm.success) {
        return NextResponse.json(
          { error: parsedTerm.error.issues[0]?.message ?? 'Invalid term booking details' },
          { status: 400 }
        )
      }

      if (session?.user?.context !== 'customer' || session.user.tenantSlug !== parsedTerm.data.tenantSlug) {
        return NextResponse.json({ error: 'Please sign in for this website before booking' }, { status: 401 })
      }

      const termBooking = await bookingService.createTermBooking(session.user, parsedTerm.data)

      return NextResponse.json(
        {
          booking: termBooking.bookings[0],
          bookings: termBooking.bookings,
          termOccurrenceCount: termBooking.occurrenceCount
        },
        { status: 201 }
      )
    }

    const parsed = createBookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid booking details' }, { status: 400 })
    }

    if (session?.user?.context !== 'customer' || session.user.tenantSlug !== parsed.data.tenantSlug) {
      return NextResponse.json({ error: 'Please sign in for this website before booking' }, { status: 401 })
    }

    const booking = await bookingService.createBooking(session.user, parsed.data)

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/bookings]', error)

    return NextResponse.json({ error: 'Unable to complete booking' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (
      !session?.user?.context ||
      session.user.context !== 'customer' ||
      !session.user.tenantId ||
      !session.user.customerId
    ) {
      return NextResponse.json({ error: 'Sign in to view your bookings' }, { status: 401 })
    }

    const requestedTenant = new URL(request.url).searchParams.get('tenantSlug')

    if (requestedTenant && requestedTenant !== session.user.tenantSlug) {
      return NextResponse.json({ error: 'Website does not match your session' }, { status: 403 })
    }

    const bookings = await bookingService.listBookings(session.user.tenantId, session.user.customerId)

    return NextResponse.json({ bookings })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/bookings/list]', error)

    return NextResponse.json({ error: 'Unable to load bookings' }, { status: 500 })
  }
}
