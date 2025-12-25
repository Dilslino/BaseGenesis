'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../types';
import { X } from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Get glow color based on achievement
  const getGlowClass = (achievement: Achievement) => {
    if (!achievement.unlocked) return '';
    
    switch (achievement.id) {
      case 'pioneer':
      case 'og_block':
        return 'badge-glow-gold';
      case 'early_bird':
        return 'badge-glow-amber';
      case 'tx_100':
      case 'tx_1000':
        return 'badge-glow-cyan';
      default:
        return 'badge-glow-slate';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Achievements</span>
        <motion.span 
          className="text-xs text-base-blue font-mono"
          key={unlockedCount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          {unlockedCount}/{achievements.length}
        </motion.span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            onClick={() => setSelectedAchievement(achievement)}
            className={`
              relative aspect-square rounded-xl flex flex-col items-center justify-center p-1
              transition-all duration-300 cursor-pointer glass-card press-effect
              ${achievement.unlocked 
                ? `badge-unlocked ${getGlowClass(achievement)} hover:scale-105` 
                : 'opacity-40 hover:opacity-60'
              }
            `}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: achievement.unlocked ? 1.08 : 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glow effect for unlocked badges */}
            {achievement.unlocked && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            <motion.span 
              className="text-xl relative z-10"
              animate={achievement.unlocked ? { 
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {achievement.unlocked ? achievement.icon : '🔒'}
            </motion.span>
            <span className="text-[8px] text-gray-400 mt-0.5 text-center leading-tight truncate w-full px-0.5 relative z-10">
              {achievement.title}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAchievement(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <motion.div 
              className="relative glass-card-strong rounded-2xl p-5 w-full max-w-xs"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <motion.button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              <div className="text-center space-y-3">
                <motion.div 
                  className={`
                    w-20 h-20 mx-auto rounded-2xl flex items-center justify-center
                    ${selectedAchievement.unlocked 
                      ? 'bg-gradient-to-br from-base-blue/30 to-purple-500/30 shadow-lg shadow-base-blue/20' 
                      : 'bg-white/10'
                    }
                  `}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
                >
                  <motion.span 
                    className="text-5xl"
                    animate={selectedAchievement.unlocked ? {
                      scale: [1, 1.1, 1],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {selectedAchievement.unlocked ? selectedAchievement.icon : '🔒'}
                  </motion.span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-white">{selectedAchievement.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedAchievement.description}</p>
                </motion.div>

                <motion.div 
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
                    ${selectedAchievement.unlocked 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }
                  `}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {selectedAchievement.unlocked ? (
                    <>
                      <motion.svg 
                        className="w-4 h-4" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <motion.path
                          d="M5 12l5 5L20 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        />
                      </motion.svg>
                      Unlocked
                    </>
                  ) : (
                    '🔒 Locked'
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
