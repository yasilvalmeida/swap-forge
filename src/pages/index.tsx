import dynamic from 'next/dynamic';
import Link from 'next/link';

const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

export default function Home() {
  return (
    <div className='min-h-screen text-white bg-gray-900'>
      <Header isLanding={true} />

      <section id='features' className='px-4 py-20'>
        <h2 className='mb-12 text-3xl font-bold text-center'>Features</h2>
        <div className='grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-3'>
          {/* Feature 1 */}
          <div className='flex flex-col justify-between p-6 bg-gray-800 rounded-lg shadow-lg h-52'>
            <h3 className='mb-4 text-2xl font-semibold'>Token Creation</h3>
            <p className='text-gray-300'>
              Easily create tokens with customizable metadata and parameters
              with small fee.
            </p>
            <Link
              href='/create-token'
              className='w-auto px-6 py-3 font-semibold text-center text-gray-900 transition duration-300 bg-yellow-400 rounded-lg hover:bg-yellow-500'
            >
              Create Token
            </Link>
          </div>

          {/* Feature 2 */}
          <div className='flex flex-col justify-between p-6 bg-gray-800 rounded-lg shadow-lg h-52'>
            <h3 className='mb-4 text-2xl font-semibold'>Liquidity Pools</h3>
            <p className='text-gray-300'>
              Create and manage liquidity pools for seamless token trading.
            </p>
            <Link
              href='/liquidity'
              className='w-auto px-6 py-3 font-semibold text-center text-gray-900 transition duration-300 bg-yellow-400 rounded-lg hover:bg-yellow-500'
            >
              Liquidity Pools
            </Link>
          </div>

          {/* Feature 3 */}
          <div className='flex flex-col justify-between p-6 bg-gray-800 rounded-lg shadow-lg h-52'>
            <h3 className='mb-4 text-2xl font-semibold'>Token Swapping</h3>
            <p className='text-gray-300'>
              Swap tokens instantly with low fees and high-speed transactions.
            </p>
            <a
              href='#'
              className='w-auto px-6 py-3 font-semibold text-center text-gray-900 transition duration-300 bg-yellow-400 rounded-lg hover:bg-yellow-500'
            >
              Comming soon
            </a>
          </div>
        </div>
      </section>

      <section className='px-4 py-20'>
        <h2 className='mb-12 text-3xl font-bold text-center'>
          Why Choose SwapForge?
        </h2>
        <div className='grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-3'>
          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>
              1. User-Friendly Interface
            </h3>
            <p className='text-gray-300'>
              SwapForge provides an intuitive and easy-to-use interface, making
              token creation accessible to both technical and non-technical
              users. No coding skills are required to create and manage tokens.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>2. Built on Solana</h3>
            <p className='text-gray-300'>
              SwapForge leverages the Solana blockchain, known for its
              high-speed transactions and low fees. Enjoy fast and
              cost-effective token creation and management.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>
              3. Comprehensive Token Creation
            </h3>
            <p className='text-gray-300'>
              Create SPL tokens with customizable parameters such as name,
              symbol, supply, and decimals. Add rich metadata (e.g., logo,
              description, and external links) to your tokens.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>4. Advanced Metadata</h3>
            <p className='text-gray-300'>
              Store metadata on decentralized storage solutions like IPFS or
              Arweave for immutability and security. Easily update or revoke
              metadata as needed.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>
              5. Secure and Trustworthy
            </h3>
            <p className='text-gray-300'>
              Built with security in mind, SwapForge ensures that your tokens
              and metadata are safe and tamper-proof. Use revoke functions to
              disable minting, freezing, or updating metadata.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>6. Cost-Effective</h3>
            <p className='text-gray-300'>
              With Solana’s low transaction fees, creating and managing tokens
              on SwapForge is affordable for everyone. No hidden costs or
              subscription fees.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>7. Future-Proof</h3>
            <p className='text-gray-300'>
              SwapForge is continuously evolving, with plans to add features
              like decentralized governance, staking, and NFT support. Stay
              ahead of the curve with a platform designed for the future of
              decentralized finance.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>
              8. Liquidity and Swapping
            </h3>
            <p className='text-gray-300'>
              SwapForge allows you to create liquidity pools for your tokens,
              enabling seamless trading. Integrated with Raydium and Serum for
              decentralized swapping and liquidity provision.
            </p>
          </div>

          <div className='flex flex-col justify-start p-6 bg-gray-800 rounded-lg shadow-lg h-58'>
            <h3 className='mb-4 text-xl font-semibold'>
              9. Cross-Chain Compatibility
            </h3>
            <p className='text-gray-300'>
              SwapForge plans to integrate cross-chain compatibility using
              Wormhole, allowing tokens to move across multiple blockchains.
            </p>
          </div>
        </div>
      </section>

      <section className='px-4 py-20 bg-gray-800'>
        <div className='max-w-6xl mx-auto text-center'>
          <h2 className='mb-8 text-3xl font-bold'>Our Mission & Vision</h2>
          <p className='mb-6 text-gray-300'>
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

      <section className='px-4 py-20 bg-gradient-to-r from-purple-800 to-indigo-900'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='mb-8 text-3xl font-bold'>Ready to Get Started?</h2>
          <p className='mb-8 text-xl'>
            Join SwapForge today and unlock the full potential of token creation
            and liquidity management.
          </p>
          <Link
            href='/create-token'
            className='px-6 py-3 font-semibold text-gray-900 transition duration-300 bg-yellow-400 rounded-lg hover:bg-yellow-500'
          >
            Launch SwapForge
          </Link>
        </div>
      </section>

      <section className='px-4 py-20 bg-gradient-to-r from-purple-800 to-indigo-900'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='mb-8 text-3xl font-bold'>Community and Ecosystem?</h2>
          <p className='mb-8 text-xl'>
            Join a growing community of developers, creators, and traders on
            SwapForge.
          </p>
          <Link
            href='https://x.com/SwapForgeApp'
            className='px-6 py-3 font-semibold text-gray-900 transition duration-300 bg-yellow-400 rounded-lg hover:bg-yellow-500'
            target='_blank'
          >
            Join Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
