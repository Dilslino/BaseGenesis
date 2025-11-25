import React from 'react';
import { UserGenesisData, UserRank } from '../types';
import { RANK_COLORS } from '../constants';
import { Hash, Calendar, Layers } from 'lucide-react';

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

  return (
    <div className="relative w-full aspect-[1.58/1] max-w-[320px] mx-auto perspective-1000 group select-none">
      
      {/* Animated Glow Behind */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-700`}></div>
      
      {/* Card Container */}
      <div className="relative h-full w-full bg-[#050508]/90 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5">
        
        {/* Background Noise/Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradientColor} blur-[60px] opacity-30 rounded-full`}></div>

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
            <h2 className="text-2xl min-[340px]:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-lg truncate">
              {data.rank.split(' ')[0]} <span className="text-lg sm:text-2xl">{data.rank.split(' ')[1]}</span>
            </h2>
            <div className="h-0.5 w-12 bg-gradient-to-r from-base-blue to-transparent mt-1"></div>
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