export const USER_ROLES = ['owner', 'admin', 'member'] as const

export type UserRole = (typeof USER_ROLES)[number]

export function isManagerRole(role?: string | null): role is Extract<UserRole, 'owner' | 'admin'> {
  return role === 'owner' || role === 'admin'
}
