'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Copy, LinkIcon, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from './button';
import { Input } from './input';
import { getCreatedTokenList, getWallet } from '@/lib/utils/wallet';
import { REFERRAL_LINK } from '@/lib/constants';
import { AffiliateProgramResume } from '@/components/layout/affiliate-program';
import { TokenAccountDto } from '@/lib/models/wallet';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
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

  const [openReferralModal, setOpenReferralModal] = useState<boolean>(false);
  const [openCreatedToken, setOpenCreatedToken] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [balance, setBalance] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>();
  const [createdTokens, setCreatedTokens] = useState<TokenAccountDto[]>([]);

  const onGetReferalCode = useCallback(() => {
    setOpenReferralModal(true);
  }, []);

  const onGetMyTokens = useCallback(() => {
    setOpenCreatedToken(true);
  }, []);

  useEffect(() => {
    getBalance();
    getWalletInfo();
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
    async function getWalletInfo() {
      if (publicKey) {
        const wallet = await getWallet(publicKey.toBase58());
        if (wallet?._id) {
          setReferralCode(wallet?.referralCode);
          const createdTokenList = await getCreatedTokenList(wallet?._id);
          setCreatedTokens(createdTokenList || []);
        }
      }
    }
  }, [connection, publicKey]);

  const columns: ColumnDef<TokenAccountDto>[] = useMemo(() => {
    return [
      {
        accessorKey: 'tokenPublicKey',
        header: () => {
          return <span>Token Address</span>;
        },
        cell: ({ row }) => <div>{row.getValue('tokenPublicKey')}</div>,
      },
      {
        accessorKey: 'createdAt',
        header: () => <div className='text-center'>Created At</div>,
        cell: ({ row }) => {
          const createdAt = dayjs(row.getValue('createdAt'));
          return (
            <div className='text-center font-medium'>
              {createdAt.format('DD/MM/YYYY')}
            </div>
          );
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const tokenAccount = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8'>
                  <span className='sr-only'>Open menu</span>
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    console.log('clicked');
                    e.preventDefault();
                    copyToClipboard(tokenAccount.tokenPublicKey);
                    toast.success('Token address copied!');
                  }}
                  className='cursor-pointer'
                >
                  <Copy className='h-4' />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      `https://solscan.io/token/${tokenAccount.tokenPublicKey}`
                    );
                  }}
                  className='cursor-pointer'
                >
                  <LinkIcon className='h-4' /> View on Solscan
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, []);

  const table = useReactTable({
    data: createdTokens,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

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
            <MenubarItem
              onClick={onGetMyTokens}
              className='cursor-pointer text-gray-900'
            >
              My Token List
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
      <Dialog open={openReferralModal} onOpenChange={setOpenReferralModal}>
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
                <Label htmlFor='referralCode' className='sr-only'>
                  Token
                </Label>
                <Input id='referralCode' defaultValue={referralCode} readOnly />
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
                  setOpenReferralModal(false);
                }}
                className='cursor-pointer'
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      <Dialog open={openCreatedToken} onOpenChange={setOpenCreatedToken}>
        <DialogPortal>
          <DialogOverlay className='fixed inset-0 bg-black/50' />
          <DialogContent className='fixed left-[50%] top-[50%] w-11/12 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-900 p-2 shadow-lg'>
            <DialogHeader>
              <DialogTitle className='text-gray-300'>
                Created Tokens
              </DialogTitle>
              <DialogDescription className='text-gray-300'>
                List of my tokens
              </DialogDescription>
            </DialogHeader>
            <div className='h-max-[500px] w-full overflow-auto'>
              <div className='rounded-md border bg-gray-50'>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className='h-24 text-center'
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenCreatedToken(false);
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
