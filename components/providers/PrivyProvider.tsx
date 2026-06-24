'use client';
import { PrivyProvider } from '@privy-io/react-auth';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clpispdty00ycl80fpueukbhl'}
      config={{
        loginMethods: ['google', 'apple', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#7c3aed',
          logo: 'https://chadwallet.xyz/logo.png',
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          solana: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
