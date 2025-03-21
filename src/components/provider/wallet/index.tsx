'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { toast } from 'react-toastify';
import '@solana/wallet-adapter-react-ui/styles.css';

interface AppWalletProviderProps {
  children: React.ReactNode;
}

export default function AppWalletProvider({
  children,
}: AppWalletProviderProps) {
  const endpoint = useMemo(
    () => clusterApiUrl(WalletAdapterNetwork.Devnet),
    []
  );

  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new MathWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ];
  }, []);

  const onError = useCallback((walletError: Error) => {
    console.log('walletError', walletError);
    if (walletError?.message?.includes('User rejected the request')) {
      toast.error('You rejected the wallet connection. Please try again.');
    } else {
      toast.error(walletError?.message || 'An unknown error occurred.');
    }
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        localStorageKey='swapforge'
        onError={onError}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
