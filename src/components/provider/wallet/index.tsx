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
  network: WalletAdapterNetwork;
  children: React.ReactNode;
}

export default function AppWalletProvider({
  network,
  children,
}: AppWalletProviderProps) {
  const endpoint = useMemo(() => {
    if (!network) {
      toast.error('Network not found. Defaulting to Devnet.');
      return clusterApiUrl(WalletAdapterNetwork.Devnet);
    }
    return clusterApiUrl(network);
  }, [network]);

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
    try {
      if (walletError?.message?.includes('User rejected the request')) {
        toast.error('You rejected the wallet connection. Please try again.');
      } else {
        toast.error(walletError?.message || 'An unknown error occurred.');
      }
    } catch (error) {
      console.error('Error in onError callback:', error);
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

/* new UnsafeBurnerWalletAdapter(), */
/* new WalletConnectWalletAdapter({
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
  }), */
