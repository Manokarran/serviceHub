/**
 * Super admins are configured via the SUPER_ADMIN env variable (comma-separated emails).
 * Edge-compatible — safe to use in middleware and auth callbacks.
 */

function parseSuperAdminEmails(raw?: string): string[] {
  if (!raw?.trim()) {
    return []
  }

  return raw
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

export function getSuperAdminEmails(): string[] {
  return parseSuperAdminEmails(process.env.SUPER_ADMIN)
}

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email?.trim()) {
    return false
  }

  const normalizedEmail = email.trim().toLowerCase()

  return getSuperAdminEmails().includes(normalizedEmail)
}
