import { useState, useCallback } from 'react';
import { parseEther, parseUnits, encodeFunctionData } from 'viem';
import sdk from '@farcaster/frame-sdk';
import { getEthPrice } from '../lib/ethPrice';

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
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
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
      const provider = (isInFrame && sdk.wallet) ? (sdk.wallet.ethProvider as any) : window.ethereum;
      
      if (!provider) {
        throw new Error('No wallet provider available');
      }

      const result = await provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (!Array.isArray(result) || result.length === 0) {
        throw new Error('No accounts returned. Please connect your wallet.');
      }
      
      const accounts = result as string[];

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
        
        // Check current allowance
        const allowanceData = encodeFunctionData({
          abi: ERC20_TRANSFER_ABI,
          functionName: 'allowance',
          args: [account as `0x${string}`, CREATOR_WALLET],
        });

        const currentAllowance = await provider.request({
          method: 'eth_call',
          params: [{
            to: USDC_ADDRESS,
            data: allowanceData,
          }, 'latest'],
        }) as string;

        const allowanceBigInt = BigInt(currentAllowance);

        // Request approval if allowance is insufficient
        if (allowanceBigInt < amount) {
          const approveData = encodeFunctionData({
            abi: ERC20_TRANSFER_ABI,
            functionName: 'approve',
            args: [CREATOR_WALLET, amount],
          });

          const approveTxHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: account,
              to: USDC_ADDRESS,
              data: approveData,
            }],
          }) as string;

          // Wait for approval confirmation (optional: could add polling)
          console.log('Approval transaction:', approveTxHash);
        }
        
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
        // ETH - convert USD to ETH using real-time price
        const ethPrice = await getEthPrice();
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
