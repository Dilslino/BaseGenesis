/**
 * Centralized Rank Calculation Utilities
 *
 * This module provides a single source of truth for all rank-related logic.
 * Use these utilities in both client-side and server-side code.
 */

import { UserRank } from '../types';

// Base blockchain launch date
export const BASE_LAUNCH_DATE = new Date('2023-08-09T00:00:00Z');

// Rank thresholds (days since Base launch)
export const RANK_THRESHOLDS = {
  OG_DAYS: 30,        // First month after launch = OG Legend
  PIONEER_DAYS: 180,  // First 6 months = Genesis Pioneer
  SETTLER_DAYS: 365,  // First year = Early Settler
  // After 1 year = Base Citizen
} as const;

/**
 * Calculate user rank based on their first transaction date
 *
 * @param firstTxDate - The date of user's first transaction on Base
 * @returns The user's rank
 */
export function calculateRank(firstTxDate: Date): UserRank {
  const isPreLaunch = firstTxDate < BASE_LAUNCH_DATE;

  // Pre-launch users are automatically OG LEGEND
  if (isPreLaunch) {
    return UserRank.OG_LEGEND;
  }

  // Calculate days since Base launch
  const diffFromLaunch = Math.abs(firstTxDate.getTime() - BASE_LAUNCH_DATE.getTime());
  const daysSinceLaunch = Math.ceil(diffFromLaunch / (1000 * 60 * 60 * 24));

  if (daysSinceLaunch <= RANK_THRESHOLDS.OG_DAYS) {
    return UserRank.OG_LEGEND;
  } else if (daysSinceLaunch <= RANK_THRESHOLDS.PIONEER_DAYS) {
    return UserRank.GENESIS_PIONEER;
  } else if (daysSinceLaunch <= RANK_THRESHOLDS.SETTLER_DAYS) {
    return UserRank.EARLY_SETTLER;
  }

  return UserRank.BASE_CITIZEN;
}

/**
 * Calculate days since user joined Base
 *
 * @param firstTxDate - The date of user's first transaction on Base
 * @returns Number of days since first transaction
 */
export function calculateDaysSinceJoined(firstTxDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - firstTxDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Parse Unix timestamp to Date
 *
 * @param timestamp - Unix timestamp in seconds (as string)
 * @returns Date object
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(parseInt(timestamp) * 1000);
}

/**
 * Rank configuration for UI (colors, gradients, emojis)
 * Duplicated from constants.ts for edge runtime compatibility
 */
export const RANK_CONFIG: Record<string, { gradient: string; glow: string; emoji: string }> = {
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
};

/**
 * Get rank configuration (for edge runtime where enum might not be available)
 */
export function getRankConfig(rank: string) {
  return RANK_CONFIG[rank] || RANK_CONFIG['BASE CITIZEN'];
}
