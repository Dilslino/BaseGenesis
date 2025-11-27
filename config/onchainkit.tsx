import { OnchainKitProvider } from '@coinbase/onchainkit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <OnchainKitProvider
      apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: 'dark',
          theme: 'default',
          name: 'BaseGenesis',
          logo: '/logo.jpg',
        },
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}
