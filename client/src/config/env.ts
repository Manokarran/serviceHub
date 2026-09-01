/**
 * Server configuration loaded from `.env` / `.env.local`.
 * Variable names match the project's `.env` file.
 */

function required(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing ${name} in .env`)
  }

  return value.trim()
}

function optional(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

/** Strip wrapping quotes — needed when ImageKit keys end with "=" */
function stripEnvQuotes(value: string): string {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

export const serverEnv = {
  appUrl: optional(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
  basePath: optional(process.env.BASEPATH, ''),
  mongodbUri: required('MONGODB_URI', process.env.MONGODB_URI),
  mongodbDbName: optional(process.env.MONGODB_DB_NAME, 'servicehub'),
  nextAuthSecret: required('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET),
  nextAuthUrl: optional(process.env.NEXTAUTH_URL, optional(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000')),
  googleClientId: required('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET),
  imagekitPrivateKey: stripEnvQuotes(optional(process.env.IMAGEKIT_PRIVATE_KEY, '')),
  imagekitPublicKey: stripEnvQuotes(optional(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, '')),
  imagekitUrlEndpoint: optional(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, ''),
  emailFromName: optional(process.env.EMAIL_FROM_NAME, 'ServiceHub'),
  emailFromAddress: optional(process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM, ''),
  smtpHost: optional(process.env.SMTP_HOST, ''),
  smtpPort: Number(optional(process.env.SMTP_PORT, '587')),
  smtpSecure: optional(process.env.SMTP_SECURE, 'false') === 'true',
  smtpUser: optional(process.env.SMTP_USER, ''),
  smtpPass: optional(process.env.SMTP_PASS, ''),
  openAiApiKey: optional(process.env.OPENAI_API_KEY, ''),
  openAiModel: optional(process.env.OPENAI_MODEL, 'gpt-4.1-nano'),
  openAiAdminApiKey: optional(process.env.OPENAI_ADMIN_API_KEY, ''),
  openAiOrganizationId: optional(process.env.OPENAI_ORGANIZATION_ID, ''),
  openAiMonthlyBudgetUsd: process.env.OPENAI_MONTHLY_BUDGET_USD?.trim() &&
    Number.isFinite(Number(process.env.OPENAI_MONTHLY_BUDGET_USD))
    ? Number(process.env.OPENAI_MONTHLY_BUDGET_USD)
    : null
} as const

export const publicEnv = {
  appUrl: optional(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
  imagekitPublicKey: optional(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, ''),
  imagekitUrlEndpoint: optional(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, ''),
  unsplashKey: optional(process.env.NEXT_PUBLIC_UNSPLASH_KEY, '')
} as const
