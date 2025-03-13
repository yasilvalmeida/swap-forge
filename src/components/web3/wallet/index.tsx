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
          <span className='text-gray-900 cursor-pointer'>
            {`Connected: ${publicKey?.toBase58().slice(0, 6)}...`}
          </span>
        </MenubarTrigger>
        <MenubarContent className=' text-gray-900 cursor-pointer'>
          {/* <MenubarItem
            onClick={async (e) => {
              e.preventDefault();
              await handleDesconnect();
              handleOpenModal();
            }}
            className='text-gray-900  cursor-pointer'
          >
            Change
          </MenubarItem>
          <MenubarSeparator /> */}
          <MenubarItem
            onClick={handleDesconnect}
            className='text-gray-900  cursor-pointer'
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
        className='bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-300 cursor-pointer'
      >
        Connect Wallet
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription />
            <div className='flex flex-row gap-6 justify-center mt-4'>
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
