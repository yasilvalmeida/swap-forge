import QRCode from 'react-qr-code';
import { useWallet } from '@solana/wallet-adapter-react';
import { Check, Copy } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';
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
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/libs/utils';

interface ReceiveModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const ReceiveModal = ({ open, setOpen }: ReceiveModalProps) => {
  const { publicKey } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    
    copyToClipboard(publicKey.toBase58());
    setCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed left-[50%] top-[50%] w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-900 p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Receive SOL
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Scan the QR code or share your wallet address
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg bg-white p-4">
                {publicKey && (
                  <QRCode
                    value={publicKey.toBase58()}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="Q" // Error correction (L/M/Q/H)
                  />
                )}
              </div>
              <p className="text-sm text-gray-400">
                Scan this code to receive SOL
              </p>
            </div>

            {/* Wallet Address */}
            <div className="rounded-lg bg-gray-800 p-4">
              <div className="mb-2 text-sm text-gray-400">
                Your wallet address
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-mono text-sm text-yellow-500">
                  {publicKey?.toBase58()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};