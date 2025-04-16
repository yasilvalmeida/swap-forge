'use client'

import dynamic from 'next/dynamic';
import WalletButton from '@/components/ui/wallet-button';
import dotenv from 'dotenv';
import { useEffect, useMemo, useState } from 'react';
import { getPoolList } from '@/libs/utils/raydium';
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
import { formatNumber } from '@/libs/utils';
import { /* ArrowLeftRight, */ FilterIcon, FilterX, /* PlusIcon */ } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { LiquidityPoolSortDto } from '@/libs/models/liquidity';
import { isMobile } from 'react-device-detect';
/* import { useWallet } from '@solana/wallet-adapter-react';
import { SwapTokenModal } from '@/components/ui/swap/swap-modal'; */

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

function LiquidityPage() {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  /* const { connected, publicKey } = useWallet(); */

  const queryClient = useQueryClient();

  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [type, setType] = useState<PoolFetchType>(PoolFetchType.All);
  const [sort, setSort] = useState<LiquidityPoolSortDto>('liquidity');
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>('desc');
  const [period, setPeriod] = useState<string>('24H');
  /* const [openSwap, setOpenSwap] = useState<boolean>(false); */
  /* const [poolInfoBaseItem, setPoolInfoBaseItem] = useState<ApiV3PoolInfoItem>(); */

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
              <div className='relative h-6 w-6'>
                {info?.row?.original?.mintA?.logoURI && (
                  <Image
                    src={info?.row?.original?.mintA?.logoURI}
                    alt={info?.row?.original?.mintA?.name}
                    width={20}
                    height={20}
                    className='h-full w-full rounded-full border-2 border-indigo-900 shadow-lg'
                  />
                )}
              </div>
              <div className='relative -ml-2 h-6 w-6'>
                {info?.row?.original?.mintB?.logoURI && (
                  <Image
                    src={info?.row?.original?.mintB?.logoURI}
                    alt={info?.row?.original?.mintB?.name}
                    width={20}
                    height={20}
                    className='h-full w-full rounded-full border-2 border-indigo-900 shadow-lg'
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
          <span className='flex justify-end text-sm'>Volume {period}</span>
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
        header: () => <span className='flex justify-end text-sm'>Fee {period}</span>,
        cell: (info) => (
          <span className='flex justify-end text-sm'>
            ${formatNumber(`${info.getValue()}`)}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.day.apr, {
        id: 'day.apr',
        enableSorting: false,
        header: () => <span className='flex justify-end text-sm'>APR {period}</span>,
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
      /* columnHelper.accessor((row) => row, {
        id: 'actions',
        enableSorting: false,
        header: () => <span className='text-sm'>Swap</span>,
        cell: (info) => (
          <div className='flex justify-center' vocab={info.row.original.id}>
            <Button
              className='bg-primary hover:bg-primary-hover cursor-pointer rounded-md px-2 py-1 leading-6 text-white shadow-sm'
              onClick={() => {
                setOpenSwap(true);
                setPoolInfoBaseItem(info.row.original)
              }}
            >
              <ArrowLeftRight className='h-4 w-4' />
            </Button>
          </div>
        ),
      }), */
    ],
    [columnHelper, period]
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
    queryClient.invalidateQueries({
      queryKey: ['getPoolList', type, sort, order],
    });
  }, [type, sort, order, queryClient]);

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header
        isLanding={false}
        title='Liquidity'
        subtitle='Revolutionize Your DeFi Experience – Build and Control Liquidity Pools in Just a Few Clicks!'
      />

      <Navbar />

      <div className='absolute right-4 top-4'>
        <WalletButton />
      </div>

      {/* <SwapTokenModal open={openSwap} setOpen={setOpenSwap} poolInfoBaseItem={poolInfoBaseItem} /> */}

      <section className='bg-gray-800 px-4 py-2'>
        <div className='mx-auto md:max-w-6xl'>
          <div className={`my-2 flex justify-between gap-2 md:flex-row ${showFilter && 'flex-col'}`}>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setShowFilter((prev) => !prev);
                }}
                className={`cursor-pointer ${!showFilter || !isMobile ? 'w-32' : 'w-full'}`}
              >
                {showFilter ? (
                  <FilterX className='h-5 w-4' />
                ) : (
                  <FilterIcon className='h-4 w-4' />
                )}
                Filters
              </Button>
              {showFilter && (
                <div className='border-1 flex w-full flex-col gap-2 rounded border-purple-900 p-2 md:flex-row'>
                  <div className='flex flex-col gap-2'>
                    <span className='flex flex-row justify-center'>
                      <Label>Type</Label>
                    </span>
                    <div className='flex flex-col gap-2 md:flex-row'>
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
                  <div className='flex flex-col justify-between gap-1 md:flex-row'>
                    <div className='flex flex-col gap-2'>
                      <span className='flex flex-row justify-center'>
                        <Label>Sort</Label>
                      </span>
                      <Select
                        onValueChange={(value) => {
                          if (value.includes('24h')) {
                            setPeriod('24H');
                          } else if (value.includes('7d')) {
                            setPeriod('7D');
                          } else if (value.includes('30d')) {
                            setPeriod('30D');
                          }
                          setSort(value as LiquidityPoolSortDto)
                        }}
                        defaultValue={sort}
                      >
                        <SelectTrigger className={`${showFilter ? 'w-full' : 'w-[280px]'}`}>
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
                        <SelectTrigger className={`${showFilter ? 'w-full' : 'w-[280px]'}`}>
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
            {/* <span>
              {connected && publicKey && <Button
                onClick={(e) => {
                  e.preventDefault();
                }}
                className={`cursor-pointer ${!showFilter ? 'w-32' : 'w-full'}`}
              >
                <PlusIcon className='h-4 w-4' />
                Create
              </Button>}
            </span> */}
          </div>
          <div className='relative overflow-hidden rounded-lg border border-purple-900 shadow-lg'>
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
                            className={`border border-slate-600 p-2 font-semibold`}
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
                            className='border border-slate-700 p-2'
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
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LiquidityPage;
