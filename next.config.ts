import { routes } from '@/lib/routes'
import type { NextConfig } from 'next'

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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configurar webpack para ignorar módulos Node.js no lado cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
      }
    }
    return config
  },
}

export default nextConfig
