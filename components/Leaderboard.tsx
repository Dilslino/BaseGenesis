import React, { useMemo } from 'react';
import { Trophy, Crown, Star, Medal, Award, Gem, Flame, Zap, Shield } from 'lucide-react';
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
      icon: <Crown className="w-5 h-5 text-yellow-300" />,
      bg: 'bg-gradient-to-br from-yellow-500/30 via-amber-500/20 to-orange-500/30',
      border: 'border-yellow-500/50',
      glow: 'shadow-[0_0_15px_rgba(234,179,8,0.4)]',
      label: '👑',
      title: 'Champion'
    };
  }
  // Top 2 - Platinum
  if (position === 2) {
    return {
      icon: <Gem className="w-4 h-4 text-slate-200" />,
      bg: 'bg-gradient-to-br from-slate-400/20 via-gray-300/20 to-slate-500/20',
      border: 'border-slate-400/50',
      glow: 'shadow-[0_0_10px_rgba(148,163,184,0.3)]',
      label: '💎',
      title: 'Platinum'
    };
  }
  // Top 3 - Gold
  if (position === 3) {
    return {
      icon: <Medal className="w-4 h-4 text-amber-500" />,
      bg: 'bg-gradient-to-br from-amber-600/20 via-orange-500/20 to-amber-700/20',
      border: 'border-amber-600/50',
      glow: 'shadow-[0_0_8px_rgba(217,119,6,0.3)]',
      label: '🥉',
      title: 'Gold'
    };
  }
  // Top 4-5 - Silver Elite
  if (position <= 5) {
    return {
      icon: <Award className="w-4 h-4 text-gray-400" />,
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
      glow: '',
      label: '🥈',
      title: 'Silver'
    };
  }
  // Top 6-10 - Bronze
  if (position <= 10) {
    return {
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      glow: '',
      label: '🔥',
      title: 'Bronze'
    };
  }
  // Top 11-25 - Rising Star
  if (position <= 25) {
    return {
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      glow: '',
      label: '⚡',
      title: 'Rising'
    };
  }
  // Top 26-50 - Verified
  if (position <= 50) {
    return {
      icon: <Shield className="w-3.5 h-3.5 text-blue-400" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      glow: '',
      label: '🛡️',
      title: 'Verified'
    };
  }
  // Rest - Standard
  return {
    icon: <span className="text-xs font-bold text-gray-500">#{position}</span>,
    bg: 'bg-white/5',
    border: 'border-white/5',
    glow: '',
    label: '',
    title: ''
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
    
    return [...entries].sort((a, b) => {
      // First by days
      if (b.days !== a.days) return b.days - a.days;
      // Then by rank weight
      return rankWeight[b.status] - rankWeight[a.status];
    });
  }, [entries]);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold">Leaderboard</h2>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-[10px] text-gray-500">
        <span>Sorted by: Days on Base + Rank</span>
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
                relative p-3 rounded-xl border transition-all duration-300
                ${badge.bg} ${badge.border} ${badge.glow}
                ${isCurrentUser ? 'ring-2 ring-base-blue' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Rank Position Badge */}
                <div className={`
                  w-10 h-10 rounded-xl flex flex-col items-center justify-center
                  ${position <= 3 ? 'bg-black/20' : 'bg-white/5'}
                `}>
                  {badge.icon}
                  {position <= 10 && badge.title && (
                    <span className="text-[7px] text-gray-400 mt-0.5">{badge.title}</span>
                  )}
                </div>

                {/* Profile */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5">
                    {position <= 5 && <span className="text-sm">{badge.label}</span>}
                    <span className="font-semibold text-sm truncate">
                      {entry.name}
                      {isCurrentUser && <span className="text-base-blue ml-1">(You)</span>}
                    </span>
                    {entry.isLegend && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 font-mono">{entry.address}</span>
                    {position <= 3 && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded text-gray-400">
                        TOP {position}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rank Card Badge */}
                <div className="flex flex-col items-end gap-1">
                  {/* Mini Genesis Card */}
                  <div className={`
                    relative w-10 h-14 rounded-md overflow-hidden
                    bg-gradient-to-br ${RANK_COLORS[entry.status]}
                    border border-white/20 shadow-lg
                  `}>
                    {/* Card inner content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                      <span className="text-lg">{RANK_EMOJI[entry.status]}</span>
                      <span className="text-[6px] font-bold text-white/90 mt-0.5 text-center leading-tight px-0.5">
                        {entry.status.split(' ')[0]}
                      </span>
                    </div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{entry.days}d</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User's Rank (if not in top 10) */}
      {userRank && userRank > 10 && (
        <div className="mt-3 p-3 bg-base-blue/10 border border-base-blue/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Your Global Rank</span>
            <span className="font-bold text-base-blue text-lg">#{userRank.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
