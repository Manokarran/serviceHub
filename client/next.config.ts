import type { NextConfig } from 'next'

const basePath = process.env.BASEPATH?.replace(/\/$/, '') ?? ''

const sharpLibvipsLinuxX64 = [
  './node_modules/@img/sharp-libvips-linux-x64/**/*',
  './node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*'
]

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  serverExternalPackages: ['mongoose', 'mongodb', 'sharp'],
  // Next 16 Turbopack/NFT omits sharp 0.35's libvips .so from Vercel functions.
  outputFileTracingIncludes: {
    '/*': sharpLibvipsLinuxX64,
    '/api/*': sharpLibvipsLinuxX64
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb'
    }
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
