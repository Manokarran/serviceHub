import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { AppError } from '@/lib/errors'
import { createBookingSchema } from '@/lib/validators/booking.validator'
import { bookingService } from '@/services/booking/booking.service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const parsed = createBookingSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid waitlist details' }, { status: 400 })
    }

    if (session?.user?.context !== 'customer' || session.user.tenantSlug !== parsed.data.tenantSlug) {
      return NextResponse.json({ error: 'Please sign in for this website first' }, { status: 401 })
    }

    await bookingService.joinWaitlist(session.user, parsed.data)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/waitlist]', error)

    return NextResponse.json({ error: 'Unable to join the waitlist' }, { status: 500 })
  }
}
