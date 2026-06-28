import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { AppError } from '@/lib/errors'

export async function requireSuperAdminSession() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AppError('You must be signed in.', 401, 'UNAUTHORIZED')
  }

  if (!isSuperAdminEmail(session.user.email)) {
    throw new AppError('Super admin access required.', 403, 'FORBIDDEN')
  }

  return session
}
