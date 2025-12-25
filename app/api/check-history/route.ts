
import { NextResponse } from 'next/server';
import { UserRank, LeaderboardEntry } from '../../../types';
import { supabase } from '../../lib/supabase';
import { calculateRank, calculateDaysSinceJoined, parseTimestamp } from '../../../lib/rankUtils';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { fetchWithRetry } from '../../../lib/retryHelper';

// Blockscout API Configuration (Base Mainnet)
const BLOCKSCOUT_API_URL = 'https://base.blockscout.com/api';

export async function POST(request: Request) {
  // Rate limiting: 10 requests per minute per IP
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, { limit: 10, windowSeconds: 60 });
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        }
      }
    );
  }
  
  try {
    const { address } = await request.json();

    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    // 1. FETCH DATA FROM BLOCKCHAIN (Blockscout)
    const params = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: '1', 
      sort: 'asc', 
    });

    const response = await fetchWithRetry(
      `${BLOCKSCOUT_API_URL}?${params.toString()}`,
      {
        headers: { 'Accept': 'application/json' },
      },
      10000,
      { maxAttempts: 2 }
    );
    
    const data = await response.json();

    // Check for API errors
    let firstTx = null;
    if (data.status === '1' && data.result && data.result.length > 0) {
        firstTx = data.result[0];
    } else if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        // Handle Blockscout non-standard success response
        firstTx = data.result[0];
    } else {
        return NextResponse.json({ error: 'This wallet has no transaction history on Base Mainnet.' }, { status: 404 });
    }

    // 2. PROCESS USER DATA
    const txDate = parseTimestamp(firstTx.timeStamp);
    const daysSinceJoined = calculateDaysSinceJoined(txDate);
    const rank = calculateRank(txDate);

    const userData = {
      address,
      firstTxDate: txDate.toISOString(),
      firstTxHash: firstTx.hash,
      daysSinceJoined,
      rank,
      blockNumber: firstTx.blockNumber
    };

    // 3. DATABASE OPERATIONS (SUPABASE)
    // Only attempt if supabase client is initialized (key exists)
    let realLeaderboard: LeaderboardEntry[] = [];
    
    if (supabase) {
        // A. Simpan/Update data user ke database
        const { error: upsertError } = await supabase
            .from('users')
.upsert({
                address: address,
                rank: rank,
                days_since_joined: daysSinceJoined,
                first_tx_date: txDate.toISOString(),
                first_tx_hash: firstTx.hash,
                block_number: parseInt(firstTx.blockNumber, 10)
            }, { onConflict: 'address' });

        if (upsertError) {
            console.error("Supabase Upsert Error:", upsertError);
        }

        // B. Ambil Top 50 Global Leaderboard dari Database
        const { data: dbLeaderboard, error: fetchError } = await supabase
            .from('users')
            .select('address, rank, days_since_joined')
            .order('days_since_joined', { ascending: false })
            .limit(50);

        if (!fetchError && dbLeaderboard) {
            realLeaderboard = dbLeaderboard.map((user: any, index: number) => ({
                rank: index + 1,
                name: user.address === address ? "You" : `User ${user.address.slice(0,4)}`, // Anonymize others
                address: user.address,
                status: user.rank as UserRank,
                days: user.days_since_joined,
                isLegend: false
            }));
        }
    }

    // Return leaderboard (empty array if no data from Supabase)
    return NextResponse.json({
      userData,
      leaderboard: realLeaderboard
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Could not fetch history.' }, { status: 500 });
  }
}
