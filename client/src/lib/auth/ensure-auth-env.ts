/**
 * Normalize Auth.js env vars before NextAuth initializes.
 *
 * On Vercel, Auth.js should infer the host from each request (trustHost).
 * Setting AUTH_URL to VERCEL_URL or NEXT_PUBLIC_APP_URL breaks OAuth when the
 * app is opened via a different alias (production domain vs deployment URL).
 */
export function ensureAuthEnv(): void {
  if (!process.env.AUTH_SECRET?.trim() && process.env.NEXTAUTH_SECRET?.trim()) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET.trim()
  }

  const isLocalhostUrl = (value: string | undefined) =>
    Boolean(value && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value.trim()))

  const vercelUrl = process.env.VERCEL_URL?.trim()

  if (vercelUrl) {
    // Let trustHost resolve the callback URL from the Host header on each request.
    for (const key of ['AUTH_URL', 'NEXTAUTH_URL'] as const) {
      delete process.env[key]
    }

    return
  }

  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const resolvedUrl =
    publicAppUrl && !isLocalhostUrl(publicAppUrl) ? publicAppUrl.replace(/\/$/, '') : undefined

  if (!resolvedUrl) {
    return
  }

  for (const key of ['AUTH_URL', 'NEXTAUTH_URL'] as const) {
    const current = process.env[key]

    if (!current?.trim() || isLocalhostUrl(current)) {
      process.env[key] = resolvedUrl
    }
  }
}
