'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, User, Scan } from 'lucide-react';

export type TabType = 'home' | 'scan' | 'leaderboard' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasScanned: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, hasScanned }) => {
  const tabs = [
    { id: 'home' as TabType, icon: Home, label: 'Home' },
    { id: 'scan' as TabType, icon: Scan, label: 'Scan' },
    { id: 'leaderboard' as TabType, icon: Trophy, label: 'Ranks' },
    { id: 'profile' as TabType, icon: User, label: 'Profile', disabled: !hasScanned },
  ];

  return (
    <nav className="relative z-20 glass-nav px-2 py-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, icon: Icon, label, disabled }) => (
          <motion.button
            key={id}
            onClick={() => !disabled && onTabChange(id)}
            disabled={disabled}
            className={`
              relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-colors duration-200
              ${disabled 
                ? 'text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 hover:text-white'
              }
            `}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
          >
            {/* Active Background */}
            {activeTab === id && (
              <motion.div
                className="absolute inset-0 bg-base-blue/20 rounded-2xl"
                layoutId="activeTab"
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
            )}
            
            {/* Active Glow */}
            {activeTab === id && (
              <motion.div
                className="absolute inset-0 rounded-2xl shadow-[0_0_15px_rgba(0,82,255,0.3)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}

            {/* Icon */}
            <motion.div
              animate={{
                color: activeTab === id ? '#0052FF' : disabled ? '#4B5563' : '#9CA3AF',
                scale: activeTab === id ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Icon 
                className={`w-5 h-5 mb-0.5 ${
                  activeTab === id ? 'drop-shadow-[0_0_6px_rgba(0,82,255,0.5)]' : ''
                }`} 
              />
            </motion.div>

            {/* Label */}
            <motion.span 
              className={`text-[10px] font-medium relative z-10 ${
                activeTab === id ? 'text-base-blue' : ''
              }`}
              animate={{
                fontWeight: activeTab === id ? 600 : 500,
              }}
            >
              {label}
            </motion.span>

            {/* Notification dot for profile if scanned */}
            {id === 'profile' && hasScanned && activeTab !== 'profile' && (
              <motion.span
                className="absolute top-1 right-3 w-2 h-2 bg-green-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  );
};
