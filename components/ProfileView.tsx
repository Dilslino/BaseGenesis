'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Award, Layers, Activity, ExternalLink, Share2, X, Heart } from 'lucide-react';
import { UserGenesisData } from '../types';
import { RANK_COLORS, RANK_EMOJI, RANK_BADGE_COLORS, RANK_DESCRIPTIONS } from '../constants';
import { Achievements } from './Achievements';
import { Button } from './Button';

interface ProfileViewProps {
  userData: UserGenesisData;
  onShareFarcaster: (text: string, url: string) => void;
  onViewBasescan: () => void;
  onDonate?: () => void;
}

// Animated number counter
const AnimatedNumber: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      key={displayValue}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="tabular-nums"
    >
      {displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  animate?: boolean;
  delay?: number;
}> = ({ icon, label, value, animate = true, delay = 0 }) => (
  <motion.div 
    className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-2 text-gray-400 mb-1">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold font-mono text-white group-hover:text-base-blue transition-colors stat-value">
      {animate && typeof value === 'number' ? (
        <AnimatedNumber value={value} />
      ) : (
        value
      )}
    </p>
  </motion.div>
);

export const ProfileView: React.FC<ProfileViewProps> = ({ userData, onShareFarcaster, onViewBasescan, onDonate }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const gradientColor = RANK_COLORS[userData.rank];
  const shortAddress = `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}`;
  
  const unlockedBadges = userData.achievements?.filter(a => a.unlocked).length || 0;
  const totalBadges = userData.achievements?.length || 0;

  const appUrl = 'https://basegenesis.vercel.app';
  const shareUrl = `${appUrl}/share/${userData.address}`;
  
  const shareText = `${RANK_EMOJI[userData.rank]} I'm a ${userData.rank} on Base!\n\n${userData.daysSinceJoined} days since my first transaction.\n\nCheck your genesis rank:`;

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setShowShareModal(false);
  };

  const handleShareFarcaster = () => {
    onShareFarcaster(shareText, shareUrl);
    setShowShareModal(false);
  };

  return (
    <motion.div 
      className="flex flex-col h-full space-y-4 overflow-y-auto pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Header */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-10 rounded-2xl blur-xl`} />
        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] transition-all duration-300">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <motion.div 
              className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl shadow-lg`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              {RANK_EMOJI[userData.rank]}
            </motion.div>
            
            {/* Info */}
            <div className="flex-grow">
              <motion.div 
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold mb-1 ${RANK_BADGE_COLORS[userData.rank]}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {RANK_EMOJI[userData.rank]} {userData.rank}
              </motion.div>
              <motion.p 
                className="text-white font-mono text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {shortAddress}
              </motion.p>
              <motion.p 
                className="text-gray-500 text-xs mt-1 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                "{RANK_DESCRIPTIONS[userData.rank]}"
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={<Calendar className="w-4 h-4" />}
          label="Days on Base"
          value={userData.daysSinceJoined}
          delay={0.2}
        />
        <StatCard 
          icon={<Award className="w-4 h-4" />}
          label="Badges"
          value={`${unlockedBadges}/${totalBadges}`}
          animate={false}
          delay={0.3}
        />
        <StatCard 
          icon={<Layers className="w-4 h-4" />}
          label="First Block"
          value={`#${parseInt(userData.blockNumber).toLocaleString()}`}
          animate={false}
          delay={0.4}
        />
        <StatCard 
          icon={<Activity className="w-4 h-4" />}
          label="Total TXs"
          value={userData.txCount || 0}
          delay={0.5}
        />
      </div>

      {/* Achievements */}
      {userData.achievements && (
        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Achievements achievements={userData.achievements} />
        </motion.div>
      )}

      {/* Actions */}
      <motion.div 
        className="grid grid-cols-2 gap-2 mt-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button 
          variant="secondary" 
          onClick={() => setShowShareModal(true)}
          className="!text-xs !py-2.5" 
          icon={<Share2 className="w-4 h-4" />}
        >
          Share & Flex
        </Button>
        <Button 
          variant="secondary" 
          onClick={onViewBasescan}
          className="!text-xs !py-2.5" 
          icon={<ExternalLink className="w-4 h-4" />}
        >
          View on Chain
        </Button>
      </motion.div>

      {/* Support Creator */}
      {onDonate && (
        <motion.button 
          onClick={onDonate}
          className="group flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-white transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Heart className="w-3.5 h-3.5 group-hover:text-pink-400 group-hover:fill-pink-400 transition-colors" />
          <span className="text-xs">Buy me a coffee</span>
        </motion.button>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Share & Flex</h3>
                <motion.button
                  onClick={() => setShowShareModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
              
              {/* Modal Content */}
              <div className="p-4 space-y-3">
                <p className="text-gray-400 text-sm text-center mb-4">
                  Flex your {userData.rank} status to the world!
                </p>
                
                {/* Twitter/X Button */}
                <motion.button
                  onClick={handleShareTwitter}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-gray-800 to-gray-900
                    hover:from-gray-700 hover:to-gray-800
                    border border-white/10 hover:border-white/20
                    transition-all duration-300
                    flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Share on X (Twitter)
                </motion.button>
                
                {/* Farcaster Button */}
                <motion.button
                  onClick={handleShareFarcaster}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
                    bg-gradient-to-r from-purple-600 to-purple-800
                    hover:from-purple-500 hover:to-purple-700
                    border border-purple-500/30 hover:border-purple-500/50
                    transition-all duration-300
                    flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Share on Farcaster
                </motion.button>

                {/* Preview Link */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-gray-500 text-xs text-center">
                    Your card will be shown when people click the link
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
