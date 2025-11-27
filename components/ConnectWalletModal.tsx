import React from 'react';
import { X } from 'lucide-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectFarcaster: () => void;
  onConnectWalletConnect: () => void;
  isConnecting: boolean;
  isInFrame: boolean;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  onConnectFarcaster,
  onConnectWalletConnect,
  isConnecting,
  isInFrame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            disabled={isConnecting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-4 space-y-3">
          <p className="text-gray-400 text-sm text-center mb-4">
            Choose how you want to connect
          </p>
          
          {/* Farcaster Wallet Button */}
          <button
            onClick={onConnectFarcaster}
            disabled={isConnecting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-purple-600 to-purple-800
              hover:from-purple-500 hover:to-purple-700
              border border-purple-500/30 hover:border-purple-500/50
              transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-3
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 1000 1000" fill="currentColor">
                  <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"/>
                  <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
                  <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
                </svg>
                Farcaster Wallet
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-gray-500 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>
          
          {/* Browser Wallet Button */}
          <button
            onClick={onConnectWalletConnect}
            disabled={isConnecting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-orange-500 to-orange-700
              hover:from-orange-400 hover:to-orange-600
              border border-orange-500/30 hover:border-orange-500/50
              transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-3
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 318.6 318.6" fill="currentColor">
                  <path d="M274.1 35.5l-99.5 73.9L193 65.8z" fill="#E2761B"/>
                  <path d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm-204.4.9L50.1 263l56.7-15.6-26.5-40.6z" fill="#E4761B"/>
                  <path d="M103.6 138.2l-15.8 23.9 56.3 2.5-2-60.5zm111.3 0l-39-34.8-1.3 61.2 56.2-2.5zM106.8 247.4l33.8-16.5-29.2-22.8zm71.1-16.5l33.9 16.5-4.7-39.3z" fill="#E4761B"/>
                </svg>
                Browser Wallet
              </>
            )}
          </button>

          {/* Note */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-gray-500 text-xs text-center">
              {isInFrame 
                ? 'Use Farcaster Wallet for the best experience'
                : 'Connect with MetaMask, Coinbase Wallet, or other browser wallets'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
