import { AppProps } from 'next/app';
import { ToastContainer } from 'react-toastify';
import { GA_TRACKING_ID, TOAST_TIMEOUT } from '@/libs/constants';
import { GoogleAnalytics } from '@next/third-parties/google';
import { DefaultSeo } from 'next-seo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppAnchorWalletProvider } from '@/components/provider/anchor';
import SEO from '../seo.config';
import ErrorBoundary from '@/components/layout/error-bondary';
import dotenv from 'dotenv';

import '@/style/globals.css';
import 'react-toastify/dist/ReactToastify.css';


dotenv.config();

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary>
      <AppAnchorWalletProvider>
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
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </AppAnchorWalletProvider>
    </ErrorBoundary>
  );
}

/* MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  return {
    ...appProps,
    solanaNetwork: process.env.SOLANA_NETWORK || 'devnet',
  };
}; */

export default MyApp;
