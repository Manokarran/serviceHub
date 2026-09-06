import { cookies } from 'next/headers'

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { serverEnv } from '@/config/env'
import { AppError } from '@/lib/errors'
import { authService } from '@/services/auth'

import { authConfig } from './auth.config'
import { ensureAuthEnv } from './ensure-auth-env'
import { isSuperAdminEmail } from './super-admin'

ensureAuthEnv()

function isMongoUserId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)
}

function applyUserProfile(
  token: Record<string, unknown>,
  profile: Awaited<ReturnType<typeof authService.getUserProfile>> | null
) {
  if (!profile) {
    // User was removed (e.g. tenant cascade delete) — drop staff claims
    if (isMongoUserId(token.userId)) {
      delete token.userId
      token.registrationComplete = false
      delete token.role
      delete token.tenantId
      delete token.tenantName
      delete token.tenantSlug
      delete token.tenantPlan
      token.tenantApproved = false
      delete token.tenantApprovalStatus
      token.tenantWorkspaceOpen = false
      token.context = 'staff'
      delete token.customerId
    }

    return
  }

  token.userId = profile.id
  token.registrationComplete = profile.registrationComplete
  token.role = profile.role
  token.tenantId = profile.tenantId
  token.tenantName = profile.tenantName
  token.tenantSlug = profile.tenantSlug
  token.tenantPlan = profile.tenantPlan
  token.tenantApproved = profile.tenantApproved
  token.tenantApprovalStatus = profile.tenantApprovalStatus
  token.tenantWorkspaceOpen = profile.tenantWorkspaceOpen
  token.context = 'staff'
  delete token.customerId
}

function applyCustomerProfile(
  token: Record<string, unknown>,
  profile: Awaited<ReturnType<typeof authService.getCustomerProfileByGoogleId>> | null
) {
  if (!profile) {
    return
  }

  token.userId = profile.customerId
  token.customerId = profile.customerId
  token.email = profile.email
  token.registrationComplete = true
  token.context = 'customer'
  token.tenantId = profile.tenantId
  token.tenantName = profile.tenantName
  token.tenantSlug = profile.tenantSlug
  token.role = undefined
  token.tenantPlan = undefined
  token.tenantApproved = undefined
  delete token.tenantApprovalStatus
  token.tenantWorkspaceOpen = undefined
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
        const bookingTenant = (await cookies()).get('BOOKING_TENANT')?.value

        if (bookingTenant) {
          await authService.syncGoogleCustomer({
            tenantSlug: bookingTenant,
            googleId: account.providerAccountId,
            email,
            name: googleProfile.name ?? user?.name ?? 'Customer',
            image: googleProfile.picture ?? user?.image
          })

          return true
        }

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
        if (account?.provider === 'google') {
          if (account.providerAccountId) {
            token.googleId = account.providerAccountId
          }

          if (token.email) {
            const bookingTenant = (await cookies()).get('BOOKING_TENANT')?.value

            if (bookingTenant) {
              const customerProfile = await authService.getCustomerProfileByGoogleId(
                bookingTenant,
                account.providerAccountId ?? ''
              )

              applyCustomerProfile(token, customerProfile)
            } else {
              const profile = await authService.getUserProfileByEmail(token.email)

              applyUserProfile(token, profile)
            }
          }
        } else if (token.context !== 'customer') {
          // Keep approval / registration fields in sync so revoke/approve takes effect without re-login
          const userId = isMongoUserId(token.userId) ? token.userId : undefined
          let profile = userId ? await authService.getUserProfile(userId) : null

          if (!profile && token.email) {
            profile = await authService.getUserProfileByEmail(token.email as string)
          }

          // Staff user row missing (cascade delete) — recreate from Google id when possible
          if (!profile && token.email && token.googleId) {
            profile = await authService.syncGoogleUser({
              googleId: token.googleId as string,
              email: token.email as string,
              name: (token.name as string) || 'User',
              image: (token.picture as string) || null
            })
          }

          applyUserProfile(token, profile)
        }

        if (trigger === 'update') {
          if (token.context === 'customer') {
            return token
          }

          const userId = isMongoUserId(token.userId) ? token.userId : undefined
          let profile = userId ? await authService.getUserProfile(userId) : null

          if (!profile && token.email) {
            profile = await authService.getUserProfileByEmail(token.email as string)
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

            if (typeof sessionUpdate.tenantApproved === 'boolean') {
              // Prefer DB profile when present; only force false from client after fresh registration
              if (sessionUpdate.tenantApproved === false) {
                token.tenantApproved = false
              } else if (token.tenantApproved !== true) {
                token.tenantApproved = sessionUpdate.tenantApproved
              }
            }

            if (sessionUpdate.tenantApprovalStatus === 'pending') {
              token.tenantApprovalStatus = 'pending'
            }

            if (sessionUpdate.tenantWorkspaceOpen === true) {
              token.tenantWorkspaceOpen = true
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
