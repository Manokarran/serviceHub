import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { serverEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { authService } from '@/services/auth'

import { authConfig } from './auth.config'
import { ensureAuthEnv } from './ensure-auth-env'
import { isSuperAdminEmail } from './super-admin'

ensureAuthEnv()

function applyUserProfile(
  token: Record<string, unknown>,
  profile: Awaited<ReturnType<typeof authService.getUserProfile>> | null
) {
  if (!profile) {
    return
  }

  token.userId = profile.id
  token.registrationComplete = profile.registrationComplete
  token.role = profile.role
  token.tenantId = profile.tenantId
  token.tenantName = profile.tenantName
  token.tenantSlug = profile.tenantSlug
  token.tenantPlan = profile.tenantPlan
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: serverEnv.nextAuthSecret,
  providers: [
    Google({
      clientId: serverEnv.googleClientId,
      clientSecret: serverEnv.googleClientSecret
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile, user }) {
      if (account?.provider !== 'google') {
        console.error('[Auth] Unexpected sign-in provider:', account?.provider)
        return '/login?error=AccessDenied'
      }

      const googleProfile = profile as { email?: string | null; name?: string | null; picture?: string | null }
      const email = googleProfile.email ?? user?.email

      if (!email) {
        console.error('[Auth] Google profile is missing an email address')
        return '/login?error=AccessDenied'
      }

      if (!account.providerAccountId) {
        console.error('[Auth] Google account is missing providerAccountId')
        return '/login?error=AccessDenied'
      }

      try {
        await authService.syncGoogleUser({
          googleId: account.providerAccountId,
          email,
          name: googleProfile.name ?? user?.name ?? 'User',
          image: googleProfile.picture ?? user?.image
        })

        return true
      } catch (error) {
        console.error('[Auth] Failed to sync Google user:', error)

        const appError = error instanceof AppError ? error : null

        if (appError) {
          switch (appError.code) {
            case 'USER_INACTIVE':
              return '/login?error=UserInactive'
            case 'TENANT_INACTIVE':
              return '/login?error=TenantInactive'
            case 'GOOGLE_SYNC_FAILED':
              return '/login?error=DatabaseError'
            default:
              return '/login?error=DatabaseError'
          }
        }

        return '/login?error=DatabaseError'
      }
    },
    async jwt({ token, account, trigger, session }) {
      try {
        if (account?.provider === 'google' && token.email) {
          const profile = await authService.getUserProfileByEmail(token.email)
          applyUserProfile(token, profile)
        }

        if (trigger === 'update') {
          const userId = token.userId as string | undefined
          let profile = userId ? await authService.getUserProfile(userId) : null

          if (!profile && token.email) {
            profile = await authService.getUserProfileByEmail(token.email)
          }

          applyUserProfile(token, profile)

          if (session && typeof session === 'object') {
            const sessionUpdate = session as Record<string, unknown>

            if (sessionUpdate.registrationComplete === true) {
              token.registrationComplete = true
            }

            if (typeof sessionUpdate.tenantSlug === 'string') {
              token.tenantSlug = sessionUpdate.tenantSlug
            }

            if (typeof sessionUpdate.tenantName === 'string') {
              token.tenantName = sessionUpdate.tenantName
            }
          }
        }
      } catch (error) {
        console.error('[Auth] Failed to enrich JWT session:', error)
      }

      if (typeof token.email === 'string') {
        token.isSuperAdmin = isSuperAdminEmail(token.email)
      }

      return token
    }
  }
})
