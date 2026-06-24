import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['raw.githubusercontent.com', 'arweave.net', 'birdeye.so', 'cf-ipfs.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=30, stale-while-revalidate=60' },
        ],
      },
    ];
  },
};

export default nextConfig;
