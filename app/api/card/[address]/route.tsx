import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getSupabaseClient } from '../../../../lib/supabase'

export const runtime = 'edge'

// Rank configurations
const RANK_CONFIG: Record<string, { gradient: string; glow: string; label: string; color: string }> = {
  'OG LEGEND': {
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
    glow: 'rgba(251, 191, 36, 0.5)',
    label: 'OG LEGEND',
    color: '#fbbf24'
  },
  'GENESIS PIONEER': {
    gradient: 'linear-gradient(135deg, #fcd34d 0%, #f97316 50%, #fbbf24 100%)',
    glow: 'rgba(245, 158, 11, 0.4)',
    label: 'GENESIS PIONEER',
    color: '#f97316'
  },
  'EARLY SETTLER': {
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #14b8a6 50%, #06b6d4 100%)',
    glow: 'rgba(6, 182, 212, 0.4)',
    label: 'EARLY SETTLER',
    color: '#06b6d4'
  },
  'BASE CITIZEN': {
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #94a3b8 100%)',
    glow: 'rgba(148, 163, 184, 0.3)',
    label: 'BASE CITIZEN',
    color: '#94a3b8'
  },
}

const BASE_LAUNCH_DATE = new Date('2023-08-09T00:00:00Z')

async function getWalletData(address: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    
    const params = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: '1',
      sort: 'asc'
    })

    const response = await fetch(
      `https://base.blockscout.com/api?${params.toString()}`,
      { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      }
    )
    clearTimeout(timeoutId)
    
    const data = await response.json()

    if (data.status === '0' || !data.result || data.result.length === 0) {
      return null
    }

    const firstTx = data.result[0]
    const txDate = new Date(parseInt(firstTx.timeStamp) * 1000)

    const diffTime = Math.abs(new Date().getTime() - txDate.getTime())
    const daysSinceJoined = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const diffFromLaunch = Math.abs(txDate.getTime() - BASE_LAUNCH_DATE.getTime())
    const daysSinceLaunch = Math.ceil(diffFromLaunch / (1000 * 60 * 60 * 24))
    const isPreLaunch = txDate < BASE_LAUNCH_DATE

    let rank = 'BASE CITIZEN'
    if (isPreLaunch || daysSinceLaunch <= 30) {
      rank = 'OG LEGEND'
    } else if (daysSinceLaunch <= 180) {
      rank = 'GENESIS PIONEER'
    } else if (daysSinceLaunch <= 365) {
      rank = 'EARLY SETTLER'
    }

    return {
      rank,
      daysSinceJoined,
      firstTxDate: txDate.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' }),
      blockNumber: firstTx.blockNumber,
    }
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    
    const walletData = await getWalletData(address)

    // Fetch user profile from Supabase for PFP
    let userPfp = null
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data } = await supabase
          .from('users')
          .select('pfp_url')
          .ilike('address', address) // Case-insensitive match
          .single()
        
        if (data && data.pfp_url) {
          userPfp = data.pfp_url
        }
      }
    } catch (err) {
      console.warn('Error fetching user profile for card:', err)
    }
    
    const rank = walletData?.rank || 'BASE CITIZEN'
    const rankConfig = RANK_CONFIG[rank] || RANK_CONFIG['BASE CITIZEN']
    const daysSinceJoined = walletData?.daysSinceJoined || 0
    const firstTxDate = walletData?.firstTxDate || 'Unknown'
    const blockNumber = walletData?.blockNumber || '0'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#0a0a0f',
            backgroundImage: 'linear-gradient(135deg, #050505 0%, #1a1a2e 50%, #16213e 100%)',
            fontFamily: 'sans-serif',
            padding: 80, // Increased padding
            position: 'relative',
          }}
        >
          {/* Background Pattern/Noise (Optional overlay) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />

          {/* Glow Effect */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%',
            width: 800, 
            height: 500, 
            background: rankConfig.glow,
            filter: 'blur(180px)',
            borderRadius: 9999,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            opacity: 0.4 // Reduced opacity slightly
          }} />

          {/* Border Gradient Line Top */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 8,
            background: rankConfig.gradient,
          }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 20, color: '#94a3b8', letterSpacing: 6, fontWeight: 600 }}>BASEGENESIS</span>
                <span style={{ fontSize: 28, color: 'white', fontWeight: 800, letterSpacing: 2, marginTop: 8 }}>ID SYSTEM</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {userPfp && (
                  <img
                    src={userPfp}
                    width="80"
                    height="80"
                    style={{
                      borderRadius: 40,
                      marginRight: 24,
                      border: `3px solid ${rankConfig.color}`,
                      objectFit: 'cover',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
                    }}
                  />
                )}
                <div style={{ 
                  display: 'flex',
                  padding: '10px 20px',
                  background: 'rgba(0, 82, 255, 0.15)',
                  borderRadius: 14,
                  border: '2px solid rgba(0, 82, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#4F8BFF' }}>BASE</span>
                </div>
              </div>
            </div>

            {/* Rank Title (Center) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', flex: 1, zIndex: 10 }}>
              <span style={{ 
                fontSize: 72, // Reduced size
                fontWeight: 900, 
                color: 'transparent',
                backgroundClip: 'text',
                backgroundImage: rankConfig.gradient,
                letterSpacing: -2,
                lineHeight: 1,
                textShadow: `0 0 80px ${rankConfig.glow}`
              }}>
                {rank}
              </span>
              
              {/* Decorative line under rank */}
              <div style={{ 
                width: 160, 
                height: 5, 
                background: rankConfig.gradient,
                borderRadius: 3,
                marginTop: 20,
              }} />
            </div>

            {/* Footer Stats */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 24,
              padding: 28,
              border: '1px solid rgba(255,255,255,0.1)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', gap: 48 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6, letterSpacing: 1 }}>JOINED</span>
                  <span style={{ fontSize: 24, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>{firstTxDate}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6, letterSpacing: 1 }}>DAYS</span>
                  <span style={{ fontSize: 24, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>{daysSinceJoined}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, color: '#94a3b8', marginBottom: 6, letterSpacing: 1 }}>BLOCK</span>
                  <span style={{ fontSize: 24, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>#{blockNumber}</span>
                </div>
              </div>
              
              {/* Address Badge */}
              <div style={{ 
                display: 'flex', 
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <span style={{ fontSize: 18, color: '#cbd5e1', fontFamily: 'monospace' }}>{shortAddress}</span>
              </div>
            </div>

        </div>
      ),
      { 
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'Content-Type': 'image/png',
        },
      }
    )
  } catch (error) {
    console.error('Card generation error:', error)
    
    // Return a simple fallback image
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
            backgroundColor: '#0f0c29',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: 48, color: 'white', fontWeight: 700 }}>BaseGenesis</span>
          <span style={{ fontSize: 24, color: '#64748b', marginTop: 16 }}>Check your Base Genesis rank</span>
        </div>
      ),
      { 
        width: 1200,
        height: 800,
        headers: {
          'Cache-Control': 'public, max-age=60',
          'Content-Type': 'image/png',
        },
      }
    )
  }
}
