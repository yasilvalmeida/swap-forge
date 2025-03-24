import { Connection, PublicKey } from '@solana/web3.js';
import {
  ApiV3PoolInfoItem,
  FetchPoolParams,
  PoolFetchType,
  Raydium,
} from '@raydium-io/raydium-sdk-v2';
import { toast } from 'react-toastify';
import dotenv from 'dotenv';

dotenv.config();

const raydium = await Raydium.load({
  connection: new Connection(
    'https://damp-muddy-isle.solana-mainnet.quiknode.pro/6f3f143081a2ab0946f82437bb7a3b050e7f36c1/'
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

const getPoolById = async (ids: string) => {
  try {
    const pools = await raydium.api.fetchPoolById({
      ids,
    });
    return pools;
  } catch (error) {
    toast.error(`Error fetching pool by id: ${JSON.stringify(error)}`);
  }
};

const getTokenList = async () => {
  try {
    const pools = await raydium.api.getTokenList();
    return pools;
  } catch (error) {
    toast.error(`Error fetching token list: ${JSON.stringify(error)}`);
  }
};

const getCreateLiquidityFee = async () => {
  try {
    const raydiumProgramId = process.env.NEXT_PUBLIC_RAYDIUM_PROGRAM_ID;
    if (!raydiumProgramId)
      throw Error('Invalid or not found Raydium Program ID');
    const fee = await raydium.liquidity.getCreatePoolFee({
      programId: new PublicKey(raydiumProgramId),
    });
    return fee;
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message);
    }
  }
};

const lockLiquidity = async (pool: ApiV3PoolInfoItem) => {
  console.log('pool', pool);
  /* await raydium.cpmm.lockLp() */
};

export {
  raydium,
  getPoolList,
  getPoolById,
  getTokenList,
  getCreateLiquidityFee,
  lockLiquidity,
};
