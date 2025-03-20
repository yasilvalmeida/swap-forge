'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { toast } from 'react-toastify';
import '@solana/wallet-adapter-react-ui/styles.css';

interface AppWalletProviderProps {
  network: WalletAdapterNetwork;
  children: React.ReactNode;
}

export default function AppWalletProvider({
  network,
  children,
}: AppWalletProviderProps) {
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], []);

  const onError = useCallback((walletError: Error) => {
    try {
      if (walletError.message.includes('User rejected the request')) {
        toast.error('You rejected the wallet connection. Please try again.');
      } else {
        toast.error(walletError.message);
      }
    } catch (error) {
      console.log('Connection-provider', error);
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
