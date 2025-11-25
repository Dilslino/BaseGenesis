import { useState, useCallback } from 'react';
import { parseEther, encodeFunctionData } from 'viem';
import { UserGenesisData } from '../types';
import { TREASURY_ADDRESS, NFT_CONTRACT_ADDRESS, NFT_ABI, MINT_PRICE } from '../config/wagmi';

interface UseMintResult {
  mint: (userData: UserGenesisData) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

export const useMint = (): UseMintResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const mint = useCallback(async (userData: UserGenesisData): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Check if window.ethereum exists
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install a wallet like MetaMask or use Farcaster wallet');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const account = accounts[0];

      // Check if on Base network (chainId 8453)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
      if (chainId !== '0x2105') { // 8453 in hex
        // Try to switch to Base
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }],
          });
        } catch (switchError: any) {
          // If Base is not added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              }],
            });
          } else {
            throw new Error('Please switch to Base network');
          }
        }
      }

      // If contract is not deployed yet, send directly to treasury
      const isContractDeployed = NFT_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
      
      let hash: string;

      if (isContractDeployed) {
        // Encode mint function call
        const data = encodeFunctionData({
          abi: NFT_ABI,
          functionName: 'mint',
          args: [
            userData.rank,
            BigInt(userData.daysSinceJoined),
            BigInt(userData.blockNumber),
            userData.firstTxHash,
          ],
        });

        // Send transaction to contract
        hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: NFT_CONTRACT_ADDRESS,
            value: parseEther(MINT_PRICE).toString(16),
            data: data,
          }],
        }) as string;
      } else {
        // Send directly to treasury (pre-contract deployment)
        hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: TREASURY_ADDRESS,
            value: '0x' + parseEther(MINT_PRICE).toString(16),
            data: '0x', // No data for simple transfer
          }],
        }) as string;
      }

      setTxHash(hash);
      return hash;

    } catch (err: any) {
      console.error('Mint error:', err);
      
      // Handle common errors
      if (err.code === 4001) {
        setError('Transaction rejected by user');
      } else if (err.code === -32603) {
        setError('Insufficient funds for gas');
      } else {
        setError(err.message || 'Failed to mint NFT');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mint, isLoading, error, txHash };
};

// Add ethereum type to window
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
