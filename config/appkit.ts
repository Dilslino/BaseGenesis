import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { base } from '@reown/appkit/networks';
import { QueryClient } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Get projectId from https://cloud.reown.com
// You MUST create a project at https://cloud.reown.com and add your domain
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Setup queryClient
export const queryClient = new QueryClient();

// Metadata for WalletConnect
const metadata = {
  name: 'BaseGenesis',
  description: 'Discover your Base blockchain genesis rank',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://basegenesis.vercel.app',
  icons: ['https://basegenesis.vercel.app/logo.jpg']
};

// Create Wagmi Adapter with Base chain only
export const wagmiAdapter = new WagmiAdapter({
  networks: [base],
  projectId: projectId,
  ssr: false,
});

// Create the AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [base],
  projectId,
  metadata,
  features: {
    analytics: false,
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

export const wagmiConfig = wagmiAdapter.wagmiConfig;
