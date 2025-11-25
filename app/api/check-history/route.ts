
import { NextResponse } from 'next/server';
import { BASE_LAUNCH_DATE, RANK_THRESHOLDS, MOCK_LEADERBOARD } from '../../../constants';
import { UserRank, LeaderboardEntry } from '../../../types';
import { supabase } from '../../lib/supabase';

// Blockscout API Configuration (Base Mainnet)
const BLOCKSCOUT_API_URL = 'https://base.blockscout.com/api';

export async function POST(request: Request) {
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

    const fetchUrl = `${BLOCKSCOUT_API_URL}?${params.toString()}`;
    const response = await fetch(fetchUrl, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 } 
    });
    
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
    const txDate = new Date(parseInt(firstTx.timeStamp) * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - txDate.getTime());
    const daysSinceJoined = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const diffFromLaunch = Math.abs(txDate.getTime() - BASE_LAUNCH_DATE.getTime());
    const daysSinceLaunch = Math.ceil(diffFromLaunch / (1000 * 60 * 60 * 24));
    const isPreLaunch = txDate < BASE_LAUNCH_DATE;

    let rank = UserRank.BASE_CITIZEN;
    if (isPreLaunch || daysSinceLaunch <= RANK_THRESHOLDS.PIONEER_DAYS) {
      rank = UserRank.GENESIS_PIONEER;
    } else if (daysSinceLaunch <= RANK_THRESHOLDS.SETTLER_DAYS) {
      rank = UserRank.EARLY_SETTLER;
    }

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
                first_tx_date: txDate.toISOString()
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

    // Jika DB kosong atau gagal, gunakan Mock data dicampur user saat ini
    if (realLeaderboard.length === 0) {
        realLeaderboard = [...MOCK_LEADERBOARD];
        // Tambahkan user saat ini jika belum ada
        if (!realLeaderboard.find(u => u.address === address)) {
             realLeaderboard.push({
                rank: 0, 
                name: "You",
                address: address,
                status: rank,
                days: daysSinceJoined,
                isLegend: false
            });
        }
        // Sort manual
        realLeaderboard.sort((a, b) => b.days - a.days);
        realLeaderboard = realLeaderboard.map((item, idx) => ({ ...item, rank: idx + 1 }));
    }

    return NextResponse.json({
      userData,
      leaderboard: realLeaderboard
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Could not fetch history.' }, { status: 500 });
  }
}
