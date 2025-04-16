import { Connection, PublicKey } from '@solana/web3.js';
import {
  ComputePoolType,
  FetchPoolParams,
  PoolFetchType,
  Raydium,
  Router,
  toApiV3Token,
  toFeeConfig,
  Token,
  TokenAmount,
  TxVersion,
} from '@raydium-io/raydium-sdk-v2';
import { toast } from 'react-toastify';
import dotenv from 'dotenv';
import { NATIVE_MINT, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
/* import { readCachePoolData, writeCachePoolData } from './cache'; */

dotenv.config();
console.log('process.env.TREASURY_KEY', process.env.TREASURY_KEY)
export const owner: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY as string);

const poolType: Record<number, string> = {
  4: 'AMM',
  5: 'AMM Stable',
  6: 'CLMM',
  7: 'CPMM',
};

export const txVersion = TxVersion.V0;

const raydium = await Raydium.load({
  owner,
  connection: new Connection(
    process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || 'https://api.devnet.solana.com'
  ),
  cluster: 'devnet',
  disableFeatureCheck: true,
  blockhashCommitment: 'finalized',
});

const getPoolList = async (props?: FetchPoolParams) => {
  try {
    if (props) {
      const { page, pageSize, type, sort, order } = props;
      const pools = await raydium.api.getPoolList({
        page,
        pageSize,
        type,
        sort,
        order,
      });
      return {
        ...pools,
        data: pools.data?.filter(
          (pool) => pool.mintA.name.length > 0 && pool.mintB.name.length > 0
        ),
      };
    } else {
      const pools = await raydium.api.getPoolList({
        page: 1,
        pageSize: 10,
        type: PoolFetchType.All,
        sort: 'liquidity',
        order: 'desc',
      });
      return { ...pools };
    }
  } catch (error) {
    toast.error(`Error fetching pool list: ${JSON.stringify(error)}`);
  }
};

export const printSimulateInfo = () => {
  console.log(
    'you can paste simulate tx string here: https://explorer.solana.com/tx/inspector and click simulate to check transaction status'
  )
  console.log(
    'if tx simulate successful but did not went through successfully after running execute(xxx), usually means your txs were expired, try set up higher priority fees'
  )
  console.log('strongly suggest use paid rpcs would get you better performance')
}

async function routeSwap() {
  await raydium.fetchChainTime()

  const inputAmount = '8000000'
  const SOL = NATIVE_MINT
  const [inputMint, outputMint] = [SOL, new PublicKey('7i5XE77hnx1a6hjWgSuYwmqdmLoDJNTU1rYA6Gqx7QiE')]
  const [inputMintStr, outputMintStr] = [inputMint.toBase58(), outputMint.toBase58()]

  // strongly recommend cache all pool data, it will reduce lots of data fetching time
  // code below is a simple way to cache it, you can implement it with any other ways
  // let poolData = readCachePoolData() // initial cache time is 10 mins(1000 * 60 * 10), if wants to cache longer, set bigger number in milliseconds
  /* let poolData = readCachePoolData(1000 * 60 * 60 * 24 * 10); // example for cache 1 day
  if (poolData.ammPools.length === 0) {
    console.log(
      '**Please ensure you are using "paid" rpc node or you might encounter fetch data error due to pretty large pool data**'
    )
    console.log('fetching all pool basic info, this might take a while (more than 1 minutes)..')
    poolData = await raydium.tradeV2.fetchRoutePoolBasicInfo()
    // devent pool info
    // fetchRoutePoolBasicInfo({
    //   amm: DEVNET_PROGRAM_ID.AmmV4,
    //   clmm: DEVNET_PROGRAM_ID.CLMM,
    //   cpmm: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
    // })
    writeCachePoolData(poolData)
  } */
  const poolData = await raydium.tradeV2.fetchRoutePoolBasicInfo();
  

  console.log('computing swap route..')
  // route here also can cache for a time period by pair to reduce time
  // e.g.{inputMint}-${outputMint}'s routes, if poolData don't change, routes should be almost same
  const routes = raydium.tradeV2.getAllRoute({
    inputMint,
    outputMint,
    ...poolData,
  })

  // data here also can try to cache if you wants e.g. mintInfos
  // but rpc related info doesn't suggest to cache it for a long time, because base/quote reserve and pool price change by time
  const {
    routePathDict,
    mintInfos,
    ammPoolsRpcInfo,
    ammSimulateCache,

    clmmPoolsRpcInfo,
    computeClmmPoolInfo,
    computePoolTickData,

    computeCpmmData,
  } = await raydium.tradeV2.fetchSwapRoutesData({
    routes,
    inputMint,
    outputMint,
  })

  console.log('calculating available swap routes...')
  const swapRoutes = raydium.tradeV2.getAllRouteComputeAmountOut({
    inputTokenAmount: new TokenAmount(
      new Token({
        mint: inputMintStr,
        decimals: mintInfos[inputMintStr].decimals,
        isToken2022: mintInfos[inputMintStr].programId.equals(TOKEN_2022_PROGRAM_ID),
      }),
      inputAmount
    ),
    directPath: routes.directPath.map(
      (p) =>
        ammSimulateCache[p.id.toBase58()] || computeClmmPoolInfo[p.id.toBase58()] || computeCpmmData[p.id.toBase58()]
    ),
    routePathDict,
    simulateCache: ammSimulateCache,
    tickCache: computePoolTickData,
    mintInfos: mintInfos,
    outputToken: toApiV3Token({
      ...mintInfos[outputMintStr],
      programId: mintInfos[outputMintStr].programId.toBase58(),
      address: outputMintStr,
      freezeAuthority: undefined,
      mintAuthority: undefined,
      extensions: {
        feeConfig: toFeeConfig(mintInfos[outputMintStr].feeConfig),
      },
    }),
    chainTime: Math.floor(raydium.chainTimeData?.chainTime ?? Date.now() / 1000),
    slippage: 0.005, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    epochInfo: await raydium.connection.getEpochInfo(),
  })

  // swapRoutes are sorted by out amount, so first one should be the best route
  const targetRoute = swapRoutes[0]
  if (!targetRoute) throw new Error('no swap routes were found')

  console.log('best swap route:', {
    input: targetRoute.amountIn.amount.toExact(),
    output: targetRoute.amountOut.amount.toExact(),
    minimumOut: targetRoute.minAmountOut.amount.toExact(),
    swapType: targetRoute.routeType,
    routes: targetRoute.poolInfoList.map((p: ComputePoolType) => `${poolType[p.version]} ${p.id} ${p.mintA} ${p.mintB}`).join(` -> `),
  })

  console.log('fetching swap route pool keys..')
  const poolKeys = await raydium.tradeV2.computePoolToPoolKeys({
    pools: targetRoute.poolInfoList,
    ammRpcData: ammPoolsRpcInfo,
    clmmRpcData: clmmPoolsRpcInfo,
  })

  console.log('build swap tx..')
  const { execute } = await raydium.tradeV2.swap({
    routeProgram: Router,
    txVersion,
    swapInfo: targetRoute,
    swapPoolKeys: poolKeys,
    ownerInfo: {
      associatedOnly: true,
      checkCreateATAOwner: true,
    },
    computeBudgetConfig: {
      units: 600000,
      microLamports: 465915,
    },
  })

  // printSimulate(transactions)

  printSimulateInfo()
  console.log('execute tx..')
  // sequentially should always to be true because first tx does initialize token accounts needed for swap
  const { txIds } = await execute({ sequentially: true })
  console.log('txIds:', txIds)
  txIds.forEach((txId) => console.log(`https://explorer.solana.com/tx/${txId}`))

  process.exit() // if you don't want to end up node execution, comment this line
}

/* const swapToken = async ({
  poolInfo,
  poolKeys,
  amountIn,
  amountOut,
  inputMint,
  fixedSide,
  txVersion,
  config,
  computeBudgetConfig,
  txTipConfig,
  feePayer
  }: SwapParam) => {
  try {
    const raydium = await Raydium.load({
      owner: feePayer,
      connection: new Connection(
        process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || 'https://api.devnet.solana.com'
      ),
    });
    const swapTx = await raydium.liquidity.swap({
      poolInfo,
      poolKeys,
      amountIn,
      amountOut,
      inputMint,
      fixedSide,
      txVersion,
      config,
      computeBudgetConfig,
      txTipConfig,
      feePayer
    });
    console.log('swapTx', swapTx)
    return swapTx
  } catch (error) {
    console.log('error', error)
    if (error instanceof Error) {
      toast.error(error.message);
    }
  }
} */

export {
  getPoolList,
  routeSwap
};
