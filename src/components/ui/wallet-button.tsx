'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const WalletButton = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const { connection } = useConnection();

  const balance = useMemo(async () => {
    if (publicKey) {
      try {
        const walletBalance = await connection.getBalance(publicKey);
        return walletBalance / LAMPORTS_PER_SOL;
      } catch (error) {
        console.log('balance', error);
        console.log('connection', connection);
        return 0;
      }
    }
    return 0;
  }, [connection, publicKey]);

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
              My balance {balance} SOL
            </MenubarItem>
            {/* <MenubarItem
              onClick={onGetReferalCode}
              className='cursor-pointer text-gray-900'
            >
              Get Referal Code
            </MenubarItem> */}
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
