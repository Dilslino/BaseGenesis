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
  shareToWarpcast: (text: string, embedUrl?: string) => Promise<void>;
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

          // Try to get wallet address from custody address
          // Note: Farcaster SDK context.user only provides basic info
          // Wallet address needs to be requested via connectWallet()
          if ((context.user as any).custodyAddress) {
            setWalletAddress((context.user as any).custodyAddress);
          }
          
          // AUTO-AUTHENTICATE: Get Quick Auth token automatically
          try {
            console.log('🔐 Attempting auto-authentication with Quick Auth...');
            const result = await sdk.quickAuth.getToken();
            
            if (result && typeof result === 'object' && 'token' in result) {
              const token = (result as any).token as string;
              setAuthToken(token);
              setIsAuthenticated(true);
              console.log('✅ Auto-authenticated successfully!');
              
              // AUTO-CONNECT WALLET after successful auth
              try {
                console.log('🔗 Auto-connecting wallet...');
                const provider = sdk.wallet.ethProvider;
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                if (Array.isArray(accounts) && accounts.length > 0) {
                  setWalletAddress(accounts[0]);
                  console.log('✅ Auto-connected wallet:', accounts[0]);
                }
              } catch (walletErr) {
                console.warn('⚠️ Auto wallet connect failed:', walletErr);
              }
            }
          } catch (authError) {
            console.warn('⚠️ Auto-authentication failed:', authError);
            // Don't set error state, auth is optional
          }
        }
        
        // Check if app is already added
        const isAdded = context?.client?.added || false;
        setIsAppAdded(isAdded);
        console.log('🔍 App added status:', isAdded, 'Location:', context?.location?.type);
        
        // Signal ready to Farcaster
        await sdk.actions.ready();
        setIsLoaded(true);
        
        // Note: Auto-prompt disabled - using modal in page.tsx instead
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
        const result = await (window.ethereum as any).request({ 
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

  const shareToWarpcast = useCallback(async (text: string, embedUrl?: string) => {
    try {
      if (isInFrame && embedUrl) {
        // Use SDK composeCast for better UX with embed preview
        console.log('🎯 Opening composer with embed:', embedUrl);
        await sdk.actions.composeCast({
          text,
          embeds: [embedUrl]
        });
      } else if (isInFrame) {
        // Use SDK composeCast without embed
        await sdk.actions.composeCast({
          text
        });
      } else {
        // Fallback to Warpcast URL for non-frame
        const params = new URLSearchParams({ text });
        if (embedUrl) {
          params.append('embeds[]', embedUrl);
        }
        const shareUrl = `https://warpcast.com/~/compose?${params.toString()}`;
        await openUrl(shareUrl);
      }
    } catch (err) {
      console.error('Share error:', err);
      // Fallback to URL method
      const params = new URLSearchParams({ text });
      if (embedUrl) {
        params.append('embeds[]', embedUrl);
      }
      const shareUrl = `https://warpcast.com/~/compose?${params.toString()}`;
      window.open(shareUrl, '_blank');
    }
  }, [isInFrame, openUrl]);

  const addMiniApp = useCallback(async (): Promise<boolean> => {
    try {
      if (!isInFrame) {
        console.log('Not in Farcaster frame, cannot add mini app');
        return false;
      }
      
      console.log('🎯 Calling sdk.actions.addMiniApp()...');
      await sdk.actions.addMiniApp();
      console.log('✅ Add mini app successful!');
      setIsAppAdded(true);
      return true;
    } catch (err: any) {
      console.error('Add mini app error:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
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

