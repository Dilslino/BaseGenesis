import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
          backgroundColor: '#0052FF',
          position: 'relative',
        }}
      >
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />

        {/* Outer ring */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '8px solid rgba(255,255,255,0.6)',
          boxShadow: '0 0 60px rgba(255,255,255,0.3)',
          position: 'relative',
        }}>
          {/* Middle ring */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '6px solid rgba(255,255,255,0.5)',
            position: 'relative',
          }}>
            {/* Inner ring */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 130,
              height: 130,
              borderRadius: '50%',
              border: '5px solid rgba(255,255,255,0.4)',
              position: 'relative',
            }}>
              {/* Center sphere */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #4d8fff 0%, #0052FF 50%, #003399 100%)',
                boxShadow: '0 0 30px rgba(0,82,255,0.5), inset 0 -10px 20px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>
        </div>

        {/* Floating cubes */}
        <div style={{
          position: 'absolute',
          top: 100,
          right: 130,
          width: 30,
          height: 30,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 20px rgba(255,255,255,0.5)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 120,
          left: 110,
          width: 35,
          height: 35,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 20px rgba(255,255,255,0.5)',
        }} />
        <div style={{
          position: 'absolute',
          top: 180,
          left: 100,
          width: 25,
          height: 25,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 15px rgba(255,255,255,0.4)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 150,
          right: 100,
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%)',
          transform: 'rotate(45deg)',
          boxShadow: '0 0 15px rgba(255,255,255,0.4)',
        }} />
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
