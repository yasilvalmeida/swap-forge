import { Connection, clusterApiUrl, Cluster } from '@solana/web3.js';
import { useMemo } from 'react';

interface IProps {
  network: string;
}

const useConnection = ({ network }: IProps) => {
  const connection = useMemo(() => {
    return new Connection(clusterApiUrl(network as Cluster), 'confirmed');
  }, [network]);
  
  return { connection, network };
};

export default useConnection;
