import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

import { authConfig } from '@/lib/auth/auth.config'
import { ensureAuthEnv } from '@/lib/auth/ensure-auth-env'
import { getAppOrigin, resolveTenantHost } from '@/lib/utils/tenant-host'

ensureAuthEnv()

const { auth } = NextAuth(authConfig)

const APP_ROUTE_PREFIXES = [
  '/home',
  '/your-space',
  '/services',
  '/bookings',
  '/leads',
  '/about',
  '/profile',
  '/super-admin',
  '/login',
  '/register'
] as const

function isAppProductPath(pathname: string): boolean {
  return APP_ROUTE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export const proxy = auth(req => {
  const host = req.headers.get('host')
  const resolved = resolveTenantHost(host)
  const { pathname, search } = req.nextUrl

  if (resolved.type === 'tenant' || resolved.type === 'platform') {
    const slug = resolved.tenantSlug

    // Product routes always live on the app host.
    if (isAppProductPath(pathname)) {
      return NextResponse.redirect(new URL(`${pathname}${search}`, getAppOrigin()))
    }

    // Already an internal public-site path (or API) — pass through.
    if (pathname.startsWith('/site/') || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    const rewriteUrl = req.nextUrl.clone()
    const suffix = pathname === '/' ? '' : pathname

    rewriteUrl.pathname = `/site/${slug}${suffix}`

    return NextResponse.rewrite(rewriteUrl)
  }

  // App host: dashboard home (replaces next.config redirect so tenant hosts are unaffected).
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/home${search}`, req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Run on all pages except Next internals and files with extensions (images, etc.).
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    '/'
  ]
}
