import React, { useState, useEffect } from 'react';

const MESSAGES = [
  { text: "Connecting to Base Network", icon: "🔗" },
  { text: "Scanning Blockchain History", icon: "🔍" },
  { text: "Analyzing Transactions", icon: "📊" },
  { text: "Calculating Genesis Rank", icon: "⚡" },
  { text: "Verifying On-Chain Data", icon: "✓" },
  { text: "Generating Your Card", icon: "🎨" }
];

export const LoadingSequence: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Message rotation
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Stop at 95%
        return prev + Math.random() * 15;
      });
    }, 300);
    
    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
      {/* Main Loader with Orbiting Particles */}
      <div className="relative w-32 h-32">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-base-blue/20 via-purple-500/20 to-base-blue/20 blur-xl animate-pulse"></div>
        
        {/* Main spinning ring */}
        <div className="absolute inset-4 rounded-full border-2 border-transparent bg-gradient-to-r from-base-blue via-purple-500 to-base-blue bg-clip-border animate-spin" 
             style={{ animationDuration: '3s' }}></div>
        
        {/* Secondary counter-spinning ring */}
        <div className="absolute inset-6 rounded-full border-2 border-transparent bg-gradient-to-l from-cyan-400 via-blue-500 to-cyan-400 bg-clip-border animate-spin" 
             style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        
        {/* Center core with pulse */}
        <div className="absolute inset-10 rounded-full bg-gradient-to-br from-base-blue to-purple-600 animate-pulse flex items-center justify-center shadow-[0_0_30px_rgba(0,82,255,0.5)]">
          <span className="text-2xl animate-bounce">{MESSAGES[msgIndex].icon}</span>
        </div>
        
        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              top: '50%',
              left: '50%',
              animation: `orbit ${2 + i}s linear infinite`,
              animationDelay: `${i * 0.7}s`
            }}
          />
        ))}
      </div>
      
      {/* Status Text with smooth transition */}
      <div className="h-8 flex flex-col items-center justify-center space-y-1">
        <span 
          key={msgIndex}
          className="text-sm font-semibold text-white tracking-wide animate-fade-in-up"
        >
          {MESSAGES[msgIndex].text}
        </span>
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-base-blue animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar with gradient */}
      <div className="w-56 space-y-2">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-base-blue via-purple-500 to-cyan-400 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 font-mono">
          {Math.min(Math.round(progress), 95)}%
        </p>
      </div>
      
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-base-blue/30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
