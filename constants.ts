import { UserRank, LeaderboardEntry, Achievement } from './types';

export const BASE_LAUNCH_DATE = new Date('2023-08-09T00:00:00Z');

export const RANK_THRESHOLDS = {
  OG_DAYS: 7,        // First week = OG Legend
  PIONEER_DAYS: 30,  // First month = Genesis Pioneer  
  SETTLER_DAYS: 180, // First 6 months = Early Settler
};

export const MINT_PRICE_ETH = "0.0003";

export const RANK_COLORS: Record<UserRank, string> = {
  [UserRank.OG_LEGEND]: "from-yellow-300 via-amber-500 to-orange-600",
  [UserRank.GENESIS_PIONEER]: "from-amber-300 via-orange-500 to-yellow-500",
  [UserRank.EARLY_SETTLER]: "from-blue-400 via-cyan-500 to-teal-400",
  [UserRank.BASE_CITIZEN]: "from-slate-400 via-gray-400 to-slate-500",
  [UserRank.UNKNOWN]: "from-gray-700 to-gray-800"
};

export const RANK_BADGE_COLORS: Record<UserRank, string> = {
  [UserRank.OG_LEGEND]: "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 border-yellow-500/50",
  [UserRank.GENESIS_PIONEER]: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  [UserRank.EARLY_SETTLER]: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  [UserRank.BASE_CITIZEN]: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  [UserRank.UNKNOWN]: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

export const RANK_DESCRIPTIONS: Record<UserRank, string> = {
  [UserRank.OG_LEGEND]: "The rarest of them all. You were here before anyone else.",
  [UserRank.GENESIS_PIONEER]: "You were here at the dawn. A true believer.",
  [UserRank.EARLY_SETTLER]: "You helped build the foundation.",
  [UserRank.BASE_CITIZEN]: "A vital part of the growing ecosystem.",
  [UserRank.UNKNOWN]: "Data unavailable."
};

export const RANK_EMOJI: Record<UserRank, string> = {
  [UserRank.OG_LEGEND]: "👑",
  [UserRank.GENESIS_PIONEER]: "🏆",
  [UserRank.EARLY_SETTLER]: "⚡",
  [UserRank.BASE_CITIZEN]: "🌐",
  [UserRank.UNKNOWN]: "❓"
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_tx', title: 'First Step', description: 'Made your first transaction on Base', icon: '👣', unlocked: false },
  { id: 'pioneer', title: 'Genesis Pioneer', description: 'Joined Base in the first month', icon: '🏆', unlocked: false },
  { id: 'early_bird', title: 'Early Bird', description: 'Joined Base in the first 6 months', icon: '🐦', unlocked: false },
  { id: 'tx_10', title: 'Getting Started', description: 'Made 10+ transactions', icon: '🚀', unlocked: false },
  { id: 'tx_100', title: 'Power User', description: 'Made 100+ transactions', icon: '💪', unlocked: false },
  { id: 'tx_1000', title: 'Whale Alert', description: 'Made 1000+ transactions', icon: '🐋', unlocked: false },
  { id: 'year_1', title: 'Anniversary', description: 'Been on Base for 1+ year', icon: '🎂', unlocked: false },
  { id: 'og_block', title: 'Block Legend', description: 'First tx before block 1,000,000', icon: '🧱', unlocked: false },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "jessepollak", address: "0x8C...9d2", status: UserRank.OG_LEGEND, days: 600, isLegend: true, fid: 99 },
  { rank: 2, name: "dwr.eth", address: "0x5b...A10", status: UserRank.OG_LEGEND, days: 598, isLegend: true, fid: 3 },
  { rank: 3, name: "vitalik.eth", address: "0xd8...045", status: UserRank.OG_LEGEND, days: 595, isLegend: true, fid: 5650 },
  { rank: 4, name: "base", address: "0x12...999", status: UserRank.GENESIS_PIONEER, days: 580, isLegend: true, fid: 12142 },
  { rank: 5, name: "coinbase", address: "0x77...777", status: UserRank.GENESIS_PIONEER, days: 575, isLegend: true, fid: 1234 },
  { rank: 6, name: "anon.base", address: "0x99...123", status: UserRank.GENESIS_PIONEER, days: 540, isLegend: false },
  { rank: 7, name: "builder.eth", address: "0xAB...456", status: UserRank.EARLY_SETTLER, days: 480, isLegend: false },
  { rank: 8, name: "degen.base", address: "0xCD...789", status: UserRank.EARLY_SETTLER, days: 420, isLegend: false },
  { rank: 9, name: "nft_whale", address: "0xEF...012", status: UserRank.BASE_CITIZEN, days: 350, isLegend: false },
  { rank: 10, name: "onchain.og", address: "0x11...345", status: UserRank.BASE_CITIZEN, days: 300, isLegend: false },
];

export const SHARE_MESSAGES: Record<UserRank, string> = {
  [UserRank.OG_LEGEND]: "👑 I'm an OG LEGEND on Base! The rarest rank. Week 1 builder. Check your status:",
  [UserRank.GENESIS_PIONEER]: "🏆 I'm a GENESIS PIONEER on Base! Day 1 believer. Check your status:",
  [UserRank.EARLY_SETTLER]: "⚡ I'm an EARLY SETTLER on Base! Building since the early days:",
  [UserRank.BASE_CITIZEN]: "🌐 I'm a BASE CITIZEN! Part of the growing ecosystem:",
  [UserRank.UNKNOWN]: "Check your Base Genesis status:"
};