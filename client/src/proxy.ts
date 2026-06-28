import NextAuth from 'next-auth'

import { authConfig } from '@/lib/auth/auth.config'
import { ensureAuthEnv } from '@/lib/auth/ensure-auth-env'

ensureAuthEnv()

const { auth } = NextAuth(authConfig)

export { auth as proxy }

export const config = {
  matcher: [
    '/home/:path*',
    '/your-space/:path*',
    '/leads',
    '/leads/:path*',
    '/about/:path*',
    '/super-admin',
    '/super-admin/:path*',
    '/login',
    '/register'
  ]
}
