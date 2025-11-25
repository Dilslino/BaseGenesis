import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BaseGenesis',
    short_name: 'BaseGenesis',
    description: 'Discover your on-chain origins on Base',
    start_url: '/',
    display: 'standalone',
    background_color: '#020205',
    theme_color: '#020205',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}