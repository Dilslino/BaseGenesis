 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude test directories from webpack bundling
    config.module.rules.push({
      test: /node_modules\/.*\/test\//,
      use: 'null-loader'
    })
    return config
  },
  // Externalize problematic dependencies
  serverExternalPackages: ['thread-stream', 'pino', 'pino-pretty'],
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
}

export default nextConfig
