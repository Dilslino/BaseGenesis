 /** @type {import('next').NextConfig} */
 const nextConfig = {
   reactStrictMode: true,
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
