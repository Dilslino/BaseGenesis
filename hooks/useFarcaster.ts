import { useState, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { FarcasterUser } from '../types';

interface UseFarcasterResult {
  isLoaded: boolean;
  isInFrame: boolean;
  user: FarcasterUser | null;
  walletAddress: string | null;
  error: string | null;
  // Actions
  connectWallet: () => Promise<string | null>;
  openUrl: (url: string) => Promise<void>;
  shareToWarpcast: (text: string) => Promise<void>;
}

export const useFarcaster = (): UseFarcasterResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const context = await sdk.context;
        
        if (context?.user) {
          setIsInFrame(true);
          setUser({
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl,
          });

          // Try to get wallet address from verified addresses or custody
          const ethAddresses = context.user.verifiedAddresses?.ethAddresses;
          if (ethAddresses && ethAddresses.length > 0) {
            setWalletAddress(ethAddresses[0]);
          } else if (context.user.custodyAddress) {
            setWalletAddress(context.user.custodyAddress);
          }
        }
        
        // Signal ready to Farcaster
        await sdk.actions.ready();
        setIsLoaded(true);
      } catch (err) {
        console.log('Not in Farcaster frame or SDK error:', err);
        setIsLoaded(true);
        setIsInFrame(false);
      }
    };

    initFarcaster();
  }, []);

  // Connect wallet using Farcaster's wallet provider
  const connectWallet = useCallback(async (): Promise<string | null> => {
    try {
      if (isInFrame && sdk.wallet) {
        const provider = sdk.wallet.ethProvider;
        const accounts = await provider.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return accounts[0];
        }
      } else if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return accounts[0];
        }
      }
      return null;
    } catch (err: any) {
      console.error('Connect wallet error:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    }
  }, [isInFrame]);

  const openUrl = useCallback(async (url: string) => {
    try {
      if (isInFrame) {
        await sdk.actions.openUrl(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      window.open(url, '_blank');
    }
  }, [isInFrame]);

  const shareToWarpcast = useCallback(async (text: string) => {
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    await openUrl(shareUrl);
  }, [openUrl]);

  return {
    isLoaded,
    isInFrame,
    user,
    walletAddress,
    error,
    connectWallet,
    openUrl,
    shareToWarpcast,
  };
};

// Add ethereum type to window
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<unknown>;
    };
  }
}
