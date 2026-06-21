import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { serverEnv } from '@/config/env'
import { authService } from '@/services/auth'

import { authConfig } from './auth.config'

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
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') {
        return false
      }

      const googleProfile = profile as { email?: string | null; name?: string | null; picture?: string | null }

      if (!googleProfile.email) {
        console.error('[Auth] Google profile is missing an email address')
        return false
      }

      try {
        await authService.syncGoogleUser({
          googleId: account.providerAccountId,
          email: googleProfile.email,
          name: googleProfile.name ?? 'User',
          image: googleProfile.picture
        })

        return true
      } catch (error) {
        console.error('[Auth] Failed to sync Google user:', error)
        return false
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

      return token
    }
  }
})
