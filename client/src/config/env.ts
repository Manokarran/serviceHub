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

export const serverEnv = {
  appUrl: optional(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
  basePath: optional(process.env.BASEPATH, ''),
  mongodbUri: required('MONGODB_URI', process.env.MONGODB_URI),
  mongodbDbName: optional(process.env.MONGODB_DB_NAME, 'servicehub'),
  nextAuthSecret: required('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET),
  nextAuthUrl: optional(process.env.NEXTAUTH_URL, optional(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000')),
  googleClientId: required('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET),
  imagekitPrivateKey: optional(process.env.IMAGEKIT_PRIVATE_KEY, ''),
  imagekitPublicKey: optional(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, ''),
  imagekitUrlEndpoint: optional(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, '')
} as const

export const publicEnv = {
  appUrl: optional(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'),
  imagekitPublicKey: optional(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, ''),
  imagekitUrlEndpoint: optional(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, ''),
  unsplashKey: optional(process.env.NEXT_PUBLIC_UNSPLASH_KEY, '')
} as const
