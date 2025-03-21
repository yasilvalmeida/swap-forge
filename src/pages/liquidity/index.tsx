import dynamic from 'next/dynamic';
import WalletButton from '@/components/ui/wallet-button';
import { GetServerSideProps } from 'next';
import dotenv from 'dotenv';
import { useEffect, useMemo, useState } from 'react';
import { getPoolList } from '@/lib/utils/raydium';
import { ApiV3PoolInfoItem, PoolFetchType } from '@raydium-io/raydium-sdk-v2';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatNumber } from '@/lib/utils';
import { FilterIcon, FilterX } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Label } from '@/components/ui/label';
import { LiquidityPoolSortDto } from '@/lib/models/liquidity';

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

interface SSRLiquidityPageProps {
  swapForgeSecret: string;
  network: string;
}

function LiquidityPage() {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const queryClient = useQueryClient();

  const router = useRouter();

  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<PoolFetchType>(PoolFetchType.All);
  const [sort, setSort] = useState<LiquidityPoolSortDto>('liquidity');
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>('desc');

  const columnHelper = useMemo(
    () => createColumnHelper<ApiV3PoolInfoItem>(),
    []
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        id: 'pool',
        enableSorting: false,
        header: () => <span className='flex justify-start text-sm'>Pool</span>,
        cell: (info) => (
          <div className='flex items-center justify-start gap-2'>
            <div className='relative flex flex-row items-center'>
              <div className='relative w-6 h-6'>
                {info?.row?.original?.mintA?.logoURI && (
                  <Image
                    src={info?.row?.original?.mintA?.logoURI}
                    alt={info?.row?.original?.mintA?.name}
                    width={20}
                    height={20}
                    className='w-full h-full border-2 border-indigo-900 rounded-full shadow-lg'
                  />
                )}
              </div>
              <div className='relative w-6 h-6 -ml-2'>
                {info?.row?.original?.mintB?.logoURI && (
                  <Image
                    src={info?.row?.original?.mintB?.logoURI}
                    alt={info?.row?.original?.mintB?.name}
                    width={20}
                    height={20}
                    className='w-full h-full border-2 border-indigo-900 rounded-full shadow-lg'
                  />
                )}
              </div>
            </div>
            <div className='flex flex-row gap-1'>
              <span>{info?.row?.original?.mintA?.symbol}</span>-
              <span>{info?.row?.original?.mintB?.symbol}</span>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.tvl, {
        id: 'tvl',
        enableSorting: false,
        header: () => (
          <span className='flex justify-end text-sm'>Liquidity</span>
        ),
        cell: (info) => (
          <span className='flex justify-end text-sm'>
            ${formatNumber(`${info.getValue()}`)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.day.volume, {
        id: 'day.volume',
        enableSorting: false,
        header: () => (
          <span className='flex justify-end text-sm'>Volume 24H</span>
        ),
        cell: (info) => (
          <span className='flex justify-end text-sm'>
            ${formatNumber(`${info.getValue()}`)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.day.volumeFee, {
        id: 'day.volumeFee',
        enableSorting: false,
        header: () => <span className='flex justify-end text-sm'>Fee 24H</span>,
        cell: (info) => (
          <span className='flex justify-end text-sm'>
            ${formatNumber(`${info.getValue()}`)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.day.apr, {
        id: 'day.apr',
        enableSorting: false,
        header: () => <span className='flex justify-end text-sm'>APR 24H</span>,
        cell: (info) => (
          <span className='flex justify-end text-sm'>
            {`${Number(info.getValue() * 100).toFixed(2)}%`}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.type, {
        id: 'type',
        enableSorting: false,
        header: () => <span className='flex justify-start text-sm'>Type</span>,
        cell: (info) => (
          <span className='flex justify-start text-sm'>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: 'actions',
        enableSorting: false,
        header: () => <span className='text-sm'>Swap</span>,
        cell: (info) => (
          <div className='flex justify-center' vocab={info.row.original.id}>
            {/* <Button
              className='px-2 py-1 leading-6 text-white rounded-md shadow-sm cursor-pointer bg-primary hover:bg-primary-hover'
              onClick={() => {
                router.push({
                  pathname: '/swap',
                  query: { poolId: info?.row?.original?.id },
                });
              }}
            >
              <ArrowLeftRight className='w-4 h-4' />
            </Button> */}
          </div>
        ),
      }),
    ],
    [columnHelper, router]
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['getPoolList', 1, 10, type, sort, order],
      queryFn: () =>
        getPoolList({
          page,
          pageSize: 10,
          type,
          sort,
          order,
        }),
      initialPageParam: { page, pageSize: 10, type, sort, order },
      getNextPageParam: (lastPage) => {
        /* console.log('lastPage', lastPage); */
        return lastPage?.hasNextPage
          ? { page, pageSize: 10, type, sort, order }
          : undefined;
      },
    });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page?.data || []) || [],
    [data]
  );

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    if (inView) {
      setPage((prev) => prev + 1);
    }
  }, [inView]);

  useEffect(() => {
    if (page > 1 && hasNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, page]);

  useEffect(() => {
    console.log('sort', sort, order);
    queryClient.invalidateQueries({
      queryKey: ['getPoolList', type, sort, order],
    });
  }, [type, sort, order, queryClient]);

  return (
    <div className='min-h-screen text-white bg-gray-900'>
      <Header
        isLanding={false}
        title='Liquidity'
        subtitle='Revolutionize Your DeFi Experience – Build and Control Liquidity Pools in Just a Few Clicks!'
      />

      <Navbar />

      <div className='absolute right-4 top-4'>
        <WalletButton />
      </div>

      <section className='px-4 py-2 bg-gray-800'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex flex-row justify-between gap-2 my-2'>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setShowFilter((prev) => !prev);
                }}
                className='w-32 cursor-pointer'
              >
                {showFilter ? (
                  <FilterX className='w-4 h-5' />
                ) : (
                  <FilterIcon className='w-4 h-4' />
                )}
                Filters
              </Button>
              {showFilter && (
                <div className='flex flex-row gap-2 p-2 border-purple-900 rounded border-1'>
                  <div className='flex flex-col gap-2'>
                    <span className='flex flex-row justify-center'>
                      <Label>Type</Label>
                    </span>
                    <div className='flex flex-row gap-2'>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setType(PoolFetchType.Concentrated);
                        }}
                        variant={type === 'concentrated' ? 'default' : 'ghost'}
                        className='cursor-pointer'
                      >
                        Concentrated
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setType(PoolFetchType.Standard);
                        }}
                        variant={type === 'standard' ? 'default' : 'ghost'}
                        className='cursor-pointer'
                      >
                        Standard
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setType(PoolFetchType.All);
                        }}
                        variant={type === 'all' ? 'default' : 'ghost'}
                        className='cursor-pointer'
                      >
                        All
                      </Button>
                    </div>
                  </div>
                  <div className='flex flex-row justify-between gap-1'>
                    <div className='flex flex-col gap-2'>
                      <span className='flex flex-row justify-center'>
                        <Label>Sort</Label>
                      </span>
                      <Select
                        onValueChange={(value) =>
                          setSort(value as LiquidityPoolSortDto)
                        }
                        defaultValue={sort}
                      >
                        <SelectTrigger className='w-[280px]'>
                          <SelectValue placeholder='Sort criteria' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='liquidity'>Liquidity</SelectItem>
                            <SelectItem value='volume24h'>
                              Volume 24h
                            </SelectItem>
                            <SelectItem value='volume7d'>Volume 7d</SelectItem>
                            <SelectItem value='volume30d'>
                              Volume 30d
                            </SelectItem>
                            <SelectItem value='fee24h'>Fee 24h</SelectItem>
                            <SelectItem value='fee7d'>Fee 7d</SelectItem>
                            <SelectItem value='fee30d'>Fee 30d</SelectItem>
                            <SelectItem value='apr24h'>APR 24h</SelectItem>
                            <SelectItem value='apr7d'>APR 7d</SelectItem>
                            <SelectItem value='apr30d'>APR 30d</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='flex flex-col gap-2'>
                      <span className='flex flex-row justify-center'>
                        <Label>Order</Label>
                      </span>
                      <Select
                        onValueChange={(value) =>
                          setOrder(value as 'asc' | 'desc')
                        }
                        defaultValue={order}
                      >
                        <SelectTrigger className='w-[280px]'>
                          <SelectValue placeholder='Order direction' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='asc'>Asc</SelectItem>
                            <SelectItem value='desc'>Desc</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <span>
              {/* <Button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className='cursor-pointer'
              >
                <PlusIcon className='w-4 h-4' />
                Create
              </Button> */}
            </span>
          </div>
          <div className='relative overflow-hidden border border-purple-900 rounded-lg shadow-lg'>
            <div className='absolute inset-0 shadow-[0_0_20px_5px_rgba(128,0,128,0.5)]'></div>
            <div className='overflow-auto bg-gray-800 bg-opacity-10 backdrop-blur-md'>
              <table className='min-w-full'>
                <thead className='sticky top-0 z-10 bg-purple-900 bg-opacity-50'>
                  {flatData.length >= 0 &&
                    table?.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className={`p-2 font-semibold border border-slate-600`}
                          >
                            {header.isPlaceholder ? null : (
                              <div>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                </thead>
                <tbody className='divide-y divide-purple-700'>
                  {flatData.length >= 0 &&
                    table?.getRowModel().rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`transition duration-300 hover:bg-indigo-900 hover:bg-opacity-20 ${
                          index % 2 === 0
                            ? 'bg-gray-800 bg-opacity-10'
                            : 'bg-gray-900 bg-opacity-10'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className='p-2 border border-slate-700'
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          <div ref={ref} className='flex flex-row justify-center py-4'>
            {isFetchingNextPage ? <Spinner /> : <></>}
          </div>
          {/* {poolQuery.data?.hasNextPage && (
            <div className='mt-4 text-center'>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setPageSize((prev) => prev + 10);
                  console.log('page', page, pageSize);
                  queryClient.invalidateQueries({
                    queryKey: ['getPoolList', page, pageSize],
                  });
                }}
                disabled={!poolQuery.data.hasNextPage}
                className='cursor-pointer'
              >
                {poolQuery.isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )} */}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  SSRLiquidityPageProps
> = async () => {
  return {
    props: {
      swapForgeSecret: process.env.SWAPFORGE_WALLET_SECRET || '',
      network: process.env.SOLANA_NETWORK || '',
    },
  };
};

export default LiquidityPage;
