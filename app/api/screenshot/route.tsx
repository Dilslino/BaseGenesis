import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'home'

  // Mobile screenshot size (9:16 aspect ratio)
  const width = 1170
  const height = 2080

  if (type === 'home') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#020205',
            padding: 60,
            position: 'relative',
          }}
        >
          {/* Background effects */}
          <div style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: '#0052FF', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }} />
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: '#0052FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 50, color: 'white', fontWeight: 900 }}>B</span>
            </div>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>BaseGenesis</span>
          </div>

          {/* Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 100 }}>
            <div style={{ fontSize: 72, marginBottom: 40 }}>🔍</div>
            <h1 style={{ fontSize: 64, fontWeight: 900, color: 'white', margin: 0, marginBottom: 24 }}>
              Discover Your
            </h1>
            <h1 style={{ fontSize: 64, fontWeight: 900, background: 'linear-gradient(90deg, #0052FF, #00D4FF)', backgroundClip: 'text', color: 'transparent', margin: 0, marginBottom: 40 }}>
              Base Origin
            </h1>
            <p style={{ fontSize: 32, color: '#64748b', maxWidth: 800, lineHeight: 1.5 }}>
              Find out when you first joined Base blockchain and earn your Genesis rank
            </p>
          </div>

          {/* CTA Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
            <div style={{ 
              padding: '32px 80px', 
              background: 'linear-gradient(90deg, #0052FF, #0066FF)', 
              borderRadius: 24,
              fontSize: 36,
              fontWeight: 700,
              color: 'white',
            }}>
              Connect Wallet
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, marginTop: 100 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>10K+</span>
              <span style={{ fontSize: 24, color: '#64748b' }}>Users Scanned</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>4</span>
              <span style={{ fontSize: 24, color: '#64748b' }}>Rank Tiers</span>
            </div>
          </div>
        </div>
      ),
      { width, height, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    )
  }

  if (type === 'card') {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#020205',
            padding: 60,
            position: 'relative',
          }}
        >
          {/* Background effects */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, height: 600, background: '#fbbf24', filter: 'blur(200px)', opacity: 0.15, borderRadius: '50%' }} />
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 60 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: '#0052FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 50, color: 'white', fontWeight: 900 }}>B</span>
            </div>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>BaseGenesis</span>
          </div>

          {/* Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255,255,255,0.05)',
            border: '2px solid rgba(251, 191, 36, 0.4)',
            borderRadius: 48,
            padding: 60,
            marginTop: 40,
            boxShadow: '0 0 100px rgba(251, 191, 36, 0.2)',
          }}>
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 24, color: '#64748b', letterSpacing: 4 }}>BASEGENESIS</span>
                <span style={{ fontSize: 28, color: 'white', fontWeight: 700 }}>ID SYSTEM</span>
              </div>
            </div>

            {/* Rank */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
              <span style={{ fontSize: 80 }}>👑</span>
              <span style={{ fontSize: 56, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #ea580c)', backgroundClip: 'text', color: 'transparent' }}>
                OG LEGEND
              </span>
            </div>
            <div style={{ width: 200, height: 6, background: 'linear-gradient(90deg, #fbbf24, #ea580c)', borderRadius: 3, marginBottom: 60 }} />

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 20, color: '#64748b' }}>📅 JOINED</span>
                <span style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>Aug 10, 23</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 20, color: '#64748b' }}>⏱️ DAYS</span>
                <span style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>842</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 20, color: '#64748b' }}>🔗 BLOCK</span>
                <span style={{ fontSize: 28, color: 'white', fontWeight: 600 }}>#1,234</span>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, padding: '16px 32px', background: 'rgba(0,82,255,0.1)', borderRadius: 16, border: '1px solid rgba(0,82,255,0.2)' }}>
              <span style={{ fontSize: 24, color: '#0052FF' }}>0x71f8...C82b</span>
            </div>
          </div>

          {/* Achievements Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 60 }}>
            {['👣', '🏆', '🐦', '🚀', '💪', '🎂'].map((emoji, i) => (
              <div key={i} style={{ width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {emoji}
              </div>
            ))}
          </div>
        </div>
      ),
      { width, height, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    )
  }

  if (type === 'leaderboard') {
    const mockLeaderboard = [
      { rank: 1, name: 'jessepollak', status: 'OG LEGEND', days: 842, emoji: '👑' },
      { rank: 2, name: 'dwr.eth', status: 'OG LEGEND', days: 840, emoji: '👑' },
      { rank: 3, name: 'vitalik.eth', status: 'OG LEGEND', days: 838, emoji: '👑' },
      { rank: 4, name: 'base', status: 'PIONEER', days: 720, emoji: '🏆' },
      { rank: 5, name: 'coinbase', status: 'PIONEER', days: 700, emoji: '🏆' },
    ]

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#020205',
            padding: 60,
            position: 'relative',
          }}
        >
          {/* Background effects */}
          <div style={{ position: 'absolute', top: 200, right: -100, width: 500, height: 500, background: '#0052FF', filter: 'blur(180px)', opacity: 0.1, borderRadius: '50%' }} />
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 60 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: '#0052FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 50, color: 'white', fontWeight: 900 }}>B</span>
            </div>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>BaseGenesis</span>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 60 }}>
            <span style={{ fontSize: 56 }}>🏆</span>
            <span style={{ fontSize: 48, fontWeight: 700, color: 'white' }}>Leaderboard</span>
          </div>

          {/* Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {mockLeaderboard.map((user) => (
              <div
                key={user.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '32px 40px',
                  background: user.rank <= 3 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)',
                  border: user.rank <= 3 ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 24,
                }}
              >
                <span style={{ fontSize: 36, fontWeight: 700, color: user.rank <= 3 ? '#fbbf24' : '#64748b', width: 60 }}>
                  #{user.rank}
                </span>
                <span style={{ fontSize: 36 }}>{user.emoji}</span>
                <span style={{ fontSize: 32, fontWeight: 600, color: 'white', marginLeft: 24, flex: 1 }}>
                  {user.name}
                </span>
                <span style={{ fontSize: 28, color: '#64748b' }}>
                  {user.days} days
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
      { width, height, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    )
  }

  // Default fallback
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0052FF' }}>
        <span style={{ fontSize: 120, color: 'white', fontWeight: 900 }}>BaseGenesis</span>
      </div>
    ),
    { width, height }
  )
}
