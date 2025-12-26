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
          .eq('address', address) // Supabase query is case-insensitive usually but standardizing helps
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
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0f',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Background */}
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
            display: 'flex',
          }} />
          
          {/* Glow Effect */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%',
            width: 500, 
            height: 300, 
            background: rankConfig.glow,
            filter: 'blur(120px)',
            borderRadius: 9999,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }} />

          {/* Card Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: 700,
            height: 480,
            background: 'rgba(20, 20, 30, 0.9)',
            borderRadius: 32,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            padding: 48,
            position: 'relative',
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 16, color: '#64748b', letterSpacing: 4 }}>BASEGENESIS</span>
                <span style={{ fontSize: 20, color: 'white', fontWeight: 700, letterSpacing: 2 }}>ID CARD</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {userPfp && (
                  <img
                    src={userPfp}
                    width="64"
                    height="64"
                    style={{
                      borderRadius: 32,
                      marginRight: 16,
                      border: `2px solid ${rankConfig.color}`,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div style={{ 
                  display: 'flex',
                  padding: '8px 16px',
                  background: 'rgba(0, 82, 255, 0.2)',
                  borderRadius: 8,
                  border: '1px solid rgba(0, 82, 255, 0.3)',
                }}>
                  <span style={{ fontSize: 14, color: '#0052FF' }}>BASE</span>
                </div>
              </div>
            </div>

            {/* Rank Title */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 40 }}>
              <span style={{ 
                fontSize: 56, 
                fontWeight: 900, 
                color: rankConfig.color,
                letterSpacing: 2,
              }}>
                {rank}
              </span>
              <div style={{ 
                width: 120, 
                height: 4, 
                background: rankConfig.gradient,
                borderRadius: 2,
                marginTop: 12,
                display: 'flex',
              }} />
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>JOINED</span>
                <span style={{ fontSize: 20, color: 'white', fontWeight: 600 }}>{firstTxDate}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>DAYS ON BASE</span>
                <span style={{ fontSize: 20, color: 'white', fontWeight: 600 }}>{daysSinceJoined}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>FIRST BLOCK</span>
                <span style={{ fontSize: 20, color: 'white', fontWeight: 600 }}>#{blockNumber}</span>
              </div>
            </div>

            {/* Address */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginTop: 24,
              padding: '12px 24px',
              background: 'rgba(0, 82, 255, 0.1)',
              borderRadius: 12,
              border: '1px solid rgba(0, 82, 255, 0.2)',
            }}>
              <span style={{ fontSize: 18, color: '#0052FF', fontFamily: 'monospace' }}>{shortAddress}</span>
            </div>
          </div>

        </div>
      ),
      { 
        width: 1200,
        height: 800,
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
