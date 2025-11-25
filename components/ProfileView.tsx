import React from 'react';
import { Calendar, Award, Layers, Activity, ExternalLink, Share2 } from 'lucide-react';
import { UserGenesisData } from '../types';
import { RANK_COLORS, RANK_EMOJI, RANK_BADGE_COLORS, RANK_DESCRIPTIONS } from '../constants';
import { Achievements } from './Achievements';
import { Button } from './Button';

interface ProfileViewProps {
  userData: UserGenesisData;
  onShare: () => void;
  onViewBasescan: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userData, onShare, onViewBasescan }) => {
  const gradientColor = RANK_COLORS[userData.rank];
  const shortAddress = `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}`;
  
  const unlockedBadges = userData.achievements?.filter(a => a.unlocked).length || 0;
  const totalBadges = userData.achievements?.length || 0;

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in overflow-y-auto pb-4">
      {/* Profile Header */}
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-10 rounded-2xl blur-xl`} />
        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-2xl shadow-lg`}>
              {RANK_EMOJI[userData.rank]}
            </div>
            
            {/* Info */}
            <div className="flex-grow">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-bold mb-1 ${RANK_BADGE_COLORS[userData.rank]}`}>
                {RANK_EMOJI[userData.rank]} {userData.rank}
              </div>
              <p className="text-white font-mono text-sm">{shortAddress}</p>
              <p className="text-gray-500 text-xs mt-1 italic">"{RANK_DESCRIPTIONS[userData.rank]}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Days on Base</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{userData.daysSinceJoined}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Badges</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{unlockedBadges}<span className="text-gray-600">/{totalBadges}</span></p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">First Block</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">#{parseInt(userData.blockNumber).toLocaleString()}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider">Total TXs</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{(userData.txCount || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Achievements */}
      {userData.achievements && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <Achievements achievements={userData.achievements} />
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <Button 
          variant="secondary" 
          onClick={onShare}
          className="!text-xs !py-2.5" 
          icon={<Share2 className="w-4 h-4" />}
        >
          Share Profile
        </Button>
        <Button 
          variant="secondary" 
          onClick={onViewBasescan}
          className="!text-xs !py-2.5" 
          icon={<ExternalLink className="w-4 h-4" />}
        >
          View on Chain
        </Button>
      </div>
    </div>
  );
};
