import NextAuth from 'next-auth'

import { authConfig } from '@/lib/auth/auth.config'

const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/home/:path*', '/your-space/:path*', '/leads', '/leads/:path*', '/about/:path*', '/login', '/register']
}
