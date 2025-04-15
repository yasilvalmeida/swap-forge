import dynamic from 'next/dynamic';
import {
  ExternalLink,
  Package,
  ArrowUpDown,
  CircleDollarSign,
  Coins,
  Share2Icon,
} from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { copyToClipboard } from '@/libs/utils';
import { Copy, LinkIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { getCreatedLiquidityList, getCreatedSwapList, getCreatedTokenList, getWallet } from '@/libs/utils/wallet';
import { LiquidityDto, SwapDto, TokenAccountDto } from '@/libs/models/wallet';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ReceiveModal } from '@/components/ui/dashboard/receive-modal';
import Link from 'next/link';
import { REFERRAL_LINK } from '@/libs/constants';

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

function DashboardPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [openReceiveModal, setOpenReceiveModal] = useState<boolean>(false);
  
  const [referralCode, setReferralCode] = useState<string>();
  const [createdTokens, setCreatedTokens] = useState<TokenAccountDto[]>([]);
  const [createdLiquidities, setCreatedLiquidities] = useState<LiquidityDto[]>([]);
  const [createdSwaps, setCreatedSwaps] = useState<SwapDto[]>([]);
  const [balance, setBalance] = useState<string>('');

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
          setReferralCode(wallet?.referralCode);
          const createdTokenList = await getCreatedTokenList(wallet?._id);
          const createdLiquidityList = await getCreatedLiquidityList(wallet?._id);
          const createdSwapList = await getCreatedSwapList(wallet?._id);
          setCreatedTokens(createdTokenList || []);
          setCreatedLiquidities(createdLiquidityList || [])
          setCreatedSwaps(createdSwapList || [])
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
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold">Portfolio Overview</h2>
              <p className="text-gray-400">Your complete Solana wallet management</p>
              <br />
              <p className='flex items-center gap-1 text-sm'>
                <span>Referral Code:</span>
                <div className='flex items-center gap-3'>
                  <span onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(`${REFERRAL_LINK}/${referralCode}`);
                    toast.success('Referral link copied!')
                  }} className='cursor-pointer text-yellow-500'>{referralCode}</span>
                  <Link href={`${REFERRAL_LINK}/${referralCode}`} target='_blank'>
                    <Share2Icon className='h-4 w-4' />
                  </Link>
                </div>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="rounded-full bg-gray-800 px-4 py-2 font-medium">
                SOL: <span className="text-yellow-400">{balance}</span>
              </span>
              <Button onClick={(e) => {
                e.preventDefault();
                setOpenReceiveModal(true);
              }}>
                <ExternalLink className="h-4 w-4" />
                Receive
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <div className="flex items-center gap-2 text-gray-400">
                  <Package className="h-5 w-5" />
                  Total Tokens
                </div>
                <div className="mt-2 text-2xl font-bold">{createdTokens?.length}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <div className="flex items-center gap-2 text-gray-400">
                  <CircleDollarSign className="h-5 w-5" />
                  Liquidity Pools
                </div>
                <div className="mt-2 text-2xl font-bold">{createdLiquidities?.length}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <div className="flex items-center gap-2 text-gray-400">
                  <ArrowUpDown className="h-5 w-5" />
                  Transactions
                </div>
                <div className="mt-2 text-2xl font-bold">{createdSwaps?.length}</div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Tokens</h3>
                <span className="rounded-full bg-gray-700 px-3 py-1 text-sm">
                  {createdTokens?.length} Created
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-left text-gray-400">
                      <th className="pb-3">Token</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdTokens?.map((token, index) => (
                      <tr key={index} className="hover:bg-gray-750 border-b border-gray-700">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                              <Coins className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{token.tokenPublicKey?.substring(0, 15)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(token?.tokenPublicKey);
                              toast.success('Token address copied!');
                            }} variant={'ghost'} title='Copy token address'>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button onClick={(e) => {
                              e.preventDefault();
                              e.preventDefault();
                              window.open(
                                `https://solscan.io/token/${token?.tokenPublicKey}`
                              );
                            }} variant={'ghost'} title='View on Solscan'>
                              <LinkIcon className="h-3 w-3" />
                            </Button>
                            {/* <Button variant={'destructive'} title='Burn tokens'>
                              <Trash2 className="h-3 w-3" />
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Liquidity Pool</h3>
                <span className="rounded-full bg-gray-700 px-3 py-1 text-sm">
                  {createdLiquidities?.length} Created
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-left text-gray-400">
                      <th className="pb-3">Liquidity Pool</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdLiquidities?.map((liquidity, index) => (
                      <tr key={index} className="hover:bg-gray-750 border-b border-gray-700">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                              <CircleDollarSign className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{liquidity.liquidityKey?.substring(0, 15)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(liquidity?.liquidityKey);
                              toast.success('Liquidity pool address copied!');
                            }} variant={'ghost'} title='Copy liquidity pool address'>
                              <Copy className="h-3 w-3" />
                            </Button>
                            {/* <Button onClick={(e) => {
                              e.preventDefault();
                              e.preventDefault();
                              window.open(
                                `https://solscan.io/token/${token?.tokenPublicKey}`
                              );
                            }} variant={'ghost'} title='View on Solscan'>
                              <LinkIcon className="h-3 w-3" />
                            </Button> */}
                            {/* <Button variant={'destructive'} title='Burn tokens'>
                              <Trash2 className="h-3 w-3" />
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Transactions</h3>
                <span className="rounded-full bg-gray-700 px-3 py-1 text-sm">
                  {createdSwaps?.length} Created
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-left text-gray-400">
                      <th className="pb-3">Swap</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdSwaps?.map((swap, index) => (
                      <tr key={index} className="hover:bg-gray-750 border-b border-gray-700">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                              <Coins className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{swap.swapKey?.substring(0, 15)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={(e) => {
                              e.preventDefault();
                              copyToClipboard(swap?.swapKey);
                              toast.success('Swap address copied!');
                            }} variant={'ghost'} title='Copy swap address'>
                              <Copy className="h-3 w-3" />
                            </Button>
                            {/* <Button onClick={(e) => {
                              e.preventDefault();
                              e.preventDefault();
                              window.open(
                                `https://solscan.io/token/${token?.tokenPublicKey}`
                              );
                            }} variant={'ghost'} title='View on Solscan'>
                              <LinkIcon className="h-3 w-3" />
                            </Button> */}
                            {/* <Button variant={'destructive'} title='Burn tokens'>
                              <Trash2 className="h-3 w-3" />
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <ReceiveModal open={openReceiveModal} setOpen={setOpenReceiveModal} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardPage;