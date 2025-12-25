import React from 'react';
import { X, Plus, Star } from 'lucide-react';

interface AddMiniAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  isAdding?: boolean;
}

export const AddMiniAppModal: React.FC<AddMiniAppModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isAdding = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden animate-fade-in">
        {/* Close Button */}
        <div className="flex justify-end p-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            disabled={isAdding}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="px-6 pb-6 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-base-blue/20 flex items-center justify-center border border-purple-500/30">
            <img src="/logo.jpg" alt="BaseGenesis" className="w-12 h-12 rounded-xl" />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">Add BaseGenesis</h3>
          
          {/* Description */}
          <p className="text-gray-400 text-sm mb-6">
            Add BaseGenesis to your Warpcast for quick access and notifications
          </p>
          
          {/* Features */}
          <div className="space-y-2 mb-6 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-300">Access from your app drawer</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-300">Get notified about new features</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-300">One-tap launch from Warpcast</span>
            </div>
          </div>
          
          {/* Add Button */}
          <button
            onClick={onAdd}
            disabled={isAdding}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
              bg-gradient-to-r from-purple-600 to-base-blue
              hover:from-purple-500 hover:to-blue-500
              border border-purple-500/30 hover:border-purple-500/50
              transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
              flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </span>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add to Warpcast
              </>
            )}
          </button>
          
          {/* Skip Button */}
          <button
            onClick={onClose}
            className="mt-3 text-gray-500 hover:text-gray-400 text-sm transition-colors"
            disabled={isAdding}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
