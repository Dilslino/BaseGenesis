import { useState, useEffect, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { FarcasterUser } from '../types';

interface UseFarcasterResult {
  isLoaded: boolean;
  isInFrame: boolean;
  user: FarcasterUser | null;
  walletAddress: string | null;
  error: string | null;
  connectWallet: () => Promise<string | null>;
  openUrl: (url: string) => Promise<void>;
  shareToWarpcast: (text: string) => Promise<void>;
  sendTransaction: (params: { to: string; value: string; data?: string }) => Promise<string | null>;
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

  // Connect wallet using Farcaster's ethProvider
  const connectWallet = useCallback(async (): Promise<string | null> => {
    try {
      if (isInFrame) {
        // Use Farcaster's built-in wallet provider
        const provider = sdk.wallet.ethProvider;
        const accounts = await provider.request({ 
          method: 'eth_requestAccounts' 
        }) as string[];
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          return accounts[0];
        }
      } else {
        // Fallback for non-Farcaster browser
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          }) as string[];
          
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            return accounts[0];
          }
        }
      }
      return null;
    } catch (err: any) {
      console.error('Connect wallet error:', err);
      setError(err.message || 'Failed to connect wallet');
      return null;
    }
  }, [isInFrame]);

  // Send transaction using Farcaster's ethProvider
  const sendTransaction = useCallback(async (params: { 
    to: string; 
    value: string; 
    data?: string 
  }): Promise<string | null> => {
    try {
      const provider = isInFrame ? sdk.wallet.ethProvider : window.ethereum;
      
      if (!provider) {
        throw new Error('No wallet provider available');
      }

      // Ensure we're on Base (chainId 8453)
      const chainId = await provider.request({ method: 'eth_chainId' }) as string;
      if (chainId !== '0x2105') {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }],
        });
      }

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: params.to,
          value: params.value,
          data: params.data || '0x',
        }],
      }) as string;

      return txHash;
    } catch (err: any) {
      console.error('Send transaction error:', err);
      setError(err.message || 'Transaction failed');
      return null;
    }
  }, [isInFrame, walletAddress]);

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
    sendTransaction
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
