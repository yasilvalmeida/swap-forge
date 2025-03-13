import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import WalletButton from '@/components/web3/wallet';

const Navbar = dynamic(() => import('@/layout/navbar'), {});
const Header = dynamic(() => import('@/layout/header'), {});
const Footer = dynamic(() => import('@/layout/footer'), {});

export default function CreateTokenPage() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');
  const [totalFee, setTotalFee] = useState('0.0');

  const handleCreateToken = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet.');
      return;
    }

    // Add your token creation logic here
    alert(
      `Creating token: ${tokenName} (${tokenSymbol}) with supply ${tokenSupply}`
    );
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header
        isLanding={false}
        title='Create Your Token'
        subtitle='Easily create and manage tokens on the Solana blockchain.'
      />

      <Navbar />

      {/* Wallet Connection Button */}
      <div className='fixed top-4 right-4'>
        <WalletButton />
      </div>

      {/* Token Creation Form */}
      <div className='max-w-4xl mx-auto py-20 px-4 flex flex-row gap-6'>
        <div className='w-full flex flex-col'>
          <h1 className='text-4xl font-bold mb-8 text-center'>
            Create Your Token
          </h1>
          <form
            onSubmit={(e) => e.preventDefault()}
            className='border-1 border-gray-500 p-2 rounded'
          >
            {/* Token Name */}
            <div className='mb-6'>
              <label
                htmlFor='tokenName'
                className='block text-lg font-medium mb-2'
              >
                Token Name
              </label>
              <input
                type='text'
                id='tokenName'
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className='w-full p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                placeholder='Enter token name'
                required
              />
            </div>

            {/* Token Symbol */}
            <div className='mb-6'>
              <label
                htmlFor='tokenSymbol'
                className='block text-lg font-medium mb-2'
              >
                Token Symbol
              </label>
              <input
                type='text'
                id='tokenSymbol'
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className='w-full p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                placeholder='Enter token symbol'
                required
              />
            </div>

            {/* Token Supply */}
            <div className='mb-6'>
              <label
                htmlFor='tokenSupply'
                className='block text-lg font-medium mb-2'
              >
                Token Supply
              </label>
              <input
                type='number'
                id='tokenSupply'
                value={tokenSupply}
                onChange={(e) => setTokenSupply(e.target.value)}
                className='w-full p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400'
                placeholder='Enter token supply'
                required
              />
            </div>

            <Button
              onClick={handleCreateToken}
              variant={'secondary'}
              className='w-full px-6 py-3 rounded-lg font-semibold  transition duration-300 cursor-pointer'
            >
              Create Token
            </Button>
          </form>
          <span className='italic mt-3 text-xs text-center text-yellow-400'>
            The cost of Token creation is {totalFee} SOL, covering all fees!.
          </span>
        </div>
        <div className='w-full flex flex-col gap-3'>
          <h2 className='text-4xl font-bold mb-5 text-center'>How to use?</h2>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 1</span>
            <span>Connect your Solana wallet</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 2</span>
            <span>Specify the desired name for your Token</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 3</span>
            <span>Indicate the symbol</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 4</span>
            <span>Select the decimals quantity</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 5</span>
            <span>Provide a brief description</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 6</span>
            <span>Upload the image for your token</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 7</span>
            <span>Determine the Supply of your Token</span>
          </div>
          <div className='border-1 border-gray-500 p-2 rounded flex flex-row gap-2'>
            <span>Step 8</span>
            <span>
              Click on create, accept the transaction and wait until your tokens
              ready.
            </span>
          </div>
        </div>
      </div>

      <section className='py-20 px-4 bg-gray-800'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl font-bold mb-8'>FAQ</h2>
          <Accordion
            type='single'
            collapsible
            className='w-full cursor-pointer'
          >
            <AccordionItem value='item-1'>
              <AccordionTrigger>What is SwapForge?</AccordionTrigger>
              <AccordionContent>
                SwapForge is a decentralized application (dApp) built on the
                Solana blockchain that allows users to create, manage, and trade
                tokens with ease.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger>Is SwapForge secure?</AccordionTrigger>
              <AccordionContent>
                Yes, SwapForge leverages the security and transparency of the
                Solana blockchain. All transactions are immutable and verifiable
                on the blockchain.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-1'>
              <AccordionTrigger>
                What wallets can I use to create and mint SPL tokens?
              </AccordionTrigger>
              <AccordionContent>
                You can use any popular solana wallets, such as Phantom,
                Solflare, etc.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-3'>
              <AccordionTrigger>How do I create a token?</AccordionTrigger>
              <AccordionContent>
                Simply connect your wallet, fill out the token creation form,
                and click Create Token. Your token will be deployed on the
                Solana blockchain.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-4'>
              <AccordionTrigger>
                Can I add metadata to my token?
              </AccordionTrigger>
              <AccordionContent>
                Yes, SwapForge allows you to add rich metadata (e.g., name,
                symbol, logo, description) to your token. Metadata is stored on
                decentralized storage like IPFS.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-5'>
              <AccordionTrigger>What are the fees?</AccordionTrigger>
              <AccordionContent>
                SwapForge uses Solana&apos;s low transaction fees, making token
                creation and management affordable for everyone. There are no
                hidden costs.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-6'>
              <AccordionTrigger>
                Can I revoke token permissions?
              </AccordionTrigger>
              <AccordionContent>
                Yes, SwapForge allows you to revoke mint, freeze, and update
                permissions for your token, ensuring full control over your
                creation.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
}
