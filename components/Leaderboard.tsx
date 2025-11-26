import React, { useMemo } from 'react';
import { Trophy, Crown, Star, Medal, Award } from 'lucide-react';
import { LeaderboardEntry, UserRank } from '../types';
import { RANK_BADGE_COLORS, RANK_EMOJI } from '../constants';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userRank?: number;
  userAddress?: string;
}

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

  const getRankIcon = (idx: number) => {
    if (idx === 0) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (idx === 1) return <Medal className="w-4 h-4 text-gray-300" />;
    if (idx === 2) return <Award className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>;
  };

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
          const isCurrentUser = userAddress && entry.address.toLowerCase().includes(userAddress.slice(-4).toLowerCase());
          
          return (
            <div 
              key={`${entry.address}-${idx}`}
              className={`
                relative p-3 rounded-xl border transition-all duration-300
                ${idx < 3 
                  ? 'bg-gradient-to-r from-white/5 to-transparent border-white/10' 
                  : 'bg-white/[0.02] border-white/5'
                }
                ${isCurrentUser ? 'ring-2 ring-base-blue border-base-blue/50' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Rank Position */}
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center
                  ${idx === 0 ? 'bg-yellow-500/20' : ''}
                  ${idx === 1 ? 'bg-gray-400/20' : ''}
                  ${idx === 2 ? 'bg-amber-700/20' : ''}
                  ${idx > 2 ? 'bg-white/5' : ''}
                `}>
                  {getRankIcon(idx)}
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

                {/* Stats */}
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${RANK_BADGE_COLORS[entry.status]}`}>
                    {RANK_EMOJI[entry.status]} {entry.status.split(' ')[0]}
                  </span>
                  <span className="text-xs font-bold text-white">{entry.days}d</span>
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
