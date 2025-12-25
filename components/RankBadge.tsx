import React from 'react';
import { UserRank } from '../types';
import { RANK_EMOJI, RANK_BADGE_COLORS } from '../constants';

interface RankBadgeProps {
  rank: UserRank;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md', showEmoji = true }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-bold
      ${RANK_BADGE_COLORS[rank]}
      ${sizeClasses[size]}
    `}>
      {showEmoji && <span>{RANK_EMOJI[rank]}</span>}
      <span>{rank}</span>
    </span>
  );
};
