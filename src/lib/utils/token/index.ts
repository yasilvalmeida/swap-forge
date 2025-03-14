import {
  Cluster,
  clusterApiUrl,
  Connection,
  Transaction,
} from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi';
import dotenv from 'dotenv';

dotenv.config();

export const getConnection = () => {
  const network: string = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  const connection = new Connection(
    clusterApiUrl(network as Cluster),
    'confirmed'
  );

  return connection;
};

export const getUmi = () => {
  const umi = createUmi();

  return umi;
};

export const deserializeTransaction = (
  serializedTransaction: Buffer<ArrayBufferLike>
) => {
  const buffer = Buffer.from(serializedTransaction);
  return Transaction.from(buffer);
};