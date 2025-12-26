'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Search, ChevronRight, Award, Calendar, Activity, Sparkles, Heart } from 'lucide-react';
import { Button } from './Button';
import { UserGenesisData } from '../types';
import { RANK_EMOJI, RANK_IMAGES, RANK_BADGE_COLORS, RANK_COLORS } from '../constants';

interface HomeViewProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  isInFrame: boolean;
  username?: string;
  pfpUrl?: string;
  totalUsers: number;
  userData?: UserGenesisData | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onNavigateToScan: () => void;
  onNavigateToProfile: () => void;
  onPasteAddressScan: (address: string) => void;
  onDonate?: () => void;
}

// Mini Card Preview Component
const MiniCardPreview: React.FC<{ 
  userData: UserGenesisData; 
  onViewProfile: () => void;
}> = ({ userData, onViewProfile }) => {
  const gradientColor = RANK_COLORS[userData.rank] || "from-gray-700 to-gray-800";
  const unlockedBadges = userData.achievements?.filter(a => a.unlocked).length || 0;
  const totalBadges = userData.achievements?.length || 8;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} rounded-3xl blur-lg opacity-30`} />
      
      <div className="relative glass-card-strong rounded-3xl p-4 overflow-hidden">
        {/* Background Decoration */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradientColor} blur-[50px] opacity-40 rounded-full`} />
        
        {/* Header - Rank Badge */}
        <div className="flex items-center justify-between mb-3">
          <motion.div 
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${RANK_BADGE_COLORS[userData.rank]}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <span className="text-lg">{RANK_EMOJI[userData.rank]}</span>
            {userData.rank}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Calendar className="w-3 h-3" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{userData.daysSinceJoined}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Days</p>
          </motion.div>
          
          <motion.div 
            className="text-center border-x border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Activity className="w-3 h-3" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{(userData.txCount || 0).toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">TXs</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Award className="w-3 h-3" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{unlockedBadges}<span className="text-gray-600 text-sm">/{totalBadges}</span></p>
            <p className="text-[9px] text-gray-500 uppercase tracking-wider">Badges</p>
          </motion.div>
        </div>

        {/* View Profile Button */}
        <motion.button
          onClick={onViewProfile}
          className="w-full py-3 rounded-2xl font-semibold text-white text-sm
            glass-button flex items-center justify-center gap-2
            hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Full Profile
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export const HomeView: React.FC<HomeViewProps> = ({
  isConnected,
  isConnecting,
  walletAddress,
  isInFrame,
  username,
  pfpUrl,
  totalUsers,
  userData,
  onConnect,
  onDisconnect,
  onNavigateToScan,
  onNavigateToProfile,
  onPasteAddressScan,
  onDonate,
}) => {
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : '';

  const [pasteAddress, setPasteAddress] = useState('');
  const [pasteError, setPasteError] = useState('');
  
  const handlePasteScan = () => {
    setPasteError('');
    const trimmed = pasteAddress.trim();
    
    if (!trimmed) {
      setPasteError('Please enter an address');
      return;
    }
    
    if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
      setPasteError('Invalid address format');
      return;
    }
    
    onPasteAddressScan(trimmed);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex-grow flex flex-col justify-center space-y-5 px-2">
        
        {/* Hero - Only show if no userData */}
        <AnimatePresence mode="wait">
          {!userData && (
            <motion.div 
              key="hero"
              className="text-center space-y-3"
              variants={itemVariants}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Discover Your{' '}
                <span className="hero-title text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-purple-400 to-cyan-300 animate-gradient-x">
                  Base Genesis
                </span>
              </h1>
              
              <p className="text-gray-400 text-sm sm:text-base max-w-[300px] sm:max-w-[360px] mx-auto">
                Discover the moment your Base journey began
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Card Preview - Show if userData exists */}
        <AnimatePresence mode="wait">
          {userData && (
            <motion.div
              key="user-preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <MiniCardPreview 
                userData={userData} 
                onViewProfile={onNavigateToProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Connection Card */}
        <motion.div 
          className="glass-card-strong rounded-3xl p-4 sm:p-5 space-y-4"
          variants={itemVariants}
        >
          {isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pfpUrl ? (
                    <motion.img 
                      src={pfpUrl} 
                      alt="" 
                      className="w-10 h-10 rounded-full border-2 border-green-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ) : (
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-base-blue to-purple-600 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Wallet className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  <div>
                    {username && <p className="text-white font-semibold text-sm">@{username}</p>}
                    <p className="text-gray-400 font-mono text-xs">{shortAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    Connected
                  </span>
                </div>
              </div>
              
              {/* Show scan button only if no userData yet, or rescan option */}
              <motion.button
                onClick={onNavigateToScan}
                className="w-full py-3.5 sm:py-4 rounded-2xl font-semibold text-white text-sm sm:text-base
                  glass-button
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {userData ? 'Rescan Wallet' : 'Scan My Wallet'}
              </motion.button>

              {!isInFrame && (
                <button
                  onClick={onDisconnect}
                  className="w-full text-center text-gray-500 hover:text-red-400 text-xs flex items-center justify-center gap-1 transition"
                >
                  <LogOut className="w-3 h-3" />
                  Disconnect Wallet
                </button>
              )}
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                </motion.div>
                <p className="text-gray-400 text-sm">Connect wallet to save your profile</p>
              </div>
              
              <Button
                variant="primary"
                onClick={onConnect}
                disabled={isConnecting}
                className="w-full !py-3"
                icon={isConnecting ? undefined : <Wallet className="w-5 h-5" />}
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <motion.span 
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Connecting...
                  </span>
                ) : (
                  isInFrame ? 'Connect Farcaster Wallet' : 'Connect Wallet'
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-gray-500 text-xs">or scan any address</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Paste Address Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteAddress}
                    onChange={(e) => setPasteAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 glass-input rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none"
                  />
                  <motion.button
                    onClick={handlePasteScan}
                    className="px-4 py-2.5 glass-card rounded-xl text-gray-300 hover:bg-white/15 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="w-4 h-4" />
                  </motion.button>
                </div>
                {pasteError && (
                  <motion.p 
                    className="text-red-400 text-xs text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {pasteError}
                  </motion.p>
                )}
                <p className="text-gray-500 text-[10px] text-center">
                  Note: Paste scan won't save to leaderboard
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Rank Preview - Hide if user already has data */}
        <AnimatePresence>
          {!userData && (
            <motion.div 
              className="space-y-3"
              variants={itemVariants}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest text-center">Possible Genesis Ranks</p>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {[
                  { name: 'OG', desc: 'Legend', color: 'yellow', img: RANK_IMAGES['OG'] },
                  { name: 'Pioneer', desc: 'Day 1', color: 'amber', img: RANK_IMAGES['Pioneer'] },
                  { name: 'Settler', desc: 'Early', color: 'cyan', img: RANK_IMAGES['Settler'] },
                  { name: 'Citizen', desc: 'Builder', color: 'slate', img: RANK_IMAGES['Citizen'] },
                ].map((rank, i) => (
                  <motion.div 
                    key={rank.name}
                    className={`glass-card rounded-2xl p-2 sm:p-2.5 text-center border-${rank.color}-500/30 hover:border-${rank.color}-500/50 transition-all`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-full overflow-hidden border-2 border-white/10 shadow-lg relative group-hover:border-white/30 transition-colors">
                      <img 
                        src={rank.img} 
                        alt={rank.name} 
                        className="w-full h-full object-cover scale-[1.6]" 
                      />
                    </div>
                    <p className={`text-${rank.color}-400 text-[10px] sm:text-[11px] font-bold mt-1`}>{rank.name}</p>
                    <p className="text-gray-400 text-[8px] sm:text-[9px]">{rank.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buy Me A Coffee - Subtle link style like ProfileView */}
        <motion.button 
          onClick={onDonate}
          className="group flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-white transition-all duration-300"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Heart className="w-3.5 h-3.5 group-hover:text-pink-400 group-hover:fill-pink-400 transition-colors" />
          <span className="text-xs">Buy me a coffee</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
