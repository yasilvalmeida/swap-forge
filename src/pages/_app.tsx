import '@/style/globals.css';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useCallback, useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { TOAST_TIMEOUT } from '@/lib/constants';
import dotenv from 'dotenv';

dotenv.config();

import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet; // WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const onError = useCallback((walletError: Error) => {
    try {
      console.log('walletError', walletError);
    } catch (error) {
      console.log('Connection-provider', error);
    }
  }, []);

  return (
    <>
      <ToastContainer
        position='top-right'
        autoClose={TOAST_TIMEOUT}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <ToastContainer />
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider
          wallets={wallets}
          localStorageKey={'swap-forge'}
          autoConnect={true}
          onError={onError}
        >
          <Component {...pageProps} />
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
