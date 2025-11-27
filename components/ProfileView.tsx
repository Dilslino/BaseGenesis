import React, { useState } from 'react';
import { Calendar, Award, Layers, Activity, ExternalLink, Share2, X } from 'lucide-react';
import { UserGenesisData } from '../types';
import { RANK_COLORS, RANK_EMOJI, RANK_BADGE_COLORS, RANK_DESCRIPTIONS } from '../constants';
import { Achievements } from './Achievements';
import { Button } from './Button';

interface ProfileViewProps {
  userData: UserGenesisData;
  onShareFarcaster: () => void;
  onViewBasescan: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userData, onShareFarcaster, onViewBasescan }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const gradientColor = RANK_COLORS[userData.rank];
  const shortAddress = `${userData.address.slice(0, 6)}...${userData.address.slice(-4)}`;
  
  const unlockedBadges = userData.achievements?.filter(a => a.unlocked).length || 0;
  const totalBadges = userData.achievements?.length || 0;

  // Share URL with card preview
  const appUrl = 'https://basegenesis.vercel.app';
  const shareUrl = `${appUrl}?address=${userData.address}`;
  
  // Share messages
  const shareText = `${RANK_EMOJI[userData.rank]} I'm a ${userData.rank} on Base!\n\n${userData.daysSinceJoined} days since my first transaction.\n\nCheck your genesis rank:`;

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
    setShowShareModal(false);
  };

  const handleShareFarcaster = () => {
    onShareFarcaster();
    setShowShareModal(false);
  };

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
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Share & Flex 🔥</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 space-y-3">
              <p className="text-gray-400 text-sm text-center mb-4">
                Flex your {userData.rank} status to the world!
              </p>
              
              {/* Twitter/X Button */}
              <button
                onClick={handleShareTwitter}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-gray-800 to-gray-900
                  hover:from-gray-700 hover:to-gray-800
                  border border-white/10 hover:border-white/20
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X (Twitter)
              </button>
              
              {/* Farcaster Button */}
              <button
                onClick={handleShareFarcaster}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-purple-600 to-purple-800
                  hover:from-purple-500 hover:to-purple-700
                  border border-purple-500/30 hover:border-purple-500/50
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 7.5V3h18v4.5h-3.5V21h-4V7.5h-3V21H6.5V7.5H3z"/>
                </svg>
                Share on Farcaster
              </button>

              {/* Preview Link */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-gray-500 text-xs text-center">
                  Your card will be shown when people click the link
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
