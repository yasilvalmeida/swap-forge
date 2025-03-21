import { Connection } from '@solana/web3.js';
import {
  FetchPoolParams,
  PoolFetchType,
  Raydium,
} from '@raydium-io/raydium-sdk-v2';
import { toast } from 'react-toastify';

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

export { raydium, getPoolList, getPoolById, getTokenList };
