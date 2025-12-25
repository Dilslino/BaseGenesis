import React from 'react';
import { Scan, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { LoadingSequence } from './LoadingSequence';

interface ScanViewProps {
  isConnected: boolean;
  isScanning: boolean;
  walletAddress: string | null;
  onStartScan: () => void;
  error?: string;
}

export const ScanView: React.FC<ScanViewProps> = ({ 
  isConnected, 
  isScanning, 
  walletAddress,
  onStartScan,
  error 
}) => {
  const shortAddress = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
    : '';

  if (isScanning) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center">
        <LoadingSequence />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center space-y-6 animate-fade-in px-4">
      {/* Scan Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-base-blue/20 blur-2xl rounded-full" />
        <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-base-blue to-purple-600 flex items-center justify-center">
          <Scan className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">Ready to Scan</h2>
        <p className="text-gray-400 text-sm max-w-[280px]">
          Analyze your wallet to discover when you first joined Base blockchain
        </p>
      </div>

      {/* Connected Wallet */}
      {(isConnected || walletAddress) && walletAddress && (
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Connected Wallet</p>
            <p className="text-white font-mono text-sm">{shortAddress}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Scan Button */}
      <Button
        variant="mint"
        onClick={onStartScan}
        disabled={!isConnected && !walletAddress}
        className="!px-8 !py-3 !text-base"
        icon={<Scan className="w-5 h-5" />}
      >
        Start Scan
      </Button>

      {!isConnected && !walletAddress && (
        <p className="text-gray-500 text-xs">Connect your wallet first</p>
      )}
    </div>
  );
};
