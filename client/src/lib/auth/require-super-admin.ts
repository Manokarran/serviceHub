import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { AppError } from '@/lib/errors'

export async function requireSuperAdminSession() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AppError('You must be signed in.', 401, 'UNAUTHORIZED')
  }

  if (session.user.impersonating) {
    throw new AppError('Exit impersonation before using super admin tools.', 403, 'FORBIDDEN')
  }

  if (!isSuperAdminEmail(session.user.email)) {
    throw new AppError('Super admin access required.', 403, 'FORBIDDEN')
  }

  return session
}
