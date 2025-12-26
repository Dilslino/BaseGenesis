
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Gem, Flame, Zap, Shield, Sparkles, Medal } from 'lucide-react';
import { LeaderboardEntry, UserRank } from '../types';
import { RANK_IMAGES, RANK_COLORS } from '../constants';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userRank?: number;
  userAddress?: string;
}

// Helper to get image key from full rank string
const getRankImageKey = (rank: UserRank): string => {
  if (rank === UserRank.OG_LEGEND) return 'OG';
  if (rank === UserRank.GENESIS_PIONEER) return 'Pioneer';
  if (rank === UserRank.EARLY_SETTLER) return 'Settler';
  return 'Citizen';
};

const LeaderboardItem: React.FC<{ 
  entry: LeaderboardEntry; 
  position: number; 
  isCurrentUser: boolean;
  delay: number;
}> = ({ entry, position, isCurrentUser, delay }) => {
  
  // Badge Configuration
  const getBadgeConfig = (pos: number) => {
    if (pos === 1) return { icon: <Crown className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" />, border: 'border-yellow-500/50', bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20', text: 'text-yellow-200' };
    if (pos === 2) return { icon: <Medal className="w-4 h-4 text-slate-300 drop-shadow-[0_0_5px_rgba(203,213,225,0.6)]" />, border: 'border-slate-400/50', bg: 'bg-gradient-to-r from-slate-400/20 to-gray-400/20', text: 'text-slate-200' };
    if (pos === 3) return { icon: <Medal className="w-4 h-4 text-amber-600 drop-shadow-[0_0_5px_rgba(217,119,6,0.6)]" />, border: 'border-amber-600/50', bg: 'bg-gradient-to-r from-amber-600/20 to-orange-700/20', text: 'text-amber-200' };
    if (pos <= 10) return { icon: <Flame className="w-4 h-4 text-orange-400" />, border: 'border-white/10', bg: 'bg-white/5', text: 'text-gray-300' };
    return { icon: <span className="text-xs font-mono font-bold text-gray-500">#{pos}</span>, border: 'border-white/5', bg: 'bg-white/5', text: 'text-gray-400' };
  };

  const badge = getBadgeConfig(position);
  const rankImgKey = getRankImageKey(entry.status);
  const rankImg = RANK_IMAGES[rankImgKey];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay, duration: 0.3 }}
      className={`
        relative flex items-center gap-3 p-3 rounded-2xl mb-2 transition-all duration-300 group
        border ${isCurrentUser ? 'border-base-blue/50 shadow-[0_0_15px_rgba(0,82,255,0.2)] bg-base-blue/10' : 'border-transparent hover:border-white/10 hover:bg-white/5'}
        ${position <= 3 ? badge.bg : ''}
      `}
    >
      {/* Rank Position */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner
        ${position <= 3 ? 'bg-black/20 backdrop-blur-sm' : 'bg-black/20'}
      `}>
        {badge.icon}
      </div>

      {/* User Info */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-base-blue' : 'text-gray-200'}`}>
            {entry.name}
          </span>
          {entry.isLegend && (
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
          )}
          {isCurrentUser && (
            <span className="text-[9px] bg-base-blue/20 text-base-blue px-1.5 py-0.5 rounded border border-base-blue/30">YOU</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-500 font-mono tracking-wide">{entry.address}</span>
          <div className="h-3 w-[1px] bg-white/10"></div>
          <span className="text-[10px] text-gray-400 font-mono">{entry.days}d</span>
          {entry.txCount && entry.txCount > 0 && (
             <>
               <div className="h-3 w-[1px] bg-white/10"></div>
               <span className="text-[10px] text-gray-400 font-mono">{entry.txCount} tx</span>
             </>
          )}
        </div>
      </div>

      {/* Rank Image Preview */}
      <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-300">
        <div className={`
          w-9 h-9 rounded-full overflow-hidden border-2 shadow-md
          ${RANK_COLORS[entry.status].includes('yellow') ? 'border-yellow-500/30' : 
            RANK_COLORS[entry.status].includes('amber') ? 'border-amber-500/30' :
            RANK_COLORS[entry.status].includes('cyan') ? 'border-cyan-500/30' :
            'border-slate-500/30'}
        `}>
          <img src={rankImg} alt={entry.status} className="w-full h-full object-cover scale-[1.6]" />
        </div>
        
        {/* Rank Label Badge */}
        <div className={`
          absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md
          ${RANK_COLORS[entry.status].includes('yellow') ? 'bg-yellow-900/80 text-yellow-200 border-yellow-500/30' : 
            RANK_COLORS[entry.status].includes('amber') ? 'bg-amber-900/80 text-amber-200 border-amber-500/30' :
            RANK_COLORS[entry.status].includes('cyan') ? 'bg-cyan-900/80 text-cyan-200 border-cyan-500/30' :
            'bg-slate-800/80 text-slate-300 border-slate-500/30'}
        `}>
          {rankImgKey}
        </div>
      </div>
    </motion.div>
  );
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, userRank, userAddress }) => {
  // Sort entries logic
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
          <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Global Elite
          </h2>
        </div>
        <div className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 font-mono">
          Top 100
        </div>
      </div>

      {/* List Container */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden pr-1 -mr-1 custom-scrollbar pb-20">
        <AnimatePresence mode="popLayout">
          {sortedEntries.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <Trophy className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">Leaderboard is empty</p>
              <p className="text-gray-600 text-xs mt-1">Be the first to join the history!</p>
            </motion.div>
          ) : (
            sortedEntries.map((entry, idx) => (
              <LeaderboardItem 
                key={`${entry.address}-${idx}`}
                entry={entry}
                position={idx + 1}
                isCurrentUser={!!(userAddress && entry.address.toLowerCase().includes(userAddress.slice(-4).toLowerCase()))}
                delay={idx * 0.05} // Stagger animation
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Sticky User Stats (if user rank > 100 or list is long) */}
      {userRank && userRank > 0 && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-8 z-20"
        >
          <div className="glass-card-strong p-3 rounded-2xl border border-base-blue/30 shadow-[0_0_20px_rgba(0,82,255,0.15)] flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-base-blue/5 group-hover:bg-base-blue/10 transition-colors"></div>
            
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-base-blue/20 border border-base-blue/30 flex items-center justify-center text-base-blue font-bold">
                 #{userRank}
               </div>
               <div className="flex flex-col">
                 <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Your Rank</span>
                 <span className="text-[10px] text-gray-500">Global Ranking</span>
               </div>
            </div>

            <div className="relative z-10">
               <span className="text-xs font-mono text-white bg-white/10 px-2 py-1 rounded">
                 View Full
               </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
