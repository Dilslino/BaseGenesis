// DISABLED: Reown AppKit removed to simplify build
// This file is only used by legacy Vite files (index.tsx.vite, App.tsx.vite)
// Current Next.js app uses app/config.tsx for wagmi setup

import { QueryClient } from '@tanstack/react-query';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';
export const queryClient = new QueryClient();

// Stub exports for legacy compatibility
export const wagmiAdapter = null;
export const wagmiConfig = null;
