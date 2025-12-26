'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UserGenesisData, UserRank } from '../types';
import { RANK_COLORS } from '../constants';
import { Hash, Calendar, Layers, Crown, Trophy, Zap, Globe, Sparkles } from 'lucide-react';

interface FlexCardProps {
  data: UserGenesisData;
  compact?: boolean;
}

export const FlexCard: React.FC<FlexCardProps> = ({ data, compact = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
  const isSettler = data.rank === UserRank.EARLY_SETTLER;
  const isCitizen = data.rank === UserRank.BASE_CITIZEN;

  // 3D Tilt effect handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Normalize to -1 to 1
    const rotateXValue = (mouseY / (rect.height / 2)) * -8;
    const rotateYValue = (mouseX / (rect.width / 2)) * 8;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div 
      ref={cardRef}
      className={`relative w-full aspect-[1.58/1] ${compact ? 'max-w-[280px]' : 'max-w-[320px]'} mx-auto perspective-1000 group select-none`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      
      {/* Animated Glow Behind */}
      <motion.div 
        className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} rounded-2xl blur-lg`}
        animate={{
          opacity: isHovered 
            ? (isOG ? 0.9 : isPioneer ? 0.7 : 0.6) 
            : (isOG ? 0.7 : isPioneer ? 0.5 : 0.4)
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* OG Special Effects */}
      {isOG && (
        <>
          {/* Rotating ring */}
          <div className="absolute -inset-3 rounded-2xl border-2 border-dashed border-yellow-500/30 animate-[rotate-slow_20s_linear_infinite]"></div>
          {/* Outer glow pulse */}
          <motion.div 
            className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Top shine line */}
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Sparkle particles */}
          <motion.div 
            className="absolute -top-2 -left-2"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
          <motion.div 
            className="absolute -top-1 -right-3"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
          </motion.div>
          <motion.div 
            className="absolute -bottom-2 -right-1"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
        </>
      )}

      {/* Pioneer Special Effects */}
      {isPioneer && (
        <>
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 rounded-2xl blur-xl"
            animate={{ opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -top-1 -right-1"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </motion.div>
        </>
      )}

      {/* Settler Special Effects */}
      {isSettler && (
        <>
          <motion.div 
            className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 rounded-2xl blur-md"
            animate={{ opacity: isHovered ? 0.4 : 0.25 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-60"></div>
        </>
      )}

      {/* Citizen Special Effects */}
      {isCitizen && (
        <>
          <motion.div 
            className="absolute -inset-0.5 bg-gradient-to-r from-slate-500 via-gray-400 to-slate-500 rounded-2xl blur-md"
            animate={{ opacity: isHovered ? 0.35 : 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </>
      )}
      
      {/* Card Container */}
      <div className={`relative h-full w-full backdrop-blur-2xl border rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 sm:p-5 transition-all duration-500 ${
        isOG ? 'bg-gradient-to-br from-[#0a0805]/90 via-[#050508]/85 to-[#080502]/90 border-yellow-500/40 card-og' : 
        isPioneer ? 'bg-gradient-to-br from-[#080505]/90 via-[#050508]/85 to-[#050502]/90 border-amber-500/30 card-pioneer' :
        isSettler ? 'bg-gradient-to-br from-[#051015]/90 via-[#050510]/85 to-[#051010]/90 border-cyan-500/30 card-settler' :
        'bg-gradient-to-br from-[#0a0a10]/90 via-[#080812]/85 to-[#0a0a0f]/90 border-slate-500/25 card-citizen'
      }`}>
        
        {/* Background Noise/Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <motion.div 
          className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradientColor} blur-[60px] rounded-full`}
          animate={{ opacity: isOG ? 0.6 : isPioneer ? 0.4 : 0.3 }}
        />
        
        {/* Rank decoration icons */}
        {isOG && (
          <motion.div 
            className="absolute top-2 right-2"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
          </motion.div>
        )}

        {isPioneer && (
          <motion.div 
            className="absolute top-2 right-2"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          </motion.div>
        )}

        {isSettler && (
          <motion.div 
            className="absolute top-2 right-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
          </motion.div>
        )}

        {isCitizen && (
          <motion.div 
            className="absolute top-2 right-2"
            animate={{ opacity: isHovered ? 1 : 0.7 }}
          >
            <Globe className="w-5 h-5 text-slate-400 drop-shadow-[0_0_3px_rgba(148,163,184,0.5)]" />
          </motion.div>
        )}

        {/* Top Row: Brand & Chip */}
        <div className="flex justify-between items-start z-10">
           <div className="flex flex-col">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">BaseGenesis</span>
              <span className="text-xs font-bold text-white tracking-widest">ID SYSTEM</span>
           </div>
           
           {/* User PFP or Decorative Chip */}
           {data.pfpUrl ? (
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/20 shadow-lg relative">
               <img 
                 src={data.pfpUrl} 
                 alt="User" 
                 className="w-full h-full object-cover" 
               />
               <div className={`absolute inset-0 rounded-full border ${
                 isOG ? 'border-yellow-500/50' : 
                 isPioneer ? 'border-amber-500/50' : 
                 isSettler ? 'border-cyan-500/50' : 
                 'border-white/10'
               }`}></div>
             </div>
           ) : (
             <div className="w-8 h-6 sm:w-10 sm:h-7 rounded bg-gradient-to-br from-yellow-200/20 to-yellow-500/20 border border-white/10 flex items-center justify-center">
                <div className="w-5 h-3 sm:w-6 sm:h-4 border border-white/10 rounded-[2px] flex gap-[2px]">
                   <div className="w-[1px] h-full bg-white/20"></div>
                   <div className="w-[1px] h-full bg-white/20"></div>
                   <div className="w-[1px] h-full bg-white/20"></div>
                </div>
             </div>
           )}
        </div>

        {/* Middle: Rank */}
        <div className="z-10 relative my-1 sm:my-2">
            <h2 className={`text-2xl min-[340px]:text-3xl font-black italic tracking-tighter drop-shadow-lg truncate ${
              isOG ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 og-title animate-gradient-shift' : 
              isPioneer ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-500' :
              isSettler ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-500' :
              'text-transparent bg-clip-text bg-gradient-to-r from-slate-300 via-gray-300 to-slate-400'
            }`}>
              {isOG && <span className="mr-1">👑</span>}
              {isPioneer && <span className="mr-1">🏆</span>}
              {isSettler && <span className="mr-1">⚡</span>}
              {isCitizen && <span className="mr-1">🌐</span>}
              {data.rank.split(' ')[0]} <span className="text-lg sm:text-2xl">{data.rank.split(' ')[1]}</span>
            </h2>
            <motion.div 
              className={`h-0.5 bg-gradient-to-r mt-1 ${
                isOG ? 'from-yellow-400 via-orange-500 to-transparent w-20' : 
                isPioneer ? 'from-amber-400 via-orange-400 to-transparent w-16' :
                isSettler ? 'from-cyan-400 via-teal-400 to-transparent w-14' :
                'from-slate-400 via-gray-500 to-transparent w-12'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ transformOrigin: 'left' }}
            />
        </div>

        {/* Bottom: Stats Grid */}
        <div className="grid grid-cols-2 gap-2 z-10">
            {/* Join Date */}
            <motion.div 
              className="flex flex-col"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-400 font-mono uppercase">
                    <Calendar className="w-3 h-3" /> Joined
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-white font-bold">{formattedDate}</div>
            </motion.div>
            
            {/* Block */}
            <motion.div 
              className="flex flex-col items-end text-right"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-400 font-mono uppercase">
                    Block <Layers className="w-3 h-3" />
                </div>
                <div className="text-[10px] sm:text-xs font-mono text-white">#{data.blockNumber}</div>
            </motion.div>

            {/* Hash - Full Width */}
            <motion.div 
              className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
                 <div className="flex items-center gap-1 text-[8px] sm:text-[9px] text-gray-500 font-mono">
                    <Hash className="w-3 h-3" /> GENESIS TX
                 </div>
                 <div className="text-[9px] sm:text-[10px] font-mono text-base-blue bg-base-blue/10 px-2 py-0.5 rounded border border-base-blue/20 hover:bg-base-blue/20 transition-colors cursor-pointer">
                    {shortHash}
                 </div>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
