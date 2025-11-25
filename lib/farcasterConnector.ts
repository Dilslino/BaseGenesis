import sdk from '@farcaster/frame-sdk';
import { createConnector } from 'wagmi';
import { base } from 'wagmi/chains';

export function farcasterFrame() {
  let connected = false;
  let account: string | undefined;

  return createConnector((config) => ({
    id: 'farcaster-frame',
    name: 'Farcaster Frame',
    type: 'farcaster-frame' as const,

    async connect() {
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      account = accounts[0];
      connected = true;
      
      return {
        accounts: accounts as `0x${string}`[],
        chainId: base.id,
      };
    },

    async disconnect() {
      connected = false;
      account = undefined;
    },

    async getAccounts() {
      if (!account) return [];
      return [account as `0x${string}`];
    },

    async getChainId() {
      return base.id;
    },

    async getProvider() {
      return sdk.wallet.ethProvider;
    },

    async isAuthorized() {
      if (!connected || !account) return false;
      return true;
    },

    onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        this.onDisconnect();
      } else {
        account = accounts[0];
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] });
      }
    },

    onChainChanged(chainId: string) {
      config.emitter.emit('change', { chainId: parseInt(chainId) });
    },

    onDisconnect() {
      connected = false;
      account = undefined;
      config.emitter.emit('disconnect');
    },

    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return base;
    },
  }));
}
