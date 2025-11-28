import React, { useState } from 'react';
import { Achievement } from '../types';
import { X } from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
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
            onClick={() => setSelectedAchievement(achievement)}
            className={`
              relative aspect-square rounded-xl flex flex-col items-center justify-center p-1
              transition-all duration-300 cursor-pointer glass-card
              ${achievement.unlocked 
                ? 'hover:bg-white/15 hover:scale-105 hover:shadow-lg' 
                : 'opacity-50 hover:opacity-70'
              }
            `}
          >
            <span className="text-xl">{achievement.unlocked ? achievement.icon : '🔒'}</span>
            <span className="text-[8px] text-gray-400 mt-0.5 text-center leading-tight truncate w-full px-0.5">
              {achievement.title}
            </span>
          </div>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          <div 
            className="relative glass-card-strong rounded-2xl p-5 w-full max-w-xs animate-bounce-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className={`
                w-16 h-16 mx-auto rounded-2xl flex items-center justify-center
                ${selectedAchievement.unlocked 
                  ? 'bg-gradient-to-br from-base-blue/30 to-purple-500/30 shadow-lg shadow-base-blue/20' 
                  : 'bg-white/10'
                }
              `}>
                <span className="text-4xl">
                  {selectedAchievement.unlocked ? selectedAchievement.icon : '🔒'}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{selectedAchievement.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{selectedAchievement.description}</p>
              </div>

              <div className={`
                inline-block px-3 py-1.5 rounded-full text-xs font-medium
                ${selectedAchievement.unlocked 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }
              `}>
                {selectedAchievement.unlocked ? '✓ Unlocked' : '🔒 Locked'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
