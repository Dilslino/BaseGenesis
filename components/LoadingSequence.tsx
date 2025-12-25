import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Resolving ENS...",
  "Querying Base Node...",
  "Scanning Transaction History...",
  "Calculating Block Timestamps...",
  "Verifying Genesis Proof...",
  "Minting Flex Card..."
];

export const LoadingSequence: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-base-blue/20"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-base-blue animate-spin"></div>
        <div className="absolute inset-3 rounded-full bg-base-blue/20 animate-pulse"></div>
      </div>
      
      <div className="h-6 flex items-center justify-center">
        <span className="text-xs font-mono text-base-blue uppercase tracking-widest animate-pulse">
          {MESSAGES[msgIndex]}
        </span>
      </div>

      <div className="w-40 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-base-blue animate-shimmer w-full origin-left scale-x-50"></div>
      </div>
    </div>
  );
};
