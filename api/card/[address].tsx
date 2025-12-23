 import { ImageResponse } from '@vercel/og'
 import { NextRequest } from 'next/server'
 
 export const config = {
   runtime: 'edge',
 }
 
 // Simplified version for Vercel Edge Function
 export default async function handler(req: NextRequest) {
   const { searchParams } = new URL(req.url)
   const address = req.url.split('/card/')[1]?.split('?')[0]
   
   if (!address) {
     return new Response('Address required', { status: 400 })
   }
   
   const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
   
   return new ImageResponse(
     (
       <div
         style={{
           height: '100%',
           width: '100%',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           backgroundColor: '#0f0c29',
           fontSize: 40,
           fontWeight: 'bold',
           color: 'white',
         }}
       >
         Genesis Card: {shortAddress}
       </div>
     ),
     {
       width: 1200,
       height: 800,
     }
   )
 }
