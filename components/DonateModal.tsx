import React, { useState } from 'react';
import { X, Heart, CheckCircle } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonate: (amount: string, token: 'ETH' | 'USDC') => Promise<string | null>;
  isLoading: boolean;
}

const PRESET_AMOUNTS = ['1', '5', '10'];

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  onDonate,
  isLoading,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<string>('5');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<'ETH' | 'USDC'>('USDC');
  const [isCustom, setIsCustom] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetClick = (amount: string) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount('');
  };

  const getAmount = () => {
    return isCustom ? customAmount : selectedAmount;
  };

  const handleDonate = async () => {
    const amount = getAmount();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setError(null);
    const hash = await onDonate(amount, selectedToken);
    
    if (hash) {
      setTxHash(hash);
    } else {
      setError('Transaction failed. Please try again.');
    }
  };

  const handleClose = () => {
    setTxHash(null);
    setError(null);
    setSelectedAmount('5');
    setCustomAmount('');
    setIsCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-base-black border border-white/10 rounded-2xl p-5 w-full max-w-sm animate-bounce-in">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {txHash ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Thank You!</h3>
              <p className="text-gray-400 text-sm mt-1">Your support means a lot</p>
            </div>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-base-blue/20 text-base-blue text-sm rounded-lg hover:bg-base-blue/30 transition"
            >
              View Transaction
            </a>
          </div>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto bg-pink-500/20 rounded-full flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Support the Creator</h3>
              <p className="text-gray-400 text-sm mt-1">Help keep BaseGenesis running</p>
            </div>

            {/* Token Selection */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Token</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedToken('USDC')}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedToken === 'USDC'
                      ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  USDC
                </button>
                <button
                  onClick={() => setSelectedToken('ETH')}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedToken === 'ETH'
                      ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  ETH
                </button>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Select Amount</p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedAmount === amount && !isCustom
                        ? 'bg-base-blue/20 border-2 border-base-blue text-base-blue'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  onClick={handleCustomClick}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isCustom
                      ? 'bg-base-blue/20 border-2 border-base-blue text-base-blue'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Other
                </button>
              </div>
            </div>

            {/* Custom Amount Input */}
            {isCustom && (
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-base-blue/50"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={isLoading || (!selectedAmount && !customAmount)}
              className="w-full py-3.5 rounded-xl font-semibold text-white
                bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
                hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Donate $${getAmount() || '0'} ${selectedToken}`
              )}
            </button>

            <p className="text-center text-gray-500 text-[10px] mt-3">
              100% goes directly to the creator
            </p>
          </>
        )}
      </div>
    </div>
  );
};
