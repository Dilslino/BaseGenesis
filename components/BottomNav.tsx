import React from 'react';
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
          <button
            key={id}
            onClick={() => !disabled && onTabChange(id)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-300
              ${activeTab === id 
                ? 'text-base-blue bg-base-blue/20 shadow-[0_0_15px_rgba(0,82,255,0.3)]' 
                : disabled 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${activeTab === id ? 'drop-shadow-[0_0_6px_rgba(0,82,255,0.5)]' : ''}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
