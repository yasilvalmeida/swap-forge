import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import WalletButton from '@/components/ui/wallet-button';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  SelectValue,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  getCreateLiquidityFee,
  getPoolById,
  getTokenList,
} from '@/lib/utils/raydium';
import { ApiV3PoolInfoItem, ApiV3Token } from '@raydium-io/raydium-sdk-v2';
import { Keypair } from '@solana/web3.js';
import { GetServerSideProps } from 'next';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import { AxiosError } from 'axios';
import { ErrorResponseDto } from '@/lib/models';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SwapTokenFormData } from '@/lib/validation/swap-token';
import dotenv from 'dotenv';
import bs58 from 'bs58';

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

interface SSRSwapTokenPageProps {
  swapForgeSecret: string;
  network: string;
  poolId: string;
  pool: ApiV3PoolInfoItem;
  tokenList: ApiV3Token[];
}

function SwapTokenPage({
  swapForgeSecret,
  poolId,
  pool,
  tokenList,
}: SSRSwapTokenPageProps) {
  const [schema, setSchema] = useState<
    typeof import('@/lib/validation/swap-token').swapTokenFormSchema | null
  >(null);

  const price = useMemo(() => {
    const price = pool?.price;
    return price;
  }, [pool]);

  const form = useForm<SwapTokenFormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      inputMint: pool?.mintA.address || '',
      outputMint: pool?.mintB.address || '',
      inputAmount: '1',
    },
    mode: 'onChange',
  });

  const inputMint = form.watch('inputMint');
  const outputMint = form.watch('outputMint');
  const inputAmount = form.watch('inputAmount');

  const { connected, publicKey } = useWallet();
  /* const [loading, setLoading] = useState<boolean>(false); */
  /* const [swapIconHover, setSwapIconHover] = useState<boolean>(false); */
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onSubmit = useCallback(
    async (swapTokenFormData: SwapTokenFormData) => {
      try {
        setErrorMessage('');
        if (!connected || !publicKey) {
          toast.error('Please connect your wallet first.');
          return;
        }

        const swapForgeAuthority = Keypair.fromSecretKey(
          bs58.decode(swapForgeSecret)
        );

        console.log(
          'swapForgeAuthority',
          swapForgeAuthority,
          swapTokenFormData
        );

        /* setLoading(true); */
        // Your swap logic here...

        /* setLoading(false); */
      } catch (error) {
        if (error instanceof WalletSendTransactionError) {
          if (error.message.includes('User rejected the request')) {
            toast.error('You rejected the transaction. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else if (error instanceof AxiosError) {
          const axiosError = error as AxiosError;
          const data = axiosError.response?.data;
          toast.error((data as ErrorResponseDto)?.error);
          setErrorMessage((data as ErrorResponseDto)?.error);
        } else {
          toast.error('Transaction failed. Please try again.');
        }
        /* setLoading(false); */
      }
    },
    [connected, publicKey, swapForgeSecret]
  );

  const handleSwap = useCallback(() => {
    /* form.setValue('inputMint', outputMint);
    form.setValue('outputMint', inputMint); */
  }, []);

  const getTokenPrice = useCallback(
    (token: string) => {
      if (token === outputMint) {
        return ((price || 0) * (Number(inputAmount) || 1)).toFixed(6);
      }
    },
    [inputAmount, outputMint, price]
  );

  useEffect(() => {
    import('@/lib/validation/swap-token').then((module) => {
      setSchema(module.swapTokenFormSchema);
    });
    const getFee = async () => {
      const createLiquidityFee = await getCreateLiquidityFee();
      console.log('createLiquidityFee', createLiquidityFee);
      
    };
    getFee();
  }, []);

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header
        isLanding={false}
        title='Token Swapping'
        subtitle='Swap tokens instantly with high-speed transactions, low fees, and best prices.'
      />

      <Navbar />

      <div className='absolute right-4 top-4'>
        <WalletButton />
      </div>

      <div className='mx-auto flex max-w-6xl flex-col justify-center gap-2 px-4 py-20'>
        <h1 className='mb-6 text-center text-4xl font-bold'>Swap Tokens</h1>
        {poolId && (
          <span className='flex flex-row justify-center gap-1 text-sm'>
            <span>Pool ID</span>
            <span className='text-yellow-400'>{poolId}</span>
          </span>
        )}
        <div className='mb-2 flex flex-row justify-center gap-1'>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='border-1 flex w-1/2 flex-col rounded border-gray-500 p-3'
            >
              <div className='flex w-full flex-col items-center justify-center gap-1 p-1 md:flex-row'>
                <FormField
                  control={form.control}
                  name='inputMint'
                  render={({ field }) => (
                    <FormItem className='w-1/2'>
                      <Select onValueChange={field.onChange} value={inputMint}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select input mint' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tokenList.map((mint) => (
                            <SelectItem key={mint.address} value={mint.address}>
                              {mint.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Controller
                        name='inputAmount'
                        control={form.control}
                        defaultValue='6'
                        render={({ field }) => (
                          <input
                            {...field}
                            onChange={field.onChange}
                            className='h-9 w-full rounded-lg bg-gray-700 p-3 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400'
                            placeholder='Input amount'
                          />
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className='w-10 cursor-pointer rounded-lg px-6 py-3 font-semibold transition duration-300'
                  variant={'link'}
                  /* onMouseEnter={() => setSwapIconHover(true)}
                  onMouseLeave={() => setSwapIconHover(false)} */
                  onClick={(e) => {
                    e.preventDefault();
                    handleSwap();
                  }}
                >
                  {/* {swapIconHover ? (
                    <ArrowLeftRight className='h-4 w-4 text-white' />
                  ) : (
                    <ArrowRight className='h-4 w-4 text-white' />
                  )} */}
                  <ArrowRight className='h-4 w-4 text-white' />
                </Button>
                <FormField
                  control={form.control}
                  name='outputMint'
                  render={({ field }) => (
                    <FormItem className='w-1/2'>
                      <Select onValueChange={field.onChange} value={outputMint}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select output mint' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tokenList.map((mint) => (
                            <SelectItem key={mint.address} value={mint.address}>
                              {mint.symbol}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        value={getTokenPrice(outputMint)}
                        className='h-9 w-full rounded-lg bg-gray-700 p-3 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400'
                        placeholder='Input amount'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <span className='text-xs flex flex-row justify-center italic text-yellow-400'>{`1 ${
                pool?.mintA?.symbol
              } ~ ${price?.toFixed(6)} ${pool?.mintB?.symbol}`}</span>

              {/* {connected ? (
                <div className='flex flex-row justify-center pt-3'>
                  <Button
                    type='submit'
                    disabled={loading}
                    className='w-32 cursor-pointer rounded-lg px-6 py-3 font-semibold transition duration-300'
                  >
                    {loading ? (
                      <Spinner />
                    ) : (
                      <span className='item flex items-center gap-2'>
                        Swap Token
                        <ArrowLeftRight className='h-4 w-4' />
                      </span>
                    )}
                  </Button>
                </div>
              ) : (
                <span className='flex w-full justify-center text-yellow-400'>
                  Please connect your wallet!
                </span>
              )} */}
            </form>
          </FormProvider>
        </div>

        {/* <span className='text-xs text-center italic text-yellow-400'>
          The cost of Token swapping is 2% of the amount swapped!
        </span> */}
        {errorMessage && (
          <span className='text-xs mt-3 text-center italic text-red-500'>
            {errorMessage}
          </span>
        )}
      </div>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  SSRSwapTokenPageProps
> = async (context) => {
  const poolId = context.query?.poolId as string;
  if (!poolId) {
    return {
      redirect: {
        permanent: false,
        destination: '/swap-token',
      },
      props: {},
    };
  }

  const [pools, allList] = await Promise.all([
    getPoolById(poolId),
    getTokenList(),
  ]);
  if (!pools || pools?.length === 0) {
    return {
      redirect: {
        permanent: false,
        destination: '/swap-token',
      },
      props: {},
    };
  }
  const [pool] = pools;

  const tokenList = allList?.mintList || [];

  const foundA = tokenList.find(
    (token) => token.address === pool.mintA.address
  );

  if (!foundA) {
    tokenList.push(pool.mintA);
  }

  const foundB = tokenList.find(
    (token) => token.address === pool.mintB.address
  );

  if (!foundB) {
    tokenList.push(pool.mintB);
  }
  return {
    props: {
      swapForgeSecret: process.env.SWAPFORGE_WALLET_SECRET || '',
      network: process.env.SOLANA_NETWORK || '',
      poolId,
      pool,
      tokenList: tokenList?.sort((a: ApiV3Token, b: ApiV3Token) =>
        a.symbol.localeCompare(b.symbol)
      ),
    },
  };
};

export default SwapTokenPage;
