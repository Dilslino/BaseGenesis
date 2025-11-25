import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'BaseGenesis - On-Chain Identity'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020205',
          position: 'relative',
        }}
      >
        {/* Background Gradients */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(to bottom right, #000a1f 0%, #020205 60%)' }} />
        <div style={{ position: 'absolute', bottom: -150, right: -100, width: 600, height: 600, background: '#0052FF', filter: 'blur(180px)', opacity: 0.3 }} />
        <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, background: '#7C3AED', filter: 'blur(180px)', opacity: 0.2 }} />

        {/* Logo Mark */}
        <div style={{
            display: 'flex',
            width: 140,
            height: 140,
            borderRadius: 36,
            background: '#020205',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            boxShadow: '0 0 80px rgba(0,82,255,0.4)',
            border: '2px solid rgba(0,82,255,0.3)'
        }}>
             <div style={{ fontSize: 90, fontWeight: 900, background: 'linear-gradient(to bottom right, #0052FF, #fff)', backgroundClip: 'text', color: 'transparent' }}>B</div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 80, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>BaseGenesis</span>
        </div>
        
        {/* Subtitle */}
        <div style={{ fontSize: 32, color: '#94A3B8', marginTop: 24, fontFamily: 'monospace', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.05)', padding: '10px 30px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
          DISCOVER YOUR ON-CHAIN ORIGIN
        </div>

        {/* Decorative UI elements */}
        <div style={{ position: 'absolute', bottom: 60, display: 'flex', gap: 30, opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0052FF', boxShadow: '0 0 10px #0052FF' }} />
                <div style={{ color: '#64748B', fontSize: 24, fontFamily: 'monospace' }}>LIVE ON BASE</div>
            </div>
        </div>
      </div>
    ),
    { ...size }
  )
}