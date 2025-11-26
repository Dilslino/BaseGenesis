import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, Users } from 'lucide-react';
import { Button } from './Button';

interface HomeViewProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  isInFrame: boolean;
  username?: string;
  pfpUrl?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onNavigateToScan: () => void;
}

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{displayValue.toLocaleString()}</span>;
};

export const HomeView: React.FC<HomeViewProps> = ({
  isConnected,
  isConnecting,
  walletAddress,
  isInFrame,
  username,
  pfpUrl,
  onConnect,
  onDisconnect,
  onNavigateToScan,
}) => {
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : '';

  const [scanCount, setScanCount] = useState(12847);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScanCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-grow flex flex-col justify-center space-y-6 px-2">
        
        {/* Hero */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Discover Your{' '}
            <span className="hero-title text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-purple-400 to-cyan-300 animate-gradient-x">
              Base Origin
            </span>
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-base max-w-[300px] sm:max-w-[360px] mx-auto">
            Find out when you first joined Base and earn your Genesis rank
          </p>
        </div>

        {/* Wallet Connection Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
          {isConnected ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {pfpUrl ? (
                    <img src={pfpUrl} alt="" className="w-10 h-10 rounded-full border-2 border-green-500" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-base-blue to-purple-600 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    {username && <p className="text-white font-semibold text-sm">@{username}</p>}
                    <p className="text-gray-400 font-mono text-xs">{shortAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-green-400 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
              
              <button
                onClick={onNavigateToScan}
                className="w-full py-3.5 sm:py-4 rounded-2xl font-semibold text-white text-sm sm:text-base
                  bg-gradient-to-r from-base-blue/80 via-indigo-500/80 to-purple-500/80
                  hover:from-base-blue hover:via-indigo-500 hover:to-purple-500
                  backdrop-blur-sm border border-white/10 hover:border-white/20
                  shadow-lg shadow-base-blue/20 hover:shadow-base-blue/40
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Scan My Wallet
              </button>

              {!isInFrame && (
                <button
                  onClick={onDisconnect}
                  className="w-full text-center text-gray-500 hover:text-red-400 text-xs flex items-center justify-center gap-1 transition"
                >
                  <LogOut className="w-3 h-3" />
                  Disconnect Wallet
                </button>
              )}
            </>
          ) : (
            <>
              <div className="text-center py-2">
                <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Connect your wallet to begin</p>
              </div>
              
              <Button
                variant="primary"
                onClick={onConnect}
                disabled={isConnecting}
                className="w-full !py-3"
                icon={isConnecting ? undefined : <Wallet className="w-5 h-5" />}
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  isInFrame ? 'Connect Farcaster Wallet' : 'Connect with WalletConnect'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Rank Preview */}
        <div className="space-y-3">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest text-center">Possible Genesis Ranks</p>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-lg sm:text-xl">👑</span>
              <p className="text-yellow-400 text-[10px] sm:text-[11px] font-bold mt-1">OG</p>
              <p className="text-gray-500 text-[8px] sm:text-[9px]">Legend</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-lg sm:text-xl">🏆</span>
              <p className="text-amber-400 text-[10px] sm:text-[11px] font-bold mt-1">Pioneer</p>
              <p className="text-gray-500 text-[8px] sm:text-[9px]">Day 1</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-lg sm:text-xl">⚡</span>
              <p className="text-cyan-400 text-[10px] sm:text-[11px] font-bold mt-1">Settler</p>
              <p className="text-gray-500 text-[8px] sm:text-[9px]">Early</p>
            </div>
            <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-2 sm:p-2.5 text-center">
              <span className="text-lg sm:text-xl">🌐</span>
              <p className="text-slate-400 text-[10px] sm:text-[11px] font-bold mt-1">Citizen</p>
              <p className="text-gray-500 text-[8px] sm:text-[9px]">Builder</p>
            </div>
          </div>
        </div>

        {/* Live Scan Counter */}
        <div className="bg-gradient-to-r from-base-blue/10 via-purple-500/10 to-cyan-500/10 border border-white/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="relative">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-base-blue" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-gray-400 text-xs sm:text-sm">Wallets Scanned</span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-base-blue to-cyan-400">
              <AnimatedCounter value={scanCount} />
            </div>
          </div>
          <p className="text-center text-gray-500 text-[9px] sm:text-[10px] mt-1.5 sm:mt-2">Live counter updating in real-time</p>
        </div>
      </div>
    </div>
  );
};
