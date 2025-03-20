import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import SupportLink from '@/components/layout/support-link';
import {
  HelpCircle,
  Shield,
  Image as ImageIcon,
  FileText,
  Settings,
  PlusCircle,
  Wallet,
  Share2,
  UserCircle,
} from 'lucide-react';
import { AffiliateProgram } from '@/components/layout/affiliate-program';

const FrequentAnswersAndQuestions = () => {
  return (
    <section className='bg-gray-800 px-4 py-20'>
      <div className='mx-auto max-w-6xl'>
        <h2 className='mb-8 text-3xl font-bold'>FAQ</h2>
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='item-1'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <HelpCircle className='mr-2 h-5 w-5' /> What is SwapForge?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                SwapForge is a decentralized application (dApp) built on the
                Solana blockchain that allows users to create, manage, and trade
                tokens with ease.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <Shield className='mr-2 h-5 w-5' /> Is SwapForge secure?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                Yes, SwapForge leverages the security and transparency of the
                Solana blockchain. All transactions are immutable and verifiable
                on the blockchain.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-3'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <Wallet className='mr-2 h-5 w-5' />
                What wallets can I use to create and mint SPL tokens?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                You can use any popular solana wallets, such as Phantom,
                Solflare, etc.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-4'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <PlusCircle className='mr-2 h-5 w-5' /> How do I create a token?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                Simply connect your wallet, fill out the token creation form,
                and click Create Token. Your token will be deployed on the
                Solana blockchain.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-5'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <ImageIcon className='mr-2 h-5 w-5' />
                Can I add metadata to my token?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                Yes, SwapForge allows you to add rich metadata (e.g., name,
                symbol, logo, description, and socials) to your token.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-6'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <FileText className='mr-2 h-5 w-5' /> What are the fees?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                SwapForge uses Solana&apos;s low transaction fees, making token
                creation and management affordable for everyone. There are no
                hidden costs.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-7'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <Settings className='mr-2 h-5 w-5' /> Can I revoke token
                permissions?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
                Yes, SwapForge allows you to revoke mint, freeze, and update
                permissions for your token, ensuring full control over your
                creation.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-8'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <Share2 className='mr-2 h-5 w-5' />
                How Our Affiliate Program Works?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <AffiliateProgram />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-9'>
            <AccordionTrigger>
              <span className='flex cursor-pointer'>
                <UserCircle className='mr-2 h-5 w-5' /> How can you contact us?
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <SupportLink />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FrequentAnswersAndQuestions;
