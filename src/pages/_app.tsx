import App, { AppContext, AppProps } from 'next/app';
import { useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import { GA_TRACKING_ID, TOAST_TIMEOUT } from '@/lib/constants';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { GoogleAnalytics } from '@next/third-parties/google';
import { DefaultSeo } from 'next-seo';
import SEO from '../seo.config';
import AppWalletProvider from '@/components/provider/wallet';
import ErrorBoundary from '@/components/layout/error-bondary';
import dotenv from 'dotenv';

import '@/style/globals.css';
import 'react-toastify/dist/ReactToastify.css';
/* import { useWallet } from '@solana/wallet-adapter-react'; */

dotenv.config();

interface CustomAppProps extends AppProps {
  solanaNetwork: string;
}

function MyApp({ Component, pageProps, solanaNetwork }: CustomAppProps) {
  const network = useMemo(() => {
    return solanaNetwork as WalletAdapterNetwork;
  }, [solanaNetwork]);

  return (
    <ErrorBoundary>
      <AppWalletProvider network={network}>
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
        <DefaultSeo {...SEO} />
        <GoogleAnalytics gaId={GA_TRACKING_ID} />
        <Component {...pageProps} />
      </AppWalletProvider>
    </ErrorBoundary>
  );
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  return {
    ...appProps,
    solanaNetwork: process.env.SOLANA_NETWORK || 'devnet',
  };
};

export default MyApp;
