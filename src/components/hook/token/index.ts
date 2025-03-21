import { Connection } from '@solana/web3.js';
import { useMemo } from 'react';
import dotenv from 'dotenv';

dotenv.config();

const useConnection = (endpoint: string) => {
  const connection = useMemo(() => {
    return new Connection(endpoint, 'confirmed');
  }, [endpoint]);

  return { connection };
};

export default useConnection;
