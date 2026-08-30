import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors'
import { publicServiceService } from '@/services/booking/public-service.service'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const tenantSlug = new URL(request.url).searchParams.get('tenantSlug')?.trim()

    if (!tenantSlug) {
      return NextResponse.json({ error: 'Tenant is required' }, { status: 400 })
    }

    const services = await publicServiceService.listServices(tenantSlug)

    return NextResponse.json({ services })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/services]', error)

    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
  }
}
