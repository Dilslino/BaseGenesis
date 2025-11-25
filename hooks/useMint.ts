import { useState, useCallback } from 'react';
import { parseEther, encodeFunctionData } from 'viem';
import sdk from '@farcaster/frame-sdk';
import { UserGenesisData } from '../types';
import { TREASURY_ADDRESS, NFT_CONTRACT_ADDRESS, NFT_ABI, MINT_PRICE } from '../config/wagmi';

interface UseMintResult {
  mint: (userData: UserGenesisData, isInFrame?: boolean) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

export const useMint = (): UseMintResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const mint = useCallback(async (userData: UserGenesisData, isInFrame: boolean = false): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Get the appropriate provider
      const provider = isInFrame ? sdk.wallet.ethProvider : window.ethereum;
      
      if (!provider) {
        throw new Error('No wallet provider available');
      }

      // Request account access
      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const account = accounts[0];

      // Ensure on Base network (chainId 8453)
      const chainId = await provider.request({ method: 'eth_chainId' }) as string;
      if (chainId !== '0x2105') {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await provider.request({
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

      // Check if contract is deployed
      const isContractDeployed = NFT_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
      
      let hash: string;
      const mintValue = '0x' + parseEther(MINT_PRICE).toString(16);

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

        hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: NFT_CONTRACT_ADDRESS,
            value: mintValue,
            data: data,
          }],
        }) as string;
      } else {
        // Send directly to treasury
        hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: TREASURY_ADDRESS,
            value: mintValue,
            data: '0x',
          }],
        }) as string;
      }

      setTxHash(hash);
      return hash;

    } catch (err: any) {
      console.error('Mint error:', err);
      
      if (err.code === 4001) {
        setError('Transaction rejected');
      } else if (err.code === -32603) {
        setError('Insufficient funds');
      } else {
        setError(err.message || 'Mint failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mint, isLoading, error, txHash };
};
