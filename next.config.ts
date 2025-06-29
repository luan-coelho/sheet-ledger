import type { NextConfig } from 'next'

import { routes } from '@/lib/routes'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: true,
      },
      {
        source: routes.frontend.admin.home,
        destination: routes.frontend.admin.sheets,
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    TZ: 'America/Sao_Paulo',
  },
}

export default nextConfig
