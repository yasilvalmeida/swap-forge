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
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
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
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || clusterApiUrl(network),
    [network]
  );

  const wallets = useMemo(() => {
    const walletConnect = new WalletConnectWalletAdapter({
      network,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // Get one from WalletConnect Cloud
        metadata: {
          name: 'SwapForge',
          description: 'The ultimate Solana dApp for token creation, swapping, and liquidity management.',
          url: 'https://swapforge.app/',
          icons: ['https://swapforge.app/images/swap-forge.png'],
        },
      },
    });

    return [
      walletConnect, // WalletConnect first (optional)
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new MathWalletAdapter(),
      new TrustWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ];
  }, [network]);

  const onError = useCallback((error: Error) => {
  if (
    error?.message?.includes("User rejected the request") ||
    error?.message?.includes("Request rejected")
  ) {
    toast.error("You cancelled the action.");
  } else {
    console.error("Wallet error:", error);
    toast.error(error?.message || "Transaction failed.");
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