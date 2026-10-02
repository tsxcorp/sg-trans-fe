import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // The quote form posts a few short fields: keep the action body small.
    serverActions: { bodySizeLimit: '100kb' },
  },
};

export default nextConfig;
