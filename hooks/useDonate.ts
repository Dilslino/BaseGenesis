import { useState, useCallback } from 'react';
import { parseEther, parseUnits, encodeFunctionData } from 'viem';
import { sdk } from '@farcaster/miniapp-sdk';

const CREATOR_WALLET = '0xEA83Fad9414A2e82Ea00Fb30e4C3e09B7E51fE4d' as const;

// USDC on Base
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

// ERC20 transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

interface UseDonateResult {
  donate: (amountUsd: string, token: 'ETH' | 'USDC', isInFrame: boolean) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export const useDonate = (): UseDonateResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donate = useCallback(async (
    amountUsd: string, 
    token: 'ETH' | 'USDC',
    isInFrame: boolean
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = (isInFrame && sdk.wallet) ? sdk.wallet.ethProvider : window.ethereum;
      
      if (!provider) {
        throw new Error('No wallet provider available');
      }

      const accounts = await provider.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet connected');
      }

      const account = accounts[0];

      // Ensure on Base network
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
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      let hash: string;

      if (token === 'USDC') {
        // USDC has 6 decimals
        const amount = parseUnits(amountUsd, 6);
        
        const data = encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          functionName: 'transfer',
          args: [CREATOR_WALLET, amount],
        });

        hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: USDC_ADDRESS,
            data: data,
          }],
        }) as string;
      } else {
        // ETH - convert USD to ETH (approximate: $3000/ETH)
        const ethPrice = 3000;
        const ethAmount = parseFloat(amountUsd) / ethPrice;
        const ethValue = parseEther(ethAmount.toFixed(18));

        hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: CREATOR_WALLET,
            value: '0x' + ethValue.toString(16),
          }],
        }) as string;
      }

      return hash;
    } catch (err: any) {
      console.error('Donate error:', err);
      
      if (err.code === 4001) {
        setError('Transaction cancelled');
      } else if (err.code === -32603) {
        setError('Insufficient funds');
      } else {
        setError(err.message || 'Donation failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { donate, isLoading, error };
};
