import { NextApiRequest, NextApiResponse } from 'next';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  AuthorityType,
  createAccount,
  createSetAuthorityInstruction,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  createUpdateAuthorityInstruction,
} from '@solana/spl-token';
import { ErrorResponseDto, SuccessResponseDto } from '@/lib/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { AddSupplierRequestDto } from '@/lib/models/token';
import { getConnection } from '@/lib/utils/token';
import { sleep } from '@/lib/utils';
import { database } from '@/lib/mongodb';
import {
  WALLET_COLLECTION,
  WalletDto,
  WalletRequestDto,
} from '@/lib/models/wallet';
import dotenv from 'dotenv';
import bs58 from 'bs58';
import { MAX_TIMEOUT_TOKEN_MINT } from '@/lib/constants/create-token';

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponseDto | ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ error: 'Method not allowed' });
  }

  const formData: AddSupplierRequestDto = req.body;

  const {
    revokeMint,
    revokeFreeze,
    immutable,
    tokenSupply,
    tokenFee,
    walletPublicKey,
    mintPublicKey,
  } = formData;

  const wallet = new PublicKey(walletPublicKey);
  const mint = new PublicKey(mintPublicKey);

  if (!walletPublicKey) {
    return res.status(HTTP_NOT_FOUND).json({ error: 'Wallet not connected' });
  }
  try {
    const connection = getConnection();

    const swapForgeAuthority = Keypair.fromSecretKey(
      bs58.decode(process.env.SWAPFORGE_WALLET_SECRET || '')
    );

    await sleep(MAX_TIMEOUT_TOKEN_MINT);
    const tokenAccount = await createAccount(
      connection,
      swapForgeAuthority,
      mint,
      wallet,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const amount = (tokenSupply * LAMPORTS_PER_SOL) / 1000;
    await sleep(MAX_TIMEOUT_TOKEN_MINT);
    await mintTo(
      connection,
      swapForgeAuthority,
      mint,
      tokenAccount,
      swapForgeAuthority,
      amount,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction();

    if (immutable) {
      const revokeUpdateAuthorityInstruction = createUpdateAuthorityInstruction(
        {
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          oldAuthority: swapForgeAuthority.publicKey,
          newAuthority: null,
        }
      );

      transaction.add(revokeUpdateAuthorityInstruction);
    }

    if (revokeFreeze) {
      const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(
        mint,
        swapForgeAuthority.publicKey,
        AuthorityType.FreezeAccount,
        null,
        [],
        TOKEN_2022_PROGRAM_ID
      );

      transaction.add(revokeFreezeAuthorityInstruction);
    }

    if (revokeMint) {
      const revokeMintAuthorityInstruction = createSetAuthorityInstruction(
        mint,
        swapForgeAuthority.publicKey,
        AuthorityType.MintTokens,
        null,
        [],
        TOKEN_2022_PROGRAM_ID
      );

      transaction.add(revokeMintAuthorityInstruction);
    }

    const transferFeesInstruction = SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: swapForgeAuthority.publicKey,
      lamports:
        process.env.NODE_ENV === 'production' ? LAMPORTS_PER_SOL * tokenFee : 0,
    });
    transaction.add(transferFeesInstruction);

    const { blockhash } = await connection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;

    const [, storedWallet] = await Promise.all([
      await sendAndConfirmTransaction(connection, transaction, [
        swapForgeAuthority,
      ]),
      database.collection<WalletDto>(WALLET_COLLECTION).findOne({
        walletAddress: walletPublicKey,
      }),
    ]);

    await database.collection<WalletRequestDto>(WALLET_COLLECTION).updateOne(
      { _id: storedWallet?._id },
      {
        $inc: { tokensCreated: 1 },
      },
      { upsert: true }
    );

    return res.status(HTTP_SUCCESS).json({
      message: 'Mint Success',
    });
  } catch (error) {
    console.log('error', error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to add supplier' });
  }
}
