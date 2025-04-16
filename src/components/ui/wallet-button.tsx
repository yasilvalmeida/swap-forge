'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import Link from 'next/link';
import { useWalletInfo } from '../hook';


const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const WalletButton = () => {
  const { connected, publicKey, disconnect } = useWallet();

  const { createdTokens, createdLiquidityPools, createdSwaps, balance } = useWalletInfo();

  return connected ? (
    <>
      <Menubar className='w-full text-gray-900'>
        <MenubarMenu>
          <MenubarTrigger className='text-gray-900'>
            <span className='cursor-pointer text-gray-900'>
              {`Connected: ${publicKey?.toBase58().slice(0, 6)}...`}
            </span>
          </MenubarTrigger>
          <MenubarContent className='cursor-pointer text-gray-900'>
            <MenubarItem className='cursor-pointer text-gray-900'>
              <Link
                href='/dashboard'
              >
                Dashboard
              </Link>
            </MenubarItem>
            <MenubarItem className='cursor-pointer text-gray-900'>
              Balance {balance} SOL
            </MenubarItem>
            {createdTokens?.length > 0 && <MenubarItem className='cursor-pointer text-gray-900'>
              Tokens {createdTokens?.length} created
            </MenubarItem>}
            {createdLiquidityPools?.length > 0 && <MenubarItem className='cursor-pointer text-gray-900'>
              Liquidity Pools {createdLiquidityPools?.length} created
            </MenubarItem>}
            {createdSwaps?.length > 0 && <MenubarItem className='cursor-pointer text-gray-900'>
              Transactions {createdSwaps?.length} created
            </MenubarItem>}
            <MenubarSeparator />
            <MenubarItem
              onClick={disconnect}
              className='cursor-pointer text-gray-900'
            >
              Disconnect
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </>
  ) : (
    <>
      <WalletMultiButton />
    </>
  );
};

export default WalletButton;
