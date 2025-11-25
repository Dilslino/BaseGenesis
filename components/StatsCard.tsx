import React from 'react';
import { Calendar, Hash, Layers, Activity } from 'lucide-react';

interface StatsCardProps {
  daysSince: number;
  blockNumber: string;
  txHash: string;
  txCount?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ daysSince, blockNumber, txHash, txCount }) => {
  const shortHash = `${txHash.slice(0, 6)}...${txHash.slice(-4)}`;
  
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
          <Calendar className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-wider">Days on Base</span>
        </div>
        <p className="text-lg font-bold font-mono text-white">{daysSince}</p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
          <Layers className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-wider">First Block</span>
        </div>
        <p className="text-lg font-bold font-mono text-white">#{parseInt(blockNumber).toLocaleString()}</p>
      </div>
      
      {txCount !== undefined && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Total TXs</span>
          </div>
          <p className="text-lg font-bold font-mono text-white">{txCount.toLocaleString()}</p>
        </div>
      )}
      
      <div className={`bg-white/5 border border-white/10 rounded-lg p-2.5 ${txCount === undefined ? 'col-span-2' : ''}`}>
        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
          <Hash className="w-3 h-3" />
          <span className="text-[10px] uppercase tracking-wider">Genesis TX</span>
        </div>
        <a 
          href={`https://basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-mono text-base-blue hover:underline"
        >
          {shortHash}
        </a>
      </div>
    </div>
  );
};
