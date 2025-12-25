'use client'
'use client'
import React, { type ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { config, projectId, wagmiAdapter } from './config'
import { base } from '@reown/appkit/networks'

const queryClient = new QueryClient()

const metadata = {
  name: 'BaseGenesis',
  description: 'Discover your on-chain origins on Base',
  url: 'https://basegenesis.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

createAppKit({
  adapters: [wagmiAdapter] as any,
  projectId,
  networks: [base] as any,
  defaultNetwork: base,
  metadata,
  features: {
    analytics: true
  },
  themeVariables: {
    '--w3m-accent': '#0052FF',
    '--w3m-border-radius-master': '1px',
    '--w3m-font-family': 'Inter, sans-serif'
  }
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}