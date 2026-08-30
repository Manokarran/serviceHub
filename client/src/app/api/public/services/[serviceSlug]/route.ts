import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors'
import { publicServiceService } from '@/services/booking/public-service.service'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ serviceSlug: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { serviceSlug } = await params
    const tenantSlug = new URL(request.url).searchParams.get('tenantSlug')?.trim()

    if (!tenantSlug) {
      return NextResponse.json({ error: 'Tenant is required' }, { status: 400 })
    }

    const service = await publicServiceService.getService(tenantSlug, serviceSlug)

    return NextResponse.json({ service })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/services/detail]', error)

    return NextResponse.json({ error: 'Failed to load service' }, { status: 500 })
  }
}
