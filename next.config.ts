import type { NextConfig } from 'next'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig: NextConfig = {
  output: process.env.GITHUB_PAGES === 'true' ? 'export' : undefined,
  basePath,
  images: {
    unoptimized: true,
  },
  productionBrowserSourceMaps: false,
}

export default nextConfig
