import React from 'react';
import { Wallet, Sparkles, ChevronRight, Zap, LogOut } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-grow flex flex-col justify-center space-y-6 px-2">
        
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-base-blue/10 border border-base-blue/20 rounded-full text-xs text-base-blue">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Farcaster Mini App</span>
          </div>
          
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Discover Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-base-blue via-purple-400 to-white">
              Base Origin
            </span>
          </h1>
          
          <p className="text-gray-400 text-sm max-w-[300px] mx-auto">
            Find out when you first joined Base and earn your Genesis rank
          </p>
        </div>

        {/* Wallet Connection Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
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
              
              <Button
                variant="mint"
                onClick={onNavigateToScan}
                className="w-full !py-3"
                icon={<Zap className="w-5 h-5" />}
              >
                Start Genesis Scan
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

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
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">Possible Genesis Ranks</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
              <span className="text-2xl">🏆</span>
              <p className="text-amber-400 text-xs font-bold mt-1">Pioneer</p>
              <p className="text-gray-500 text-[10px]">Day 1</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
              <span className="text-2xl">⚡</span>
              <p className="text-cyan-400 text-xs font-bold mt-1">Settler</p>
              <p className="text-gray-500 text-[10px]">Early</p>
            </div>
            <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 text-center">
              <span className="text-2xl">🌐</span>
              <p className="text-slate-400 text-xs font-bold mt-1">Citizen</p>
              <p className="text-gray-500 text-[10px]">Builder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
