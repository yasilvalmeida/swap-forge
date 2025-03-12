// pages/index.js
import Head from 'next/head';

export default function Home() {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Head>
        <title>SwapForge - Token Creation & Liquidity Platform</title>
        <meta
          name='description'
          content='SwapForge: The ultimate Solana dApp for token creation, swapping, and liquidity management.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      {/* Hero Section */}
      <section className='text-center py-20 bg-gradient-to-r from-purple-800 to-indigo-900'>
        <h1 className='text-5xl font-bold mb-4'>
          Welcome to <span className='text-yellow-400'>SwapForge</span>
        </h1>
        <p className='text-xl mb-8'>
          The ultimate Solana dApp for token creation, swapping, and liquidity
          management.
        </p>
        <a
          href='#features'
          className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300'
        >
          Explore Features
        </a>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 px-4'>
        <h2 className='text-3xl font-bold text-center mb-12'>Features</h2>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Feature 1 */}
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h3 className='text-2xl font-semibold mb-4'>Token Creation</h3>
            <p className='text-gray-300'>
              Easily create SPL tokens with customizable metadata and
              parameters.
            </p>
          </div>

          {/* Feature 2 */}
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h3 className='text-2xl font-semibold mb-4'>Liquidity Pools</h3>
            <p className='text-gray-300'>
              Create and manage liquidity pools for seamless token trading.
            </p>
          </div>

          {/* Feature 3 */}
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
            <h3 className='text-2xl font-semibold mb-4'>Token Swapping</h3>
            <p className='text-gray-300'>
              Swap tokens instantly with low fees and high-speed transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className='py-20 px-4 bg-gray-800'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-8'>Our Mission & Vision</h2>
          <p className='text-gray-300 mb-6'>
            <span className='font-semibold text-yellow-400'>Mission:</span>{' '}
            Empower creators, developers, and traders to seamlessly create,
            manage, and trade tokens on the Solana blockchain.
          </p>
          <p className='text-gray-300'>
            <span className='font-semibold text-yellow-400'>Vision:</span> To
            become the leading decentralized platform for token creation,
            management, and trading, revolutionizing the way individuals and
            businesses interact with digital assets.
          </p>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className='py-20 px-4 bg-gradient-to-r from-purple-800 to-indigo-900'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-8'>Ready to Get Started?</h2>
          <p className='text-xl mb-8'>
            Join SwapForge today and unlock the full potential of token creation
            and liquidity management.
          </p>
          <a
            href='#'
            className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300'
          >
            Launch SwapForge
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-6 text-center bg-gray-800'>
        <p className='text-gray-300'>
          &copy; {new Date().getFullYear()} SwapForge. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
