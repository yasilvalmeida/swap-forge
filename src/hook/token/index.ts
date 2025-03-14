import { Connection, clusterApiUrl, Cluster } from '@solana/web3.js';
import { useMemo } from 'react';

const useConnection = () => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  const connection = useMemo(() => {
    return new Connection(clusterApiUrl(network as Cluster), 'confirmed');
  }, [network]);

  return { connection, network };
};

export default useConnection;
