import { Html, Head, Main, NextScript } from 'next/document';

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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
