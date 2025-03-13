import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/layout/header'), {});
const Footer = dynamic(() => import('@/layout/footer'), {});

export default function Home() {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header isLanding={true} />

      <section id='features' className='py-20 px-4'>
        <h2 className='text-3xl font-bold text-center mb-12'>Features</h2>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Feature 1 */}
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-52 flex flex-col justify-between'>
            <h3 className='text-2xl font-semibold mb-4'>Token Creation</h3>
            <p className='text-gray-300'>
              Easily create tokens with customizable metadata and parameters
              with small fee.
            </p>
            <a
              href='/create-token'
              className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300 w-auto text-center'
            >
              Create Token
            </a>
          </div>

          {/* Feature 2 */}
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-52 flex flex-col justify-between'>
            <h3 className='text-2xl font-semibold mb-4'>Liquidity Pools</h3>
            <p className='text-gray-300'>
              Create and manage liquidity pools for seamless token trading.
            </p>
            <a
              href='#'
              className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300 w-auto text-center'
            >
              Comming soon
            </a>
          </div>

          {/* Feature 3 */}
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-52 flex flex-col justify-between'>
            <h3 className='text-2xl font-semibold mb-4'>Token Swapping</h3>
            <p className='text-gray-300'>
              Swap tokens instantly with low fees and high-speed transactions.
            </p>
            <a
              href='#'
              className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300 w-auto text-center'
            >
              Comming soon
            </a>
          </div>
        </div>
      </section>

      <section className='py-20 px-4'>
        <h2 className='text-3xl font-bold text-center mb-12'>
          Why Choose SwapForge?
        </h2>
        <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>
              1. User-Friendly Interface
            </h3>
            <p className='text-gray-300'>
              SwapForge provides an intuitive and easy-to-use interface, making
              token creation accessible to both technical and non-technical
              users. No coding skills are required to create and manage tokens.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>2. Built on Solana</h3>
            <p className='text-gray-300'>
              SwapForge leverages the Solana blockchain, known for its
              high-speed transactions and low fees. Enjoy fast and
              cost-effective token creation and management.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>
              3. Comprehensive Token Creation
            </h3>
            <p className='text-gray-300'>
              Create SPL tokens with customizable parameters such as name,
              symbol, supply, and decimals. Add rich metadata (e.g., logo,
              description, and external links) to your tokens.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>4. Advanced Metadata</h3>
            <p className='text-gray-300'>
              Store metadata on decentralized storage solutions like IPFS or
              Arweave for immutability and security. Easily update or revoke
              metadata as needed.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>
              5. Secure and Trustworthy
            </h3>
            <p className='text-gray-300'>
              Built with security in mind, SwapForge ensures that your tokens
              and metadata are safe and tamper-proof. Use revoke functions to
              disable minting, freezing, or updating metadata.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>6. Cost-Effective</h3>
            <p className='text-gray-300'>
              With Solana’s low transaction fees, creating and managing tokens
              on SwapForge is affordable for everyone. No hidden costs or
              subscription fees.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>7. Future-Proof</h3>
            <p className='text-gray-300'>
              SwapForge is continuously evolving, with plans to add features
              like decentralized governance, staking, and NFT support. Stay
              ahead of the curve with a platform designed for the future of
              decentralized finance.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>
              8. Liquidity and Swapping
            </h3>
            <p className='text-gray-300'>
              SwapForge allows you to create liquidity pools for your tokens,
              enabling seamless trading. Integrated with Raydium and Serum for
              decentralized swapping and liquidity provision.
            </p>
          </div>

          <div className='bg-gray-800 p-6 rounded-lg shadow-lg h-58 flex flex-col justify-start'>
            <h3 className='text-xl font-semibold mb-4'>
              9. Cross-Chain Compatibility
            </h3>
            <p className='text-gray-300'>
              SwapForge plans to integrate cross-chain compatibility using
              Wormhole, allowing tokens to move across multiple blockchains.
            </p>
          </div>
        </div>
      </section>

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

      <section className='py-20 px-4 bg-gradient-to-r from-purple-800 to-indigo-900'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-8'>Ready to Get Started?</h2>
          <p className='text-xl mb-8'>
            Join SwapForge today and unlock the full potential of token creation
            and liquidity management.
          </p>
          <a
            href='/create-token'
            className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300'
          >
            Launch SwapForge
          </a>
        </div>
      </section>

      <section className='py-20 px-4 bg-gradient-to-r from-purple-800 to-indigo-900'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-8'>Community and Ecosystem?</h2>
          <p className='text-xl mb-8'>
            Join a growing community of developers, creators, and traders on
            SwapForge. Access resources, tutorials, and support to help you
            succeed.
          </p>
          <a
            href='#'
            className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300'
          >
            Join Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
