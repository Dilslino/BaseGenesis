import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 240,
          background: '#020205',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '110px', // Superellipse
          border: '16px solid rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Glow */}
        <div
            style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(0,82,255,0.25) 0%, rgba(2,2,5,0) 60%)',
            }}
        />
        
        {/* The "B" - Base Blue Gradient Text */}
        <div style={{
            display: 'flex',
            fontFamily: 'sans-serif',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #0052FF 0%, #FFFFFF 80%)',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(0,82,255,0.8))',
            marginTop: -20,
        }}>
            B
        </div>
        
        {/* Cyber overlay lines */}
        <div style={{ position: 'absolute', bottom: 60, width: '30%', height: 6, background: '#0052FF', borderRadius: 4, opacity: 0.9, boxShadow: '0 0 10px #0052FF' }} />
      </div>
    ),
    { ...size }
  )
}