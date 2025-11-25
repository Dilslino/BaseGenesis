import React from 'react';
import { Trophy, Crown, Star, ChevronRight } from 'lucide-react';
import { LeaderboardEntry, UserRank } from '../types';
import { RANK_BADGE_COLORS, RANK_EMOJI } from '../constants';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userRank?: number;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, userRank, onClose }) => {
  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold">Hall of Fame</h2>
        </div>
        <button 
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-white transition"
        >
          Close
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 pr-1 -mr-1">
        {entries.map((entry, idx) => (
          <div 
            key={entry.rank}
            className={`
              relative p-3 rounded-xl border transition-all duration-300
              ${idx < 3 
                ? 'bg-gradient-to-r from-white/5 to-transparent border-white/10' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }
              ${userRank === entry.rank ? 'ring-1 ring-base-blue' : ''}
            `}
          >
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                ${idx === 1 ? 'bg-gray-400/20 text-gray-300' : ''}
                ${idx === 2 ? 'bg-amber-700/20 text-amber-600' : ''}
                ${idx > 2 ? 'bg-white/5 text-gray-500' : ''}
              `}>
                {idx === 0 ? <Crown className="w-4 h-4" /> : `#${entry.rank}`}
              </div>

              {/* Profile */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">{entry.name}</span>
                  {entry.isLegend && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500 font-mono">{entry.address}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${RANK_BADGE_COLORS[entry.status]}`}>
                  {RANK_EMOJI[entry.status]} {entry.status.split(' ')[0]}
                </span>
                <span className="text-[10px] text-gray-500 mt-1">{entry.days}d</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {userRank && userRank > 10 && (
        <div className="mt-3 p-3 bg-base-blue/10 border border-base-blue/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Your Rank</span>
            <span className="font-bold text-base-blue">#{userRank.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
