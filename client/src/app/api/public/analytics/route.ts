import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors'
import { siteAnalyticsEventSchema } from '@/lib/validators/site-analytics.validator'
import { siteAnalyticsService } from '@/services/site-analytics'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return new NextResponse(null, { status: 204 })
    }

    const parsed = siteAnalyticsEventSchema.safeParse(body)

    if (!parsed.success) {
      return new NextResponse(null, { status: 204 })
    }

    await siteAnalyticsService.trackPublicEvent(parsed.data, request.headers.get('user-agent'))

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof AppError) {
      return new NextResponse(null, { status: 204 })
    }

    console.error('[api/public/analytics]', error)

    return new NextResponse(null, { status: 204 })
  }
}
