import React from 'react';
import { UserGenesisData, UserRank } from '../types';
import { RANK_COLORS } from '../constants';
import { Hash, Calendar, Layers, Crown, Trophy, Sparkles } from 'lucide-react';

interface FlexCardProps {
  data: UserGenesisData;
}

export const FlexCard: React.FC<FlexCardProps> = ({ data }) => {
  const dateObj = new Date(data.firstTxDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    year: '2-digit', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const shortHash = `${data.firstTxHash.slice(0, 4)}...${data.firstTxHash.slice(-4)}`;
  const gradientColor = RANK_COLORS[data.rank] || "from-gray-700 to-gray-800";
  const isOG = data.rank === UserRank.OG_LEGEND;
  const isPioneer = data.rank === UserRank.GENESIS_PIONEER;

  return (
    <div className={`relative w-full aspect-[1.58/1] max-w-[320px] mx-auto perspective-1000 group select-none ${isOG || isPioneer ? 'float-animation' : ''}`}>
      
      {/* Animated Glow Behind */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} rounded-2xl blur-lg transition duration-700 ${
        isOG ? 'opacity-70 group-hover:opacity-90' : 
        isPioneer ? 'opacity-50 group-hover:opacity-70' : 
        'opacity-40 group-hover:opacity-60'
      }`}></div>
      
      {/* OG Special Effects */}
      {isOG && (
        <>
          {/* Rotating ring */}
          <div className="absolute -inset-3 rounded-2xl border-2 border-dashed border-yellow-500/30 animate-[rotate-slow_20s_linear_infinite]"></div>
          {/* Outer glow pulse */}
          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-2xl opacity-40 animate-pulse"></div>
          {/* Top shine line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full animate-pulse"></div>
          {/* Sparkle particles */}
          <div className="absolute -top-2 -left-2 sparkle-particle">
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="absolute -top-1 -right-3 sparkle-particle" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-3 h-3 text-orange-400" />
          </div>
          <div className="absolute -bottom-2 -right-1 sparkle-particle" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
        </>
      )}

      {/* Pioneer Special Effects */}
      {isPioneer && (
        <>
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -top-1 -right-1 sparkle-particle">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
        </>
      )}
      
      {/* Card Container */}
      <div className={`relative h-full w-full backdrop-blur-2xl border rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 ${
        isOG ? 'bg-gradient-to-br from-[#0a0805]/90 via-[#050508]/85 to-[#080502]/90 border-yellow-500/40 card-og' : 
        isPioneer ? 'bg-gradient-to-br from-[#080505]/90 via-[#050508]/85 to-[#050502]/90 border-amber-500/30 card-pioneer' :
        'glass-card-strong'
      }`}>
        
        {/* Background Noise/Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradientColor} blur-[60px] ${isOG ? 'opacity-60' : isPioneer ? 'opacity-40' : 'opacity-30'} rounded-full`}></div>
        
        {/* OG Crown decoration */}
        {isOG && (
          <div className="absolute top-2 right-2 crown-icon">
            <Crown className="w-7 h-7 text-yellow-400" />
          </div>
        )}

        {/* Pioneer Trophy decoration */}
        {isPioneer && (
          <div className="absolute top-2 right-2 float-animation">
            <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          </div>
        )}

        {/* Top Row: Brand & Chip */}
        <div className="flex justify-between items-start z-10">
           <div className="flex flex-col">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">BaseGenesis</span>
              <span className="text-xs font-bold text-white tracking-widest">ID SYSTEM</span>
           </div>
           {/* Decorative Chip */}
           <div className="w-8 h-6 sm:w-10 sm:h-7 rounded bg-gradient-to-br from-yellow-200/20 to-yellow-500/20 border border-white/10 flex items-center justify-center">
              <div className="w-5 h-3 sm:w-6 sm:h-4 border border-white/10 rounded-[2px] flex gap-[2px]">
                 <div className="w-[1px] h-full bg-white/20"></div>
                 <div className="w-[1px] h-full bg-white/20"></div>
                 <div className="w-[1px] h-full bg-white/20"></div>
              </div>
           </div>
        </div>

        {/* Middle: Rank */}
        <div className="z-10 relative my-1 sm:my-2">
            <h2 className={`text-2xl min-[340px]:text-3xl font-black italic tracking-tighter drop-shadow-lg truncate ${
              isOG ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 og-title' : 
              isPioneer ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-500' :
              'text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400'
            }`}>
              {isOG && <span className="mr-1">👑</span>}
              {isPioneer && <span className="mr-1">🏆</span>}
              {data.rank.split(' ')[0]} <span className="text-lg sm:text-2xl">{data.rank.split(' ')[1]}</span>
            </h2>
            <div className={`h-0.5 bg-gradient-to-r mt-1 ${
              isOG ? 'from-yellow-400 via-orange-500 to-transparent w-20' : 
              isPioneer ? 'from-amber-400 via-orange-400 to-transparent w-16' :
              'from-base-blue to-transparent w-12'
            }`}></div>
        </div>

        {/* Bottom: Stats Grid */}
        <div className="grid grid-cols-2 gap-2 z-10">
            {/* Join Date */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-400 font-mono uppercase">
                    <Calendar className="w-3 h-3" /> Joined
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-white font-bold">{formattedDate}</div>
            </div>
            
            {/* Block */}
            <div className="flex flex-col items-end text-right">
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-400 font-mono uppercase">
                    Block <Layers className="w-3 h-3" />
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-white">#{data.blockNumber}</div>
            </div>

            {/* Hash - Full Width */}
            <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center mt-1">
                 <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-500 font-mono">
                    <Hash className="w-3 h-3" /> GENESIS TX
                 </div>
                 <div className="text-[9px] sm:text-[10px] font-mono text-base-blue bg-base-blue/10 px-2 py-0.5 rounded border border-base-blue/20">
                    {shortHash}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};