/**
 * Normalize Auth.js env vars before NextAuth initializes.
 * Prevents localhost NEXTAUTH_URL from being used on Vercel deployments.
 */
export function ensureAuthEnv(): void {
  if (!process.env.AUTH_SECRET?.trim() && process.env.NEXTAUTH_SECRET?.trim()) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET.trim()
  }

  const isLocalhostUrl = (value: string | undefined) =>
    Boolean(value && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value.trim()))

  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const vercelUrl = process.env.VERCEL_URL?.trim()
  const productionUrl =
    publicAppUrl && !isLocalhostUrl(publicAppUrl)
      ? publicAppUrl.replace(/\/$/, '')
      : vercelUrl
        ? `https://${vercelUrl}`
        : undefined

  if (!productionUrl) {
    return
  }

  for (const key of ['AUTH_URL', 'NEXTAUTH_URL'] as const) {
    const current = process.env[key]

    if (!current?.trim() || isLocalhostUrl(current)) {
      process.env[key] = productionUrl
    }
  }
}
