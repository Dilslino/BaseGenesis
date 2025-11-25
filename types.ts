export enum UserRank {
  GENESIS_PIONEER = "GENESIS PIONEER",
  EARLY_SETTLER = "EARLY SETTLER",
  BASE_CITIZEN = "BASE CITIZEN",
  UNKNOWN = "UNKNOWN"
}

export interface Transaction {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  blockNumber: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface UserGenesisData {
  address: string;
  firstTxDate: string;
  firstTxHash: string;
  daysSinceJoined: number;
  rank: UserRank;
  blockNumber: string;
  txCount?: number;
  achievements?: Achievement[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  address: string;
  status: UserRank;
  days: number;
  isLegend: boolean;
  pfp?: string;
  fid?: number;
}

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl?: string;
  custodyAddress?: string;
  verifiedAddresses?: string[];
}

export interface ApiResponse {
  userData: UserGenesisData;
  leaderboard: LeaderboardEntry[];
}

export type AppState = 'IDLE' | 'LOADING' | 'RESULT' | 'ERROR' | 'LEADERBOARD';