import App, { AppContext, AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { TOAST_TIMEOUT } from '@/lib/constants';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { DefaultSeo } from 'next-seo';
import SEO from '../seo.config';
import AppWalletProvider from '@/components/provider/wallet';
import dotenv from 'dotenv';

import '@/style/globals.css';
import 'react-toastify/dist/ReactToastify.css';

dotenv.config();

interface CustomAppProps extends AppProps {
  solanaNetwork: string;
}

function MyApp({ Component, pageProps, solanaNetwork }: CustomAppProps) {
  return (
    <AppWalletProvider network={solanaNetwork as WalletAdapterNetwork}>
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
      <Component {...pageProps} />
    </AppWalletProvider>
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
