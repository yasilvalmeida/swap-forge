import { copyToClipboard } from "@/libs/utils";
import { Button } from "../button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "../dialog";
import { Input } from "../input";
import { Label } from "../label";
import { AlignVerticalDistributeEnd, Copy, LinkIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { RAYDIUM_LIQUIDITY_URL } from "@/libs/constants/token";
import Spinner from "../spinner";
import { TokenCreateWidget, TokenCreateWidgetProps } from "./creation-widget";

interface CreateModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  token: TokenCreateWidgetProps;
  title: string;
  signature?: string;
  loading: boolean;
}

export const TokenCreateModal = ({ open, setOpen, token, title, signature, loading }: CreateModalProps) => {
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogPortal>
      <DialogOverlay className='fixed inset-0 bg-black/50' />
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className='fixed left-[50%] top-[50%] w-1/2 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-900 p-6 shadow-lg'
      >
        <DialogHeader>
          <DialogTitle className='text-gray-300'>{title}</DialogTitle>
        </DialogHeader>
        {token.publicKey && (
          <div className="flex flex-col gap-4">
            <TokenCreateWidget
              publicKey={token.publicKey}
              name={token.name}
              symbol={token.symbol}
              decimals={token.decimals}
              supply={token.supply}
              logo={token.logo}
            />
            <div className='flex items-center my-8 space-x-2'>
              <div className='grid flex-1 gap-2'>
                <Label htmlFor='token' className='sr-only'>
                  Token
                </Label>
                <Input id='token' defaultValue={token.publicKey} readOnly />
              </div>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(token.publicKey);
                  toast.success('Token copied!');
                }}
                size='sm'
                className='px-3 cursor-pointer'
              >
                <span className='sr-only'>Copy</span>
                <Copy />
              </Button>
            </div>
          </div>
        )}

        <div className='flex flex-col gap-4'>
          {signature && (
            <div className='flex justify-center'>
              <Link
                href={signature || ''}
                target='_blank'
                className='cursor-pointer'
              >
                <span className='flex items-center gap-1 text-xs text-yellow-400 underline'>
                  <LinkIcon className='h-4' /> View create token signature
                  on Solscan
                </span>
              </Link>
            </div>
          )}

          {token && (
            <div className='flex justify-center'>
              <Link
                href={RAYDIUM_LIQUIDITY_URL}
                target='_blank'
                className='cursor-pointer'
              >
                <span className='flex items-center gap-1 text-xs text-yellow-400 underline'>
                  <AlignVerticalDistributeEnd className='h-4' /> Create
                  Liquidity Pool on Raydium
                </span>
              </Link>
            </div>
          )}
        </div>

        <DialogFooter>
          {loading ? <Spinner color='oklch(79.5% 0.184 86.047)' /> : <Button
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
            className='cursor-pointer'
          >
            Close
          </Button>}
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
}