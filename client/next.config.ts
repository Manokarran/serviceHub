import type { NextConfig } from 'next'

const basePath = process.env.BASEPATH?.replace(/\/$/, '') ?? ''

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
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
