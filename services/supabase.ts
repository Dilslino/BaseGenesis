import { createClient } from '@supabase/supabase-js';
import { UserGenesisData, UserRank, LeaderboardEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id?: string;
  address: string;
  username?: string;
  pfp_url?: string;
  fid?: number;
  rank: string;
  days_since_joined: number;
  first_tx_date: string;
  first_tx_hash: string;
  block_number: string;
  tx_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Save user profile to database (only for connected wallets)
export const saveUserProfile = async (
  userData: UserGenesisData,
  farcasterUser?: { username?: string; pfpUrl?: string; fid?: number }
): Promise<boolean> => {
  try {
    const profile: UserProfile = {
      address: userData.address.toLowerCase(),
      username: farcasterUser?.username,
      pfp_url: farcasterUser?.pfpUrl,
      fid: farcasterUser?.fid,
      rank: userData.rank,
      days_since_joined: userData.daysSinceJoined,
      first_tx_date: userData.firstTxDate,
      first_tx_hash: userData.firstTxHash,
      block_number: userData.blockNumber,
      tx_count: userData.txCount,
    };

    const { error } = await supabase
      .from('users')
      .upsert(profile, { 
        onConflict: 'address',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase save error:', err);
    return false;
  }
};

// Get leaderboard from database
export const getLeaderboard = async (limit: number = 50): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('days_since_joined', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (data || []).map((user, index) => ({
      rank: index + 1,
      name: user.username || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`,
      address: `${user.address.slice(0, 6)}...${user.address.slice(-4)}`,
      status: user.rank as UserRank,
      days: user.days_since_joined,
      isLegend: user.rank === UserRank.OG_LEGEND,
      pfp: user.pfp_url,
      fid: user.fid,
    }));
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return [];
  }
};

// Get total user count
export const getTotalUsers = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Supabase count error:', err);
    return 0;
  }
};

// Get user rank position
export const getUserRankPosition = async (address: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('address, days_since_joined')
      .order('days_since_joined', { ascending: false });

    if (error || !data) return null;

    const position = data.findIndex(
      (user) => user.address.toLowerCase() === address.toLowerCase()
    );

    return position >= 0 ? position + 1 : null;
  } catch (err) {
    console.error('Supabase rank error:', err);
    return null;
  }
};
