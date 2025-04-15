import {
  Cluster,
  clusterApiUrl,
  Connection,
  Transaction,
} from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

export const getConnection = () => {
  const network: string = process.env.SOLANA_NETWORK || 'devnet';

  const connection = new Connection(
    clusterApiUrl(network as Cluster),
    'confirmed'
  );

  return connection;
};

export const deserializeTransaction = (
  serializedTransaction: Buffer<ArrayBufferLike>
) => {
  const buffer = Buffer.from(serializedTransaction);
  return Transaction.from(buffer);
};