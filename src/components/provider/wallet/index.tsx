'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
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
  const wallets = useMemo(
    () => [
      new WalletConnectWalletAdapter({
        network:
          network === WalletAdapterNetwork.Mainnet
            ? WalletAdapterNetwork.Mainnet
            : WalletAdapterNetwork.Devnet,
        options: {
          relayUrl: 'wss://relay.walletconnect.com',
          projectId: 'f15b1bda12f769a60d545bcb7b4c40fe',
          metadata: {
            name: 'Swapforge App',
            description: 'A Solana app using WalletConnect',
            url: 'https://swapforge.app/',
            icons: ['https://swapforge.app/swap-forge.png'],
          },
        },
      }),
    ],
    [network]
  );

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
