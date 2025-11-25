import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Your wallet address for receiving mint payments
export const TREASURY_ADDRESS = '0x0b7241893f2f6fBD71F5af6E09D896d190E5C339' as const;

// NFT Contract address (deploy and update this)
export const NFT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Mint price in ETH (~$1)
export const MINT_PRICE = '0.0003';
export const MINT_PRICE_WEI = 300000000000000n; // 0.0003 ETH in wei

// WalletConnect Project ID (get from cloud.walletconnect.com)
const projectId = 'YOUR_PROJECT_ID';

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(),
  },
});

// Contract ABI for minting
export const NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'rank', type: 'string' },
      { name: 'daysSince', type: 'uint256' },
      { name: 'firstBlock', type: 'uint256' },
      { name: 'firstTxHash', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'hasMinted',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'mintPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'tokenData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'rank', type: 'string' },
      { name: 'daysSince', type: 'uint256' },
      { name: 'firstBlock', type: 'uint256' },
      { name: 'firstTxHash', type: 'string' },
      { name: 'mintedAt', type: 'uint256' },
    ],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'GenesisMinted',
    type: 'event',
    inputs: [
      { name: 'minter', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'rank', type: 'string', indexed: false },
    ],
  },
] as const;
