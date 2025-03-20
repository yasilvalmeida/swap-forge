// seo.config.ts
import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
  title: 'SwapForge - Create Solana Tokens Easily',
  description:
    'SwapForge is the ultimate Solana dApp for token creation. Create Solana tokens in seconds with no coding required. Join our affiliate program today!',
  openGraph: {
    type: 'website',
    url: 'https://swapforge.app/create-token',
    title: 'SwapForge - Create Solana Tokens Easily',
    description:
      'SwapForge is the ultimate Solana dApp for token creation. Create Solana tokens in seconds with no coding required. Join our affiliate program today!',
    images: [
      {
        url: 'https://swapforge.app/swap-forge.png',
        width: 1200,
        height: 630,
        alt: 'SwapForge - Create Solana Tokens Easily',
      },
    ],
    siteName: 'SwapForge',
  },
  twitter: {
    handle: '@SwapForgeApp',
    site: '@SwapForgeApp',
    cardType: 'summary_large_image',
  },
};

export default SEO;
