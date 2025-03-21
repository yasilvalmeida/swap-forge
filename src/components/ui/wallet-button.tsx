'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { copyToClipboard } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import { Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from './button';
import { Input } from './input';
import { getWallet } from '@/lib/utils/wallet';
import { REFERRAL_LINK } from '@/lib/constants';
import { AffiliateProgramResume } from '@/components/layout/affiliate-program';
/* import { isMobile } from 'react-device-detect'; */

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

  const [open, setOpen] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>();

  const onGetReferalCode = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    getBalance();
    getReferralCode();
    return () => {};

    async function getBalance() {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.log('error', error);
          toast.error('Insufficient Balance!');
        }
      }
    }
    async function getReferralCode() {
      if (publicKey) {
        const wallet = await getWallet(publicKey.toBase58());
        setReferralCode(wallet?.referralCode);
      }
    }
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
              My balance {balance ?? 0} SOL
            </MenubarItem>
            {referralCode && (
              <MenubarItem
                onClick={onGetReferalCode}
                className='cursor-pointer text-gray-900'
              >
                Get Referal Code
              </MenubarItem>
            )}
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className='fixed inset-0 bg-black/50' />
          <DialogContent className='fixed left-[50%] top-[50%] w-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-900 p-6 shadow-lg'>
            <DialogHeader>
              <DialogTitle className='text-gray-300'>Referral Code</DialogTitle>
              <DialogDescription className='text-gray-300'>
                Get Your Referral Code
              </DialogDescription>
            </DialogHeader>
            <div className='mt-4 flex items-center space-x-2'>
              <div className='grid flex-1 gap-2'>
                <Label htmlFor='token' className='sr-only'>
                  Token
                </Label>
                <Input id='token' defaultValue={referralCode} readOnly />
              </div>
              {referralCode && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(`${REFERRAL_LINK}/${referralCode}`);
                    toast.success('Referal Code copied!');
                  }}
                  size='sm'
                  className='cursor-pointer px-3'
                >
                  <span className='sr-only'>Copy</span>
                  <Copy />
                </Button>
              )}
            </div>

            <AffiliateProgramResume />

            <DialogFooter>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
                className='cursor-pointer'
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  ) : (
    <>
      <WalletMultiButton />
    </>
  );
};

export default WalletButton;
