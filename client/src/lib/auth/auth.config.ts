import type { NextAuthConfig } from 'next-auth'

import type { UserRole } from '@/lib/constants/roles'
import type { TenantApprovalStatus, TenantPlan } from '@/lib/constants/tenant'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'

/**
 * Edge-compatible auth config used by middleware.
 * Reads the same `.env` keys as the rest of the app.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7
  },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? token.sub ?? ''
        session.user.googleId = token.googleId as string | undefined
        session.user.registrationComplete = Boolean(token.registrationComplete)
        session.user.role = token.role as UserRole | undefined
        session.user.tenantId = token.tenantId as string | undefined
        session.user.tenantName = token.tenantName as string | undefined
        session.user.tenantSlug = token.tenantSlug as string | undefined
        session.user.tenantPlan = token.tenantPlan as TenantPlan | undefined

        // Always explicit from JWT profile refresh — never infer from registrationComplete
        session.user.tenantApproved = Boolean(token.tenantApproved)
        session.user.tenantApprovalStatus = token.tenantApprovalStatus as TenantApprovalStatus | undefined
        session.user.tenantWorkspaceOpen = token.tenantWorkspaceOpen !== false
        session.user.isSuperAdmin =
          Boolean(token.isSuperAdmin) || isSuperAdminEmail(session.user.email)
        session.user.context = (token.context as 'staff' | 'customer' | undefined) ?? 'staff'
        session.user.customerId = token.customerId as string | undefined
      }

      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user)
      const isRegistered = Boolean(auth?.user?.registrationComplete)
      const pathname = nextUrl.pathname
      const isSuperAdminRoute = pathname.startsWith('/super-admin')
      const isSuperAdminUser = isSuperAdminEmail(auth?.user?.email)

      const workspaceRoutes =
        pathname.startsWith('/your-space') ||
        pathname.startsWith('/services') ||
        pathname.startsWith('/bookings') ||
        pathname.startsWith('/leads')

      const isProtectedRoute =
        pathname.startsWith('/home') ||
        pathname.startsWith('/your-space') ||
        pathname.startsWith('/leads') ||
        pathname.startsWith('/about') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/services') ||
        pathname.startsWith('/bookings') ||
        isSuperAdminRoute

      const isRegisterRoute = pathname.startsWith('/register')
      const isLoginRoute = pathname.startsWith('/login')

      if (isProtectedRoute) {
        if (auth?.user?.context === 'customer') {
          const slug = auth.user.tenantSlug ?? ''
          const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim()

          if (root && slug) {
            const protocol = nextUrl.protocol === 'http:' ? 'http' : 'https'

            return Response.redirect(new URL(`${protocol}://${slug}.${root}`))
          }

          return Response.redirect(new URL(`/site/${slug}`, nextUrl))
        }

        if (!isLoggedIn) {
          return false
        }

        if (!isRegistered) {
          return Response.redirect(new URL('/register', nextUrl))
        }

        if (isSuperAdminRoute && !isSuperAdminUser) {
          return Response.redirect(new URL('/home', nextUrl))
        }

        // Rejected orgs stay on Home; pending orgs may use the workspace (publish still gated).
        const workspaceOpen = auth?.user?.tenantWorkspaceOpen !== false

        if (workspaceRoutes && !workspaceOpen) {
          return Response.redirect(new URL('/home', nextUrl))
        }

        return true
      }

      if (isRegisterRoute) {
        // Public prompt-first signup — Google OAuth happens from the page itself.
        if (isLoggedIn && isRegistered) {
          return Response.redirect(new URL('/home', nextUrl))
        }

        return true
      }

      if (isLoginRoute && isLoggedIn) {
        return Response.redirect(new URL(isRegistered ? '/home' : '/register', nextUrl))
      }

      return true
    }
  }
} satisfies NextAuthConfig
