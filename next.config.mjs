 /** @type {import('next').NextConfig} */
 const nextConfig = {
   reactStrictMode: true,
  experimental: {
    turbo: {
      // Avoid Turbopack trying to parse non-code assets/test fixtures in certain deps.
      // Vercel build can fail when these are imported transitively.
      rules: {
        '*.md': { loaders: ['raw-loader'] },
        '*.zip': { loaders: ['raw-loader'] },
        '*.sh': { loaders: ['raw-loader'] },
      },
    },
  },
   images: {
     domains: ['basegenesis.vercel.app'],
   },
   // Ensure static files are served correctly
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
