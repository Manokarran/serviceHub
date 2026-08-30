import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors'
import { publicServiceService } from '@/services/booking/public-service.service'

export const runtime = 'nodejs'

type RouteContext = {
  params: Promise<{ serviceSlug: string }>
}

function parseDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid availability date', 400, 'INVALID_DATE')
  }

  return date
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { serviceSlug } = await params
    const searchParams = new URL(request.url).searchParams
    const tenantSlug = searchParams.get('tenantSlug')?.trim()

    if (!tenantSlug) {
      return NextResponse.json({ error: 'Tenant is required' }, { status: 400 })
    }

    const from = parseDate(searchParams.get('from'))
    const to = parseDate(searchParams.get('to'))

    if (from && to && to <= from) {
      return NextResponse.json({ error: 'Availability range is invalid' }, { status: 400 })
    }

    const result = await publicServiceService.listAvailability(tenantSlug, serviceSlug, { from, to })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/services/availability]', error)

    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}
