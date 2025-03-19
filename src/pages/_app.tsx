import '@/style/globals.css';
import type { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { TOAST_TIMEOUT } from '@/lib/constants';
import AppWalletProvider from '@/components/provider/wallet';
import dotenv from 'dotenv';

import 'react-toastify/dist/ReactToastify.css';

dotenv.config();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWalletProvider>
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
      <Component {...pageProps} />
    </AppWalletProvider>
  );
}
