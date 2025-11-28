import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const RANK_COLORS: Record<string, { gradient: string; glow: string; emoji: string }> = {
  'OG LEGEND': { 
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
    glow: 'rgba(251, 191, 36, 0.5)',
    emoji: '👑'
  },
  'GENESIS PIONEER': { 
    gradient: 'linear-gradient(135deg, #fcd34d 0%, #f97316 50%, #fbbf24 100%)',
    glow: 'rgba(245, 158, 11, 0.4)',
    emoji: '🏆'
  },
  'EARLY SETTLER': { 
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #14b8a6 50%, #06b6d4 100%)',
    glow: 'rgba(6, 182, 212, 0.4)',
    emoji: '⚡'
  },
  'BASE CITIZEN': { 
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #94a3b8 100%)',
    glow: 'rgba(148, 163, 184, 0.3)',
    emoji: '🌐'
  },
}

async function getWalletData(address: string) {
  try {
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

    const response = await fetch(`https://base.blockscout.com/api?${params.toString()}`)
    const data = await response.json()

    if (data.status === '0' || !data.result || data.result.length === 0) {
      return null
    }

    const firstTx = data.result[0]
    const txDate = new Date(parseInt(firstTx.timeStamp) * 1000)
    const baseLaunchDate = new Date('2023-08-09T00:00:00Z')
    
    const diffTime = Math.abs(new Date().getTime() - txDate.getTime())
    const daysSinceJoined = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const diffFromLaunch = Math.abs(txDate.getTime() - baseLaunchDate.getTime())
    const daysSinceLaunch = Math.ceil(diffFromLaunch / (1000 * 60 * 60 * 24))
    const isPreLaunch = txDate < baseLaunchDate

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
  const { address } = await params
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  
  const walletData = await getWalletData(address)
  
  const rank = walletData?.rank || 'BASE CITIZEN'
  const rankConfig = RANK_COLORS[rank] || RANK_COLORS['BASE CITIZEN']
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
          backgroundColor: '#0f0c29',
          position: 'relative',
        }}
      >
        {/* Background Gradient */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' 
        }} />
        
        {/* Glow Effect */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          width: 600, 
          height: 400, 
          background: rankConfig.glow,
          filter: 'blur(100px)',
          borderRadius: '50%',
        }} />

        {/* Card Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: 560,
          height: 354,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: 32,
          border: '2px solid rgba(255, 255, 255, 0.15)',
          padding: 32,
          boxShadow: `0 0 60px ${rankConfig.glow}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner Glow */}
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: rankConfig.gradient,
            filter: 'blur(80px)',
            opacity: 0.4,
            borderRadius: '50%',
          }} />

          {/* Top Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, color: '#64748b', letterSpacing: 3, fontFamily: 'monospace' }}>BASEGENESIS</span>
              <span style={{ fontSize: 18, color: 'white', fontWeight: 700, letterSpacing: 2 }}>ID SYSTEM</span>
            </div>
            <div style={{ 
              display: 'flex',
              width: 60, 
              height: 45, 
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', gap: 2 }}>
                <div style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.3)' }} />
                <div style={{ width: 2, height: 20, background: 'rgba(255,255,255,0.3)' }} />
              </div>
            </div>
          </div>

          {/* Rank */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 12,
              fontSize: 48, 
              fontWeight: 900, 
              fontStyle: 'italic',
              background: rankConfig.gradient,
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              <span style={{ fontSize: 48 }}>{rankConfig.emoji}</span>
              <span>{rank}</span>
            </div>
            <div style={{ 
              width: 120, 
              height: 4, 
              background: rankConfig.gradient,
              borderRadius: 2,
              marginTop: 8,
            }} />
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>📅 JOINED</span>
              <span style={{ fontSize: 16, color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{firstTxDate}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>⏱️ DAYS</span>
              <span style={{ fontSize: 16, color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>{daysSinceJoined}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>🔗 BLOCK</span>
              <span style={{ fontSize: 16, color: 'white', fontWeight: 600, fontFamily: 'monospace' }}>#{blockNumber}</span>
            </div>
          </div>

          {/* Address Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: 16,
            padding: '8px 16px',
            background: 'rgba(0, 82, 255, 0.1)',
            borderRadius: 12,
            border: '1px solid rgba(0, 82, 255, 0.2)',
          }}>
            <span style={{ fontSize: 14, color: '#0052FF', fontFamily: 'monospace' }}>{shortAddress}</span>
          </div>
        </div>

        {/* Branding */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginTop: 24,
          opacity: 0.6,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052FF' }} />
          <span style={{ color: '#64748b', fontSize: 14, fontFamily: 'monospace' }}>basegenesis.vercel.app</span>
        </div>
      </div>
    ),
    { 
      width: 1200, 
      height: 630,
    }
  )
}
