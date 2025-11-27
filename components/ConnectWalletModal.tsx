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
          
          {/* WalletConnect Button */}
          <button
            onClick={onConnectWalletConnect}
            disabled={isConnecting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-blue-600 to-blue-800
              hover:from-blue-500 hover:to-blue-700
              border border-blue-500/30 hover:border-blue-500/50
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
                <svg className="w-5 h-5" viewBox="0 0 300 185" fill="currentColor">
                  <path d="M61.4385 36.2562C104.408 -5.41873 175.592 -5.41873 218.562 36.2562L223.823 41.3543C226.059 43.5245 226.059 47.0736 223.823 49.2438L205.647 66.7728C204.529 67.8579 202.735 67.8579 201.617 66.7728L194.341 59.6956C164.578 30.7988 115.422 30.7988 85.6593 59.6956L77.8235 67.3314C76.7053 68.4165 74.9111 68.4165 73.7929 67.3314L55.6176 49.8024C53.3815 47.6322 53.3815 44.0831 55.6176 41.9129L61.4385 36.2562ZM254.849 71.4075L271.006 87.0066C273.242 89.1768 273.242 92.7259 271.006 94.8961L197.528 166.244C195.292 168.414 191.704 168.414 189.468 166.244L136.022 114.057C135.463 113.514 134.566 113.514 134.007 114.057L80.5616 166.244C78.3255 168.414 74.7373 168.414 72.5012 166.244L-1.00628 94.8961C-3.24238 92.7259 -3.24238 89.1768 -1.00628 87.0066L15.1508 71.4075C17.3869 69.2373 20.9751 69.2373 23.2112 71.4075L76.6568 123.595C77.2162 124.137 78.1131 124.137 78.6726 123.595L132.118 71.4075C134.354 69.2373 137.942 69.2373 140.178 71.4075L193.624 123.595C194.183 124.137 195.08 124.137 195.639 123.595L249.085 71.4075C251.321 69.2373 254.613 69.2373 254.849 71.4075Z"/>
                </svg>
                WalletConnect
              </>
            )}
          </button>

          {/* Note */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-gray-500 text-xs text-center">
              {isInFrame 
                ? 'Use Farcaster Wallet for the best experience'
                : 'WalletConnect supports 300+ wallets'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
