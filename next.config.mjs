/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    'thread-stream',
    'pino',
    'pino-pretty',
    'pino-abstract-transport',
    '@coinbase/cdp-sdk',
    '@supabase/supabase-js',
    'undici',
  ],
  images: {
    domains: ['basegenesis.vercel.app'],
  },
  async rewrites() {
    return [
      {
        source: '/image.png',
        destination: '/api/image',
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@solana/kit': false,
      '@solana-program/system': false,
      '@base-org/account': false,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      'porto': false,
      '@walletconnect/ethereum-provider': false,
    };
    return config;
  },
}

export default nextConfig
