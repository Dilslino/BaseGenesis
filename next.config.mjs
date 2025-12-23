 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Externalize server-only deps to prevent Turbopack from bundling test files
  serverExternalPackages: ['thread-stream', 'pino', 'pino-pretty', 'pino-abstract-transport'],
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
