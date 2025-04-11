import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';
import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { TOKEN_METADATA_PROGRAM_ID } from '@/libs/constants/token';
import * as anchor from '@coral-xyz/anchor';
import { TokenContract } from '../../../../smart-contract/token/types/token_contract';
import idl from '../../../../smart-contract/token/idl/token_contract.json';


let tx: string;
const RPC_URL: string = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || 'https://api.devnet.solana.com';

export const getProvider = (
  publicKey: PublicKey,
  sendTransaction: (transaction: Transaction | VersionedTransaction, connection: Connection, options?: SendTransactionOptions) => Promise<TransactionSignature>,
  signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>): Program<TokenContract> | null => { 
  
  if (!publicKey || !signTransaction) {
    console.log('Wallet not connected or missing signTransaction')
    return null;
  }

  const connection = new Connection(RPC_URL);
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: 'processed'}
  )

  return new Program<TokenContract>(idl as unknown, provider);
}

export const getProviderReadonly = (): Program<TokenContract> | null => { 
  
  const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error('Read-only provider cannont sign transaction.')
    },
    signAllTransaction: async () => {
      throw new Error('Read-only provider cannont sign any transaction.')
    }
  }

  const connection = new Connection(RPC_URL);
  const provider = new AnchorProvider(
    connection,
    wallet as unknown as Wallet,
    { commitment: 'processed'}
  )

  return new Program<TokenContract>(idl as unknown, provider);
}

export const createTokenFromContract = async (
  program: Program<TokenContract>,
  walletPublicKey: PublicKey,
  name: string,
  symbol: string,
  decimals: number,
  suppliy: BN,
  uri: string,
  isRevokeMint: boolean,
  isRevokeFreeze: boolean,
  isRevokeUpdate: boolean
): Promise<{ tx: TransactionSignature, mint: string }> => {
  const mintKeypair = anchor.web3.Keypair.generate();

  const [metadata] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('metadata'),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    mintKeypair.publicKey.toBuffer(),
  ],
    TOKEN_METADATA_PROGRAM_ID);
  
  const transaction = await program.methods
    .createToken(
      name,
      symbol,
      decimals,
      uri,
      suppliy,
      isRevokeMint,
      isRevokeFreeze,
      isRevokeUpdate
    )
    .accounts({
      payer: walletPublicKey,
      mint: mintKeypair.publicKey,
      metadata,
    })
    .transaction();
  
  // Get connection
  const latestBlockHash = await program.provider.connection.getLatestBlockhash();
  // Set transaction parameters
  transaction.feePayer = walletPublicKey;
  transaction.recentBlockhash = latestBlockHash.blockhash;
  transaction.sign(mintKeypair)

  // Sign the transaction
  const signedTx = await program.provider.wallet!.signTransaction(transaction);

  // Send and confirm the transaction
  const rawTransaction = signedTx.serialize();
  tx = await program.provider.connection.sendRawTransaction(rawTransaction);

  await program.provider.connection.confirmTransaction({
    signature: tx,
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  });
  
  return { tx, mint: mintKeypair.publicKey.toBase58() };
}