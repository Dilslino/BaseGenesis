'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Crown, Activity, Award, CreditCard } from 'lucide-react';
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
      <motion.div 
        className="flex-grow flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <LoadingSequence />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex-grow flex flex-col items-center justify-center space-y-6 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Scan Icon */}
      <motion.div 
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 bg-base-blue/20 blur-2xl rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Pulse rings */}
        <motion.div 
          className="absolute inset-0 rounded-2xl border-2 border-base-blue/30"
          animate={{ 
            scale: [1, 1.5],
            opacity: [0.5, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute inset-0 rounded-2xl border-2 border-base-blue/30"
          animate={{ 
            scale: [1, 1.5],
            opacity: [0.5, 0]
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        />
        
        {/* Main icon container */}
        <motion.div 
          className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-base-blue to-purple-600 flex items-center justify-center shadow-xl shadow-base-blue/30"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Scan className="w-12 h-12 text-white" />
        </motion.div>
      </motion.div>

      {/* Info */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-white">Ready to Scan</h2>
        <p className="text-gray-400 text-sm max-w-[280px]">
          Analyze your wallet to discover when you first joined Base blockchain
        </p>
      </motion.div>

      {/* Connected Wallet */}
      {(isConnected || walletAddress) && walletAddress && (
        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <motion.div 
              className="w-2 h-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Connected Wallet</p>
            <p className="text-white font-mono text-sm">{shortAddress}</p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div 
          className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-center"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Scan Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="mint"
          onClick={onStartScan}
          disabled={!isConnected && !walletAddress}
          className="!px-8 !py-3 !text-base"
          icon={<Scan className="w-5 h-5" />}
        >
          Start Scan
        </Button>
      </motion.div>

      {!isConnected && !walletAddress && (
        <motion.p 
          className="text-gray-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Connect your wallet first
        </motion.p>
      )}

      {/* Features List */}
        <motion.div 
          className="mt-6 w-full max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Crown, text: 'Genesis Rank' },
              { icon: Activity, text: 'TX Count' },
              { icon: Award, text: 'Achievements' },
              { icon: CreditCard, text: 'Flex Card' },
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <feature.icon className="w-4 h-4 text-base-blue" />
                <span className="text-xs text-gray-300 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
    </motion.div>
  );
};
