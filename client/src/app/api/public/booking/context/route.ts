import { NextResponse } from 'next/server'

import { tenantRepository } from '@/repositories'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { tenantSlug?: unknown }
    const tenantSlug = typeof body.tenantSlug === 'string' ? body.tenantSlug.trim() : ''
    const tenant = tenantSlug ? await tenantRepository.findBySlug(tenantSlug) : null

    if (!tenant || tenant.status === 'suspended') {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('BOOKING_TENANT', tenant.slug, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60,
      path: '/'
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Unable to start booking sign-in' }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('BOOKING_TENANT', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  })

  return response
}
