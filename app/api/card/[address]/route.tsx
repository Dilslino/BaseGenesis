
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getSupabaseClient } from '../../../../lib/supabase'

export const runtime = 'edge'

// Simplified Rank Config (Solid colors for safety)
const RANK_CONFIG: Record<string, { color: string }> = {
  'OG LEGEND': { color: '#FCD34D' },      // Yellow
  'GENESIS PIONEER': { color: '#FDBA74' }, // Orange
  'EARLY SETTLER': { color: '#67E8F9' },   // Cyan
  'BASE CITIZEN': { color: '#CBD5E1' },    // Slate
}

const BASE_LAUNCH_DATE = new Date('2023-08-09T00:00:00Z')

async function getWalletData(address: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // Reduced timeout
    
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
    
    // Parallel fetching for speed
    const [walletData, userPfpData] = await Promise.all([
      getWalletData(address),
      (async () => {
        try {
          const supabase = getSupabaseClient()
          if (!supabase) return null
          const { data } = await supabase
            .from('users')
            .select('pfp_url')
            .ilike('address', address)
            .single()
          return data?.pfp_url
        } catch {
          return null
        }
      })()
    ])
    
    const rank = walletData?.rank || 'BASE CITIZEN'
    const rankConfig = RANK_CONFIG[rank] || RANK_CONFIG['BASE CITIZEN']
    const daysSinceJoined = walletData?.daysSinceJoined || 0
    const firstTxDate = walletData?.firstTxDate || 'Unknown'
    const blockNumber = walletData?.blockNumber || '0'
    const shortHash = walletData?.firstTxHash ? `${walletData.firstTxHash.slice(0, 4)}...${walletData.firstTxHash.slice(-4)}` : '0x...';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#050505', // Solid dark background
            fontFamily: 'sans-serif',
            padding: 80,
            position: 'relative',
          }}
        >
          {/* Simple Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom right, #111, #000)',
            zIndex: 0
          }} />

          {/* Content Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            width: '100%',
            zIndex: 10,
            border: `2px solid ${rankConfig.color}`, // Simple border based on rank
            borderRadius: 32,
            padding: 40,
            background: 'rgba(255,255,255,0.03)'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 16, color: '#888', letterSpacing: 4, fontWeight: 600 }}>BASEGENESIS</span>
                  <span style={{ fontSize: 24, color: 'white', fontWeight: 800, marginTop: 4 }}>ID SYSTEM</span>
               </div>
               
               {/* PFP - Simplified */}
               {userPfpData ? (
                 <img 
                   src={userPfpData}
                   width="80"
                   height="80"
                   style={{
                     borderRadius: 40,
                     border: `2px solid ${rankConfig.color}`,
                     objectFit: 'cover',
                   }}
                 />
               ) : (
                 <div style={{
                    width: 80, height: 80, borderRadius: 40,
                    border: '2px solid #333',
                    background: '#222',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#555', fontSize: 24
                 }}>
                    BG
                 </div>
               )}
            </div>

            {/* Rank Title */}
            <div style={{ display: 'flex', flexDirection: 'column', margin: '40px 0' }}>
               <span style={{ 
                 fontSize: 72, 
                 fontWeight: 900, 
                 color: rankConfig.color,
                 lineHeight: 1,
                 letterSpacing: -2
               }}>
                 {rank}
               </span>
               <div style={{ width: 100, height: 6, background: rankConfig.color, marginTop: 16, borderRadius: 3 }} />
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: 40 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>JOINED</span>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 700 }}>{firstTxDate}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>DAYS</span>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 700 }}>{daysSinceJoined}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>BLOCK</span>
                        <span style={{ fontSize: 24, color: 'white', fontWeight: 700 }}>#{blockNumber}</span>
                    </div>
                </div>
                
                {/* Hash */}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                   <span style={{ 
                     fontSize: 18, 
                     color: '#60A5FA', 
                     background: 'rgba(0, 82, 255, 0.1)', 
                     padding: '8px 16px', 
                     borderRadius: 8,
                     fontFamily: 'monospace' 
                   }}>
                     {shortHash}
                   </span>
                </div>
            </div>

          </div>
        </div>
      ),
      { 
        width: 1200,
        height: 800,
      }
    )
  } catch (error) {
    console.error('Card generation error:', error)
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <span style={{ color: 'white', fontSize: 40, fontWeight: 'bold' }}>BaseGenesis Card</span>
        </div>
      ),
      { width: 1200, height: 800 }
    )
  }
}
