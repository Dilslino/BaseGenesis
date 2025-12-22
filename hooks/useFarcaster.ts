import { useState, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { FarcasterUser } from '../types';

interface UseFarcasterResult {
  isLoaded: boolean;
  isInFrame: boolean;
  isAppAdded: boolean;
  user: FarcasterUser | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  authToken: string | null;
  error: string | null;
  // Actions
  connectWallet: () => Promise<string | null>;
  openUrl: (url: string) => Promise<void>;
  shareToWarpcast: (text: string) => Promise<void>;
  addMiniApp: () => Promise<boolean>;
}

export const useFarcaster = (): UseFarcasterResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [isAppAdded, setIsAppAdded] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
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
          
          // AUTO-AUTHENTICATE: Get Quick Auth token automatically
          try {
            console.log('🔐 Attempting auto-authentication with Quick Auth...');
            const token = await sdk.quickAuth.getToken();
            
            if (token) {
              setAuthToken(token);
              setIsAuthenticated(true);
              console.log('✅ Auto-authenticated successfully!');
              console.log('📝 Auth token:', token.substring(0, 20) + '...');
            }
          } catch (authError) {
            console.warn('⚠️ Auto-authentication failed:', authError);
            // Don't set error state, auth is optional
          }
        }
        
        // Check if app is already added
        if (context?.client?.added) {
          setIsAppAdded(true);
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
        const result = await provider.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Validate response
        if (!Array.isArray(result) || result.length === 0) {
          throw new Error('No accounts returned from wallet');
        }
        
        const accounts = result as string[];
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return accounts[0];
        }
      } else if (window.ethereum) {
        const result = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (!Array.isArray(result) || result.length === 0) {
          throw new Error('No accounts returned from wallet');
        }
        
        const accounts = result as string[];
        
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

  const addMiniApp = useCallback(async (): Promise<boolean> => {
    try {
      if (!isInFrame) {
        console.log('Not in Farcaster frame, cannot add mini app');
        return false;
      }
      
      await sdk.actions.addMiniApp();
      setIsAppAdded(true);
      return true;
    } catch (err: any) {
      console.error('Add mini app error:', err);
      if (err.message?.includes('RejectedByUser')) {
        setError('User rejected adding the app');
      } else if (err.message?.includes('InvalidDomainManifestJson')) {
        setError('Invalid manifest or domain mismatch');
      } else {
        setError(err.message || 'Failed to add mini app');
      }
      return false;
    }
  }, [isInFrame]);

  return {
    isLoaded,
    isInFrame,
    isAppAdded,
    user,
    walletAddress,
    isAuthenticated,
    authToken,
    error,
    connectWallet,
    openUrl,
    shareToWarpcast,
    addMiniApp,
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
