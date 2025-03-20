import { GA_TRACKING_ID } from '@/lib/constants';
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang='en'>
      <Head
        title='SwapForge - Token Creation & Liquidity Platform'
        aria-description='SwapForge: The ultimate Solana dApp for token creation, swapping, and liquidity management.'
      >
        <meta
          name='description'
          content='SwapForge: The ultimate Solana dApp for token creation, swapping, and liquidity management.'
        />
        <link rel='icon' href='/favicon.ico' />
        {/* enable analytics script only for production */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy='afterInteractive'
        />
        <Script id='google-analytics' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${GA_TRACKING_ID});
          `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
