import React, { useMemo } from 'react';
import { Trophy, Crown, Star, Medal, Award, Gem, TrendingUp } from 'lucide-react';
import { LeaderboardEntry, UserRank } from '../types';
import { RANK_BADGE_COLORS, RANK_EMOJI, RANK_COLORS } from '../constants';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userRank?: number;
  userAddress?: string;
}

// Badge configurations for different rank tiers
const getBadgeConfig = (position: number) => {
  // Top 1 - Diamond Champion
  if (position === 1) {
    return {
      bg: 'bg-gradient-to-br from-yellow-500/20 via-amber-600/20 to-yellow-500/20',
      border: 'border-yellow-400/40',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
      label: '👑',
      textColor: 'text-yellow-300'
    };
  }
  // Top 2 - Platinum
  if (position === 2) {
    return {
      bg: 'bg-gradient-to-br from-slate-400/15 via-gray-300/15 to-slate-400/15',
      border: 'border-slate-300/40',
      glow: 'shadow-[0_0_15px_rgba(148,163,184,0.4)]',
      label: '💎',
      textColor: 'text-slate-200'
    };
  }
  // Top 3 - Gold
  if (position === 3) {
    return {
      bg: 'bg-gradient-to-br from-orange-500/15 via-amber-600/15 to-orange-500/15',
      border: 'border-orange-400/40',
      glow: 'shadow-[0_0_12px_rgba(217,119,6,0.4)]',
      label: '🥇',
      textColor: 'text-orange-300'
    };
  }
  // Top 4-10 - Elite
  if (position <= 10) {
    return {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: '',
      label: '⭐',
      textColor: 'text-blue-300'
    };
  }
  // Rest - Standard
  return {
    bg: 'bg-white/5',
    border: 'border-white/10',
    glow: '',
    label: '',
    textColor: 'text-gray-400'
  };
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, userRank, userAddress }) => {
  // Sort by days (descending) and then by rank weight
  const sortedEntries = useMemo(() => {
    const rankWeight = {
      [UserRank.OG_LEGEND]: 4,
      [UserRank.GENESIS_PIONEER]: 3,
      [UserRank.EARLY_SETTLER]: 2,
      [UserRank.BASE_CITIZEN]: 1,
      [UserRank.UNKNOWN]: 0,
    };
    
    return [...entries]
      .sort((a, b) => {
      // First by days
      if (b.days !== a.days) return b.days - a.days;
      // Then by rank weight
      return rankWeight[b.status] - rankWeight[a.status];
    })
      .slice(0, 100); // Limit to top 100
  }, [entries]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold">Top 100 Leaderboard</h2>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs text-gray-400">{sortedEntries.length}</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 -mr-1">
        {sortedEntries.map((entry, idx) => {
          const position = idx + 1;
          const badge = getBadgeConfig(position);
          const isCurrentUser = userAddress && entry.address.toLowerCase().includes(userAddress.slice(-4).toLowerCase());
          
          return (
            <div 
              key={`${entry.address}-${idx}`}
              className={`
                relative p-3.5 rounded-xl transition-all duration-200
                ${badge.bg} hover:bg-white/10
                border ${badge.border}
                ${badge.glow}
                ${isCurrentUser ? 'ring-2 ring-base-blue shadow-[0_0_20px_rgba(0,82,255,0.3)]' : ''}
              `}
            >
              <div className="flex items-center gap-3.5">
                {/* Rank Number with Badge */}
                <div className="flex items-center gap-2">
                  {/* Position Number */}
                  <div className={`
                    min-w-[44px] h-11 rounded-lg flex items-center justify-center
                    ${position <= 3 ? 'bg-black/30' : 'bg-black/20'}
                    border ${position <= 3 ? 'border-white/20' : 'border-white/10'}
                  `}>
                    <div className="flex flex-col items-center">
                      <span className={`text-xs font-black ${badge.textColor}`}>
                        #{position}
                      </span>
                      {badge.label && (
                        <span className="text-sm leading-none mt-0.5">{badge.label}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">
                      {entry.name}
                      {isCurrentUser && <span className="text-base-blue ml-1">(You)</span>}
                    </span>
                    {entry.isLegend && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 font-mono">{entry.address}</span>
                  </div>
                </div>

                {/* Rank Card Badge */}
                <div className="flex flex-col items-end gap-1">
                  {/* Mini Genesis Card */}
                  <div className={`
                    relative w-11 h-[52px] rounded-lg overflow-hidden
                    bg-gradient-to-br ${RANK_COLORS[entry.status]}
                    border border-white/20 shadow-lg
                  `}>
                    {/* Card inner content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                      <span className="text-xl">{RANK_EMOJI[entry.status]}</span>
                      <span className="text-[7px] font-bold text-white/90 mt-1 text-center leading-tight px-0.5">
                        {entry.status.split(' ')[0]}
                      </span>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">{entry.days}</span>
                    <span className="text-[9px] text-gray-500">days</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User's Rank (if not in top 100) */}
      {userRank && userRank > 100 && (
        <div className="mt-3 p-4 bg-gradient-to-br from-base-blue/10 to-purple-500/10 rounded-xl border border-base-blue/30 shadow-[0_0_20px_rgba(0,82,255,0.25)]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Your Global Rank</span>
              <span className="text-[10px] text-gray-500 mt-0.5">Keep climbing!</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-base-blue" />
              <span className="font-black text-base-blue text-2xl drop-shadow-[0_0_10px_rgba(0,82,255,0.6)]">
                #{userRank.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
