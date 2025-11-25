import { createConfig, http } from 'wagmi'
import { base } from 'viem/chains'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { walletConnect } from 'wagmi/connectors'

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '3a817781d83d47c06788229b4e4325e6'

const metadata = {
  name: 'BaseGenesis',
  description: 'Discover your on-chain origins on Base',
  url: 'https://basegenesis.app', 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false })
  ]
})

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  themeVariables: {
    '--w3m-accent': '#0052FF',
    '--w3m-border-radius-master': '1px',
    '--w3m-font-family': 'Inter, sans-serif'
  }
})