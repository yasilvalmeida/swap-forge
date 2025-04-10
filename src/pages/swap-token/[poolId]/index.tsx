import { useWallet } from '@solana/wallet-adapter-react';
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
} from '@/libs/utils/raydium';
import { ApiV3PoolInfoItem, ApiV3Token } from '@raydium-io/raydium-sdk-v2';
import { GetServerSideProps } from 'next';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import { AxiosError } from 'axios';
import { ErrorResponseDto } from '@/libs/models';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SwapTokenFormData } from '@/libs/validation/swap-token';

import dynamic from 'next/dynamic';
import dotenv from 'dotenv';

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

interface SSRSwapTokenPageProps {
  poolId: string;
  pool: ApiV3PoolInfoItem;
  tokenList: ApiV3Token[];
}

function SwapTokenPage({
  poolId,
  pool,
  tokenList,
}: SSRSwapTokenPageProps) {
  const [schema, setSchema] = useState<
    typeof import('@/libs/validation/swap-token').swapTokenFormSchema | null
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

        console.log('swapTokenFormData', swapTokenFormData);

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
    [connected, publicKey]
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
    import('@/libs/validation/swap-token').then((module) => {
      setSchema(module.swapTokenFormSchema);
    });
    const getFee = async () => {
      const createLiquidityFee = await getCreateLiquidityFee();
      console.log('createLiquidityFee', createLiquidityFee);
      
    };
    getFee();
  }, []);

  return (
    <div className='min-h-screen text-white bg-gray-900'>
      <Header
        isLanding={false}
        title='Token Swapping'
        subtitle='Swap tokens instantly with high-speed transactions, low fees, and best prices.'
      />

      <Navbar />

      <div className='absolute right-4 top-4'>
        <WalletButton />
      </div>

      <div className='flex flex-col justify-center max-w-6xl gap-2 px-4 py-20 mx-auto'>
        <h1 className='mb-6 text-4xl font-bold text-center'>Swap Tokens</h1>
        {poolId && (
          <span className='flex flex-row justify-center gap-1 text-sm'>
            <span>Pool ID</span>
            <span className='text-yellow-400'>{poolId}</span>
          </span>
        )}
        <div className='flex flex-row justify-center gap-1 mb-2'>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col w-1/2 p-3 border-gray-500 rounded border-1'
            >
              <div className='flex flex-col items-center justify-center w-full gap-1 p-1 md:flex-row'>
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
                            className='w-full p-3 text-right bg-gray-700 rounded-lg h-9 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                            placeholder='Input amount'
                          />
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className='w-10 px-6 py-3 font-semibold transition duration-300 rounded-lg cursor-pointer'
                  variant={'link'}
                  /* onMouseEnter={() => setSwapIconHover(true)}
                  onMouseLeave={() => setSwapIconHover(false)} */
                  onClick={(e) => {
                    e.preventDefault();
                    handleSwap();
                  }}
                >
                  {/* {swapIconHover ? (
                    <ArrowLeftRight className='w-4 h-4 text-white' />
                  ) : (
                    <ArrowRight className='w-4 h-4 text-white' />
                  )} */}
                  <ArrowRight className='w-4 h-4 text-white' />
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
                        className='w-full p-3 text-right bg-gray-700 rounded-lg h-9 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                        placeholder='Input amount'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <span className='flex flex-row justify-center text-xs italic text-yellow-400'>{`1 ${
                pool?.mintA?.symbol
              } ~ ${price?.toFixed(6)} ${pool?.mintB?.symbol}`}</span>

              {/* {connected ? (
                <div className='flex flex-row justify-center pt-3'>
                  <Button
                    type='submit'
                    disabled={loading}
                    className='w-32 px-6 py-3 font-semibold transition duration-300 rounded-lg cursor-pointer'
                  >
                    {loading ? (
                      <Spinner />
                    ) : (
                      <span className='flex items-center gap-2 item'>
                        Swap Token
                        <ArrowLeftRight className='w-4 h-4' />
                      </span>
                    )}
                  </Button>
                </div>
              ) : (
                <span className='flex justify-center w-full text-yellow-400'>
                  Please connect your wallet!
                </span>
              )} */}
            </form>
          </FormProvider>
        </div>

        {/* <span className='text-xs italic text-center text-yellow-400'>
          The cost of Token swapping is 2% of the amount swapped!
        </span> */}
        {errorMessage && (
          <span className='mt-3 text-xs italic text-center text-red-500'>
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
      poolId,
      pool,
      tokenList: tokenList?.sort((a: ApiV3Token, b: ApiV3Token) =>
        a.symbol.localeCompare(b.symbol)
      ),
    },
  };
};

export default SwapTokenPage;
