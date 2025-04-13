import { Connection } from '@solana/web3.js';
import {
  FetchPoolParams,
  PoolFetchType,
  Raydium,
  SwapParam,
} from '@raydium-io/raydium-sdk-v2';
import { toast } from 'react-toastify';
import dotenv from 'dotenv';

dotenv.config();

const raydium = await Raydium.load({
  connection: new Connection(
    process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || 'https://api.devnet.solana.com'
  ),
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

const swapToken = async ({
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
}

export {
  raydium,
  getPoolList,
  swapToken
};
