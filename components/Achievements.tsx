import React from 'react';
import { Achievement } from '../types';
import { Lock } from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Achievements</span>
        <span className="text-xs text-base-blue">{unlockedCount}/{achievements.length}</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`
              relative aspect-square rounded-lg flex flex-col items-center justify-center p-1
              transition-all duration-300 group cursor-pointer
              ${achievement.unlocked 
                ? 'bg-white/5 border border-white/10 hover:border-white/20' 
                : 'bg-white/[0.02] border border-white/5 opacity-50'
              }
            `}
            title={`${achievement.title}: ${achievement.description}`}
          >
            <span className="text-xl">{achievement.unlocked ? achievement.icon : '🔒'}</span>
            <span className="text-[8px] text-gray-400 mt-0.5 text-center leading-tight truncate w-full px-0.5">
              {achievement.title}
            </span>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-base-black border border-white/20 rounded-lg p-2 text-center whitespace-nowrap shadow-xl">
                <p className="text-[10px] font-bold text-white">{achievement.title}</p>
                <p className="text-[8px] text-gray-400">{achievement.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
