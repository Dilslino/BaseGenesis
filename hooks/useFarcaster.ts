import { useState, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { FarcasterUser } from '../types';

interface UseFarcasterResult {
  isLoaded: boolean;
  isInFrame: boolean;
  user: FarcasterUser | null;
  walletAddress: string | null;
  error: string | null;
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

          // Try to get wallet address from verified addresses
          if (context.user.verifiedAddresses?.ethAddresses?.length) {
            setWalletAddress(context.user.verifiedAddresses.ethAddresses[0]);
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
    openUrl,
    shareToWarpcast
  };
};
