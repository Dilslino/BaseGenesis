
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getSupabaseClient } from '../../../../lib/supabase'

export const runtime = 'edge'

// Rank configurations matching FlexCard styles
const RANK_CONFIG: Record<string, { gradient: string; border: string; glow: string; color: string; icon: string }> = {
  'OG LEGEND': {
    gradient: 'linear-gradient(135deg, rgba(10,8,5,0.95) 0%, rgba(5,5,8,0.9) 50%, rgba(8,5,2,0.95) 100%)',
    border: 'rgba(234, 179, 8, 0.4)', // yellow-500/40
    glow: 'rgba(234, 179, 8, 0.3)',
    color: '#FCD34D', // amber-300
    icon: '👑'
  },
  'GENESIS PIONEER': {
    gradient: 'linear-gradient(135deg, rgba(8,5,5,0.95) 0%, rgba(5,5,8,0.9) 50%, rgba(5,5,2,0.95) 100%)',
    border: 'rgba(245, 158, 11, 0.3)', // amber-500/30
    glow: 'rgba(245, 158, 11, 0.25)',
    color: '#FDBA74', // orange-300
    icon: '🏆'
  },
  'EARLY SETTLER': {
    gradient: 'linear-gradient(135deg, rgba(5,16,21,0.95) 0%, rgba(5,5,16,0.9) 50%, rgba(5,16,16,0.95) 100%)',
    border: 'rgba(6, 182, 212, 0.3)', // cyan-500/30
    glow: 'rgba(6, 182, 212, 0.25)',
    color: '#67E8F9', // cyan-300
    icon: '⚡'
  },
  'BASE CITIZEN': {
    gradient: 'linear-gradient(135deg, rgba(10,10,16,0.95) 0%, rgba(8,8,18,0.9) 50%, rgba(10,10,15,0.95) 100%)',
    border: 'rgba(100, 116, 139, 0.25)', // slate-500/25
    glow: 'rgba(148, 163, 184, 0.2)',
    color: '#CBD5E1', // slate-300
    icon: '🌐'
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
      firstTxHash: firstTx.hash,
    }
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return null
  }
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    
    const walletData = await getWalletData(address)

    // Fetch user profile from Supabase for PFP
    let userPfp = null
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data } = await supabase
          .from('users')
          .select('pfp_url')
          .ilike('address', address)
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
    const txHash = walletData?.firstTxHash ? `${walletData.firstTxHash.slice(0, 4)}...${walletData.firstTxHash.slice(-4)}` : '0x...';

    const rankTitle = rank.split(' '); // ["OG", "LEGEND"]

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
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Card Container - Replicating FlexCard style */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 900,
            height: 570, // Aspect ratio ~1.58
            background: rankConfig.gradient,
            borderRadius: 32,
            border: `2px solid ${rankConfig.border}`,
            padding: 48,
            position: 'relative',
            boxShadow: `0 20px 60px -10px ${rankConfig.glow}`,
            overflow: 'hidden',
          }}>
            
            {/* Background Decor */}
            <div style={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 300,
              height: 300,
              background: rankConfig.glow,
              filter: 'blur(80px)',
              borderRadius: 9999,
              opacity: 0.4
            }} />

            {/* Top Row: Brand & Chip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, color: '#9ca3af', fontFamily: 'monospace', letterSpacing: 4, textTransform: 'uppercase' }}>BaseGenesis</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: 2, marginTop: 4 }}>ID SYSTEM</span>
               </div>
               
               {/* Chip or PFP */}
               {userPfp ? (
                 <img 
                   src={userPfp}
                   width="80"
                   height="80"
                   style={{
                     borderRadius: 40,
                     border: '2px solid rgba(255,255,255,0.2)',
                     objectFit: 'cover',
                   }}
                 />
               ) : (
                 <div style={{
                    width: 80,
                    height: 56,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.2), rgba(234, 179, 8, 0.2))',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4
                 }}>
                    <div style={{ width: 2, height: 24, background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ width: 2, height: 24, background: 'rgba(255,255,255,0.3)' }} />
                    <div style={{ width: 2, height: 24, background: 'rgba(255,255,255,0.3)' }} />
                 </div>
               )}
            </div>

            {/* Middle: Rank Title */}
            <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 64, marginRight: 16 }}>{rankConfig.icon}</span>
                  <span style={{ 
                    fontSize: 80, 
                    fontWeight: 900, 
                    fontStyle: 'italic',
                    letterSpacing: -2,
                    color: 'transparent',
                    backgroundClip: 'text',
                    backgroundImage: `linear-gradient(to right, ${rankConfig.color}, white)`,
                    textShadow: `0 0 40px ${rankConfig.glow}`
                  }}>
                    {rankTitle[0]} <span style={{ fontSize: 60 }}>{rankTitle[1]}</span>
                  </span>
                </div>
                
                {/* Decorative Line */}
                <div style={{ 
                  height: 6, 
                  width: 180, 
                  background: `linear-gradient(to right, ${rankConfig.color}, transparent)`,
                  borderRadius: 3,
                  marginTop: 8
                }} />
            </div>

            {/* Bottom: Stats Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {/* Joined */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 16, color: '#9ca3af', fontFamily: 'monospace', textTransform: 'uppercase' }}>JOINED</span>
                        </div>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>{firstTxDate}</span>
                    </div>

                    {/* Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 16, color: '#9ca3af', fontFamily: 'monospace', textTransform: 'uppercase' }}>DAYS</span>
                        </div>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 700, fontFamily: 'monospace' }}>{daysSinceJoined}</span>
                    </div>
                </div>

                {/* Hash / Footer */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 16
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, color: '#6b7280', fontFamily: 'monospace' }}>GENESIS TX</span>
                    </div>
                    <div style={{ 
                        background: 'rgba(0, 82, 255, 0.15)',
                        border: '1px solid rgba(0, 82, 255, 0.3)',
                        borderRadius: 8,
                        padding: '4px 12px',
                    }}>
                        <span style={{ fontSize: 16, color: '#60A5FA', fontFamily: 'monospace' }}>{txHash}</span>
                    </div>
                </div>
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
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <span style={{ color: 'white', fontSize: 32 }}>Error Generating Card</span>
        </div>
      ),
      { width: 1200, height: 800 }
    )
  }
}
