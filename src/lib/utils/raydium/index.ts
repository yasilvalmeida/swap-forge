import { Connection } from '@solana/web3.js';
import {
  FetchPoolParams,
  PoolFetchType,
  Raydium,
} from '@raydium-io/raydium-sdk-v2';
import { toast } from 'react-toastify';

const raydium = await Raydium.load({
  connection: new Connection('https://api.mainnet-beta.solana.com'),
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
      return { ...pools };
    } else {
      const pools = await raydium.api.getPoolList({
        page: 1,
        pageSize: 10,
        type: PoolFetchType.All,
        sort: 'liquidity',
        order: 'desc',
      });
      return { ...pools, page: 1 };
    }
  } catch (error) {
    toast.error(`Error fetching pool list: ${JSON.stringify(error)}`);
  }
};

export { raydium, getPoolList };
