import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { DialogDescription } from '@radix-ui/react-dialog';
import { WalletName } from '@solana/wallet-adapter-base';
import useConnection from '@/hook/token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface IProps {
  network: string;
}

const WalletButton = ({ network }: IProps) => {
  const { disconnect, select, connected, publicKey, wallets, wallet } =
    useWallet();
  const { connection } = useConnection({ network });

  const [openSelectWallet, setOpenSelectWallet] = useState<boolean>(false);
  /* const [openGetReferalCode, setOpenGetReferalCode] = useState<boolean>(false); */
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();

  const balance = useMemo(async () => {
    if (publicKey) {
      const walletBalance = await connection.getBalance(publicKey);
      return walletBalance / LAMPORTS_PER_SOL;
    }
    return 0;
  }, [connection, publicKey]);

  const onDesconnect = useCallback(async () => {
    try {
      await disconnect();
      setOpenSelectWallet(false);
      toast.success('Wallet disconnected successful');
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
  }, [disconnect]);

  const onOpenModal = useCallback(() => {
    setOpenSelectWallet(true);
  }, []);

  /* const onGetReferalCode = useCallback(() => {
    setOpenGetReferalCode(true);
  }, []); */

  /* useEffect(() => {
    if (!wallet?.adapter) return;

    const handleError = (error: Error) => {
      console.error('Wallet adapter error on useEffect:', error);
    };

    wallet.adapter.on('error', handleError);
    return () => {
      wallet.adapter.off('error', handleError);
    };
  }, [wallet]); */

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
              onClick={onDesconnect}
              className='cursor-pointer text-gray-900'
            >
              Disconnect
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      {/* <Dialog open={openGetReferalCode} onOpenChange={setOpenGetReferalCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Referal Code</DialogTitle>
            <DialogDescription />
            <div className='mt-4 flex flex-row justify-center gap-6'></div>
          </DialogHeader>
        </DialogContent>
      </Dialog> */}
    </>
  ) : (
    <>
      <Button
        onClick={onOpenModal}
        className='cursor-pointer rounded-lg bg-yellow-400 px-4 py-2 text-gray-900 transition duration-300 hover:bg-yellow-500'
      >
        Connect Wallet
      </Button>
      <Dialog open={openSelectWallet} onOpenChange={setOpenSelectWallet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription />
            <div className='mt-4 flex flex-row justify-center gap-6'>
              {wallets.map((wallet, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedWallet(wallet);
                    select(wallet.adapter.name as WalletName);
                  }}
                  className={`border-1 p-4 rounded-xl flex flex-col gap-2 justify-center cursor-pointer hover:border-gray-700 ${
                    wallet.adapter.name === selectedWallet?.adapter.name
                      ? 'border-gray-700'
                      : ''
                  }`}
                >
                  <span>
                    <Image
                      src={wallet.adapter.icon}
                      alt='wallet.adapter.name'
                      width={100}
                      height={100}
                    />
                  </span>
                  <span className='text-center'>{wallet.adapter.name}</span>
                </div>
              ))}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletButton;
