import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors'
import { createBookingHoldSchema } from '@/lib/validators/booking.validator'
import { serviceRepository, tenantRepository } from '@/repositories'
import { bookingService } from '@/services/booking/booking.service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const parsed = createBookingHoldSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid booking hold details' }, { status: 400 })
    }

    const tenant = await tenantRepository.findBySlug(parsed.data.tenantSlug)

    if (!tenant || tenant.status === 'suspended') {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    const service = await serviceRepository.findPublishedBySlug(tenant._id.toString(), parsed.data.serviceSlug)

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    const hold = await bookingService.createHold(
      tenant._id.toString(),
      service._id.toString(),
      parsed.data.slotId,
      parsed.data.quantity
    )

    return NextResponse.json(hold, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/booking-holds]', error)

    return NextResponse.json({ error: 'Unable to hold this time' }, { status: 500 })
  }
}
