import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Get projectId from https://cloud.reown.com
// Create a free project at https://cloud.reown.com and add your domain
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn('WalletConnect Project ID is not defined. WalletConnect will not work.');
}

// Setup queryClient
export const queryClient = new QueryClient();

// Metadata for WalletConnect
const metadata = {
  name: 'BaseGenesis',
  description: 'Discover your Base blockchain genesis rank',
  url: 'https://basegenesis.vercel.app',
  icons: ['https://basegenesis.vercel.app/logo.jpg']
};

// Create Wagmi Adapter with Base chain only
export const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId: projectId || 'placeholder',
  ssr: false,
});

// Create the AppKit modal only if projectId exists
if (projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    networks: [base],
    projectId,
    metadata,
    features: {
      analytics: true,
      email: false,
      socials: false,
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-color-mix': '#0052FF',
      '--w3m-accent': '#0052FF',
      '--w3m-border-radius-master': '12px',
    }
  });
}

export const wagmiConfig = wagmiAdapter.wagmiConfig;
