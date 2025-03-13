import '@/style/globals.css';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { TOAST_TIMEOUT } from '@/lib/constants';

import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <WalletProvider
      wallets={wallets}
      localStorageKey={'swap-forge'}
      autoConnect
    >
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
      <WalletModalProvider>
        <Component {...pageProps} />
      </WalletModalProvider>
    </WalletProvider>
  );
}
