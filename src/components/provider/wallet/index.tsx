'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { toast } from 'react-toastify';
import dotenv from 'dotenv';

dotenv.config();

import '@solana/wallet-adapter-react-ui/styles.css';

interface AppWalletProviderProps {
  children: React.ReactNode;
}

export default function AppWalletProvider({
  children,
}: AppWalletProviderProps) {
  const endpoint = useMemo(
    () =>
      process.env.SOLANA_ENDPOINT ||
      'https://damp-muddy-isle.solana-mainnet.quiknode.pro/6f3f143081a2ab0946f82437bb7a3b050e7f36c1/',
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
