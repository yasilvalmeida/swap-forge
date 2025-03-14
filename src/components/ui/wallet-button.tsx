import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { DialogDescription } from '@radix-ui/react-dialog';
import { WalletName } from '@solana/wallet-adapter-base';

const WalletButton = () => {
  const { disconnect, select, connected, publicKey, wallets } = useWallet();

  const [open, setOpen] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();

  const handleDesconnect = useCallback(async () => {
    try {
      await disconnect();
      setOpen(false);
      toast.success('Wallet disconnected successful');
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
  }, [disconnect]);

  const handleOpenModal = useCallback(() => {
    setOpen(true);
  }, []);

  return connected ? (
    <Menubar className='w-full text-gray-900'>
      <MenubarMenu>
        <MenubarTrigger className='text-gray-900'>
          <span className='cursor-pointer text-gray-900'>
            {`Connected: ${publicKey?.toBase58().slice(0, 6)}...`}
          </span>
        </MenubarTrigger>
        <MenubarContent className='cursor-pointer text-gray-900'>
          <MenubarItem
            onClick={handleDesconnect}
            className='cursor-pointer text-gray-900'
          >
            Disconnect
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ) : (
    <>
      <Button
        onClick={handleOpenModal}
        className='cursor-pointer rounded-lg bg-yellow-400 px-4 py-2 text-gray-900 transition duration-300 hover:bg-yellow-500'
      >
        Connect Wallet
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
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
