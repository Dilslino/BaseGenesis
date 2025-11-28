import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, Users, Search } from 'lucide-react';
import { Button } from './Button';
import { useRealtimeScanCount } from '../hooks/useRealtimeScanCount';

interface HomeViewProps {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  isInFrame: boolean;
  username?: string;
  pfpUrl?: string;
  totalUsers: number;
  onConnect: () => void;
  onDisconnect: () => void;
  onNavigateToScan: () => void;
  onPasteAddressScan: (address: string) => void;
}

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (value <= 0) return;
    
    // First time: just set the value directly (no animation from 0)
    if (!hasInitialized) {
      setDisplayValue(value);
      setHasInitialized(true);
      return;
    }
    
    // Subsequent updates: animate only the increment (+1, +2, etc)
    const prevValue = displayValue || value;
    if (value > prevValue) {
      // Small animation for increment
      const diff = value - prevValue;
      const steps = Math.min(diff * 10, 30);
      const increment = diff / steps;
      let current = prevValue;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 50);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, hasInitialized]);
  
  // Show nothing until we have a value
  if (displayValue === null) {
    return <span>...</span>;
  }
  
  return <span>{displayValue.toLocaleString()}</span>;
};

export const HomeView: React.FC<HomeViewProps> = ({
  isConnected,
  isConnecting,
  walletAddress,
  isInFrame,
  username,
  pfpUrl,
  totalUsers,
  onConnect,
  onDisconnect,
  onNavigateToScan,
  onPasteAddressScan,
}) => {
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : '';

  const [pasteAddress, setPasteAddress] = useState('');
  const [pasteError, setPasteError] = useState('');
  
  // Use real-time scan count from Supabase
  const { count: scanCount } = useRealtimeScanCount(totalUsers);

  const handlePasteScan = () => {
    setPasteError('');
    const trimmed = pasteAddress.trim();
    
    if (!trimmed) {
      setPasteError('Please enter an address');
      return;
    }
    
    if (!trimmed.startsWith('0x') || trimmed.length !== 42) {
      setPasteError('Invalid address format');
      return;
    }
    
    onPasteAddressScan(trimmed);
  };

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
                <p className="text-gray-400 text-sm">Connect wallet to save your profile</p>
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
                  isInFrame ? 'Connect Farcaster Wallet' : 'Connect Wallet'
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-gray-500 text-xs">or scan any address</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Paste Address Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteAddress}
                    onChange={(e) => setPasteAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-base-blue/50"
                  />
                  <button
                    onClick={handlePasteScan}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {pasteError && (
                  <p className="text-red-400 text-xs text-center">{pasteError}</p>
                )}
                <p className="text-gray-500 text-[10px] text-center">
                  Note: Paste scan won't save to leaderboard
                </p>
              </div>
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
