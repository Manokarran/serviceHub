import { isSuperAdminEmail } from '@/lib/auth/super-admin'

/** Super admins never spend tenant AI/setup credits. */
export function hasUnlimitedCredits(user?: {
  email?: string | null
  isSuperAdmin?: boolean | null
} | null): boolean {
  if (!user) {
    return false
  }

  return user.isSuperAdmin === true || isSuperAdminEmail(user.email)
}
