
import { NextResponse } from 'next/server';
import { UserRank, LeaderboardEntry, Achievement } from '../../../types';
import { getSupabase } from '../../lib/supabase';
import { calculateRank, calculateDaysSinceJoined, parseTimestamp } from '../../../lib/rankUtils';
import { checkRateLimit, getClientIp } from '../../../lib/rateLimit';
import { fetchWithRetry } from '../../../lib/retryHelper';
import { ACHIEVEMENTS_LIST } from '../../../constants';

// Blockscout API Configuration (Base Mainnet)
const BLOCKSCOUT_API_URL = 'https://base.blockscout.com/api';
const MAX_TX_PAGES = 10; // Max pages to fetch (10 pages x 1000 = 10,000 tx max)
const TX_PER_PAGE = 1000;

interface BlockscoutTransaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  blockNumber: string;
  value?: string;
  isError?: string;
}

/**
 * Fetch all transactions for an address (with pagination)
 */
async function fetchAllTransactions(address: string): Promise<BlockscoutTransaction[]> {
  const allTransactions: BlockscoutTransaction[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= MAX_TX_PAGES) {
    const params = new URLSearchParams({
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: '0',
      endblock: '99999999',
      page: page.toString(),
      offset: TX_PER_PAGE.toString(),
      sort: 'asc',
    });

    try {
      const response = await fetchWithRetry(
        `${BLOCKSCOUT_API_URL}?${params.toString()}`,
        {
          headers: { 'Accept': 'application/json' },
        },
        15000, // 15s timeout per request
        { maxAttempts: 2 }
      );

      const data = await response.json();

      if (data.status === '1' && data.result && Array.isArray(data.result) && data.result.length > 0) {
        allTransactions.push(...data.result);
        
        // If we got less than the limit, we've reached the end
        if (data.result.length < TX_PER_PAGE) {
          hasMore = false;
        } else {
          page++;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  return allTransactions;
}

/**
 * Calculate achievements based on user data
 */
function calculateAchievements(
  _firstTxDate: Date,
  blockNumber: number,
  txCount: number,
  daysSinceJoined: number,
  rank: UserRank
): Achievement[] {
  const achievements: Achievement[] = ACHIEVEMENTS_LIST.map(a => ({ ...a, unlocked: false }));

  // First Step - Made first transaction
  const firstStep = achievements.find(a => a.id === 'first_tx');
  if (firstStep) firstStep.unlocked = true;

  // Genesis Pioneer - Joined in first month (OG)
  const pioneer = achievements.find(a => a.id === 'pioneer');
  if (pioneer && rank === UserRank.OG_LEGEND) {
    pioneer.unlocked = true;
  }

  // Early Bird - Joined in first 6 months
  const earlyBird = achievements.find(a => a.id === 'early_bird');
  if (earlyBird && (rank === UserRank.OG_LEGEND || rank === UserRank.GENESIS_PIONEER)) {
    earlyBird.unlocked = true;
  }

  // Transaction milestones
  const tx10 = achievements.find(a => a.id === 'tx_10');
  if (tx10 && txCount >= 10) tx10.unlocked = true;

  const tx100 = achievements.find(a => a.id === 'tx_100');
  if (tx100 && txCount >= 100) tx100.unlocked = true;

  const tx1000 = achievements.find(a => a.id === 'tx_1000');
  if (tx1000 && txCount >= 1000) tx1000.unlocked = true;

  // Anniversary - Been on Base for 1+ year (365 days)
  const anniversary = achievements.find(a => a.id === 'year_1');
  if (anniversary && daysSinceJoined >= 365) anniversary.unlocked = true;

  // Block Legend - First tx before block 1,000,000
  const blockLegend = achievements.find(a => a.id === 'og_block');
  if (blockLegend && blockNumber < 1000000) blockLegend.unlocked = true;

  return achievements;
}

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

    // 1. FETCH ALL TRANSACTIONS FROM BLOCKCHAIN (Blockscout)
    const allTransactions = await fetchAllTransactions(address);
    
    if (allTransactions.length === 0) {
      return NextResponse.json({ error: 'This wallet has no transaction history on Base Mainnet.' }, { status: 404 });
    }

    // Get first transaction (oldest)
    const firstTx = allTransactions[0];
    const txCount = allTransactions.length;

    // 2. PROCESS USER DATA
    const txDate = parseTimestamp(firstTx.timeStamp);
    const daysSinceJoined = calculateDaysSinceJoined(txDate);
    const rank = calculateRank(txDate);
    const blockNumber = parseInt(firstTx.blockNumber, 10);

    // 3. CALCULATE ACHIEVEMENTS
    const achievements = calculateAchievements(
      txDate,
      blockNumber,
      txCount,
      daysSinceJoined,
      rank
    );

    const userData: any = { // Use any temporarily or update interface import
      address,
      firstTxDate: txDate.toISOString(),
      firstTxHash: firstTx.hash,
      daysSinceJoined,
      rank,
      blockNumber: firstTx.blockNumber,
      txCount,
      achievements,
    };

    // 4. DATABASE OPERATIONS (SUPABASE)
    let realLeaderboard: LeaderboardEntry[] = [];
    const supabase = getSupabase();
    
    if (supabase) {
      // A. Simpan/Update data user ke database (with txCount)
      // We also select pfp_url and username to return to the frontend
      const { data: upsertData, error: upsertError } = await supabase
        .from('users')
        .upsert({
          address: address,
          rank: rank,
          days_since_joined: daysSinceJoined,
          first_tx_date: txDate.toISOString(),
          first_tx_hash: firstTx.hash,
          block_number: blockNumber,
          tx_count: txCount,
        }, { onConflict: 'address' })
        .select('pfp_url, username')
        .single();

      if (upsertError) {
        console.error("Supabase Upsert Error:", upsertError);
      } else if (upsertData) {
        // Attach profile data to response
        userData.pfpUrl = upsertData.pfp_url;
        userData.username = upsertData.username;
      }

      // B. Ambil Top 50 Global Leaderboard dari Database
      const { data: dbLeaderboard, error: fetchError } = await supabase
        .from('users')
        .select('address, rank, days_since_joined, tx_count')
        .order('days_since_joined', { ascending: false })
        .limit(50);

      if (!fetchError && dbLeaderboard) {
        realLeaderboard = dbLeaderboard.map((user: any, index: number) => ({
          rank: index + 1,
          name: user.address === address ? "You" : `User ${user.address.slice(0,4)}`,
          address: user.address,
          status: user.rank as UserRank,
          days: user.days_since_joined,
          isLegend: user.rank === UserRank.OG_LEGEND,
          txCount: user.tx_count || 0,
        }));
      }
    }

    // Return complete data
    return NextResponse.json({
      userData,
      leaderboard: realLeaderboard
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Could not fetch history.' }, { status: 500 });
  }
}
