import { Connection, PublicKey } from '@solana/web3.js';
import {
  FetchPoolParams,
  PoolFetchType,
  Raydium,
  TxVersion,
} from '@raydium-io/raydium-sdk-v2';
import { toast } from 'react-toastify';

export const txVersion = TxVersion.V0;

const getOwner = (): PublicKey => {
  const publicKey = process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY;
  if (!publicKey) {
    if (typeof window === 'undefined') {
      throw new Error('Server-side environment variable missing');
    }
    throw new Error('Wallet configuration error - please refresh the page');
  }
  return new PublicKey(publicKey);
};

const getRaydium = async () => {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || 'https://api.devnet.solana.com'
  );

  return Raydium.load({
    owner: getOwner(),
    connection,
    cluster: 'devnet',
    disableFeatureCheck: true,
    blockhashCommitment: 'finalized',
  });
};

const getPoolList = async (props?: FetchPoolParams) => {
  try {
    const raydium = await getRaydium();
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

export {
  getPoolList,
};
