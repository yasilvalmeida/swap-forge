import dynamic from 'next/dynamic';
/* import WalletButton from '@/components/ui/wallet-button';
import {
  ExternalLink,
  Plus,
  Minus,
  Trash2,
  Package,
  ArrowUpDown,
  CircleDollarSign,
  Coins,
  LineChart
} from 'lucide-react'; */
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
/* import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { copyToClipboard } from '@/libs/utils';
import { Label } from '@radix-ui/react-label';
import { Copy, LinkIcon, MoreVertical } from 'lucide-react'; */
import { toast } from 'react-toastify';
/* import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui//input'; */
import { getWallet } from '@/libs/utils/wallet';
/* import { REFERRAL_LINK } from '@/libs/constants';
import { AffiliateProgramResume } from '@/components/layout/affiliate-program';
import { TokenAccountDto } from '@/libs/models/wallet';
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
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; */
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

function DashboardPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  /* const [openReferralModal, setOpenReferralModal] = useState<boolean>(false);
  const [openCreatedToken, setOpenCreatedToken] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]); */
  
  /* const [referralCode, setReferralCode] = useState<string>();
  const [createdTokens, setCreatedTokens] = useState<TokenAccountDto[]>([]); */
  const [balance, setBalance] = useState<string>('');

  /* const columns: ColumnDef<TokenAccountDto>[] = useMemo(() => {
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
 */
  /* const table = useReactTable({
    data: createdTokens,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  }); */

  useEffect(() => {
    getBalance();
    getWalletInfo();
    return () => {};

    async function getBalance() {
      if (publicKey) {
        try {
          const balance = await connection.getBalance(publicKey);
          const balanceInSol = balance / LAMPORTS_PER_SOL;
          const formattedBalance = balanceInSol < 1 ? balanceInSol.toFixed(6) : (balanceInSol).toFixed(2);
          setBalance(formattedBalance);
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
          /* setReferralCode(wallet?.referralCode);
          const createdTokenList = await getCreatedTokenList(wallet?._id);
          setCreatedTokens(createdTokenList || []); */
        }
      }
    }
  }, [connection, publicKey]);
  
  useEffect(() => {
    if (!connected || !publicKey) {
      router.push('/');
    }
  }, [connected, publicKey, router])
  
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header
        isLanding={false}
        title='Wallet Dashboard'
        subtitle='Manage your tokens, liquidity, and transactions in one place'
      />

      <Navbar />

      <main className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Dashboard Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Portfolio Overview</h2>
              <p className="text-gray-400">Your complete Solana wallet management</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="rounded-full bg-gray-800 px-4 py-2 font-medium">
                SOL: <span className="text-yellow-400">{balance}</span>
              </span>
              {/* <Button>
                <ExternalLink className="h-4 w-4" />
                Receive
              </Button> */}
            </div>
          </div>

          {/* Dashboard Grid */}
          {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                  <Package className="h-6 w-6" />
                  Token Balances
                </h3>
                <div className="space-y-4">
                  {[
                    { symbol: 'SOL', balance: '24.58', value: '$492.32', change: '+2.3%' },
                    { symbol: 'SWAP', balance: '1,250', value: '$312.50', change: '-1.2%' },
                    { symbol: 'USDC', balance: '500', value: '$500.00', change: '0.0%' },
                  ].map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                          <Coins className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{token.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div>{token.balance}</div>
                        <div className="flex items-center justify-end gap-1 text-sm">
                          <span className="text-gray-400">{token.value}</span>
                          <span className={`text-xs ${token.change.startsWith('+') ? 'text-green-400' : token.change.startsWith('-') ? 'text-red-400' : 'text-gray-500'}`}>
                            {token.change}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-4 text-2xl font-semibold">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-medium text-white transition duration-300 hover:bg-blue-600">
                    <Plus className="h-4 w-4" />
                    Add Liquidity
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-3 font-medium text-white transition duration-300 hover:bg-purple-600">
                    <Minus className="h-4 w-4" />
                    Remove
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition duration-300 hover:bg-green-600">
                    <Plus className="h-4 w-4" />
                    Create Token
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 font-medium text-white transition duration-300 hover:bg-red-600">
                    <Trash2 className="h-4 w-4" />
                    Burn Token
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Your Tokens</h3>
                <span className="rounded-full bg-gray-700 px-3 py-1 text-sm">
                  5 Created
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-left text-gray-400">
                      <th className="pb-3">Token</th>
                      <th className="pb-3">Supply</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'SwapForge', symbol: 'SWAP', supply: '10M', value: '$312.50' },
                      { name: 'TestToken', symbol: 'TEST', supply: '1M', value: '$50.00' },
                    ].map((token) => (
                      <tr key={token.symbol} className="hover:bg-gray-750 border-b border-gray-700">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                              <Coins className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-sm text-gray-400">{token.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{token.supply}</div>
                          <div className="text-sm text-gray-400">{token.value}</div>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button className="flex items-center gap-1 rounded bg-gray-700 px-3 py-1 text-sm transition hover:bg-gray-600">
                              <ArrowUpDown className="h-3 w-3" />
                              Manage
                            </button>
                            <button className="flex items-center gap-1 rounded bg-red-500 px-3 py-1 text-sm text-white transition hover:bg-red-600">
                              <Trash2 className="h-3 w-3" />
                              Burn
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Total Tokens', value: '5', icon: <Package className="h-5 w-5" /> },
                  { title: 'Transactions', value: '42', icon: <ArrowUpDown className="h-5 w-5" /> },
                  { title: 'Liquidity Pools', value: '3', icon: <CircleDollarSign className="h-5 w-5" /> },
                  { title: 'Total Value', value: '$1,304.82', icon: <LineChart className="h-5 w-5" /> },
                ].map((stat) => (
                  <div key={stat.title} className="rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-lg">
                    <div className="flex items-center gap-2 text-gray-400">
                      {stat.icon}
                      {stat.title}
                    </div>
                    <div className="mt-2 text-2xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <h3 className="mb-4 text-2xl font-semibold">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { type: 'Swap', details: 'SOL → SWAP', amount: '5 SOL', time: '2 min ago', status: 'completed', icon: <ArrowUpDown className="h-4 w-4" /> },
                    { type: 'Add Liquidity', details: 'SOL/SWAP', amount: '$200', time: '1 hour ago', status: 'completed', icon: <Plus className="h-4 w-4" /> },
                    { type: 'Token Create', details: 'TEST Token', amount: '1M Supply', time: '3 days ago', status: 'completed', icon: <Package className="h-4 w-4" /> },
                  ].map((tx, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full ${tx.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                          {tx.icon}
                        </div>
                        <div>
                          <div className="font-medium">{tx.type}</div>
                          <div className="text-sm text-gray-400">{tx.details}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div>{tx.amount}</div>
                        <div className="text-sm text-gray-400">{tx.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;