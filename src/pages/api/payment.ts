import { NextApiRequest, NextApiResponse } from 'next';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { ErrorResponseDto } from '@/lib/models';
import { PaymentRequestDto, PaymentResponseDto } from '@/lib/models/payment';
import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { getConnection } from '@/lib/utils/token';
import dotenv from 'dotenv';
import bs58 from 'bs58';

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponseDto | ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ error: 'Method not allowed' });
  }

  const formData: PaymentRequestDto = req.body;

  const { tokenFee, walletPublicKey } = formData;

  const wallet = new PublicKey(walletPublicKey);

  if (!walletPublicKey) {
    return res.status(HTTP_NOT_FOUND).json({ error: 'Wallet not connected' });
  }

  const privateKey = process.env.SWAPFORGE_WALLET_SECRET;
  if (!privateKey) {
    return res.status(HTTP_NOT_FOUND).json({ error: 'Missing private key' });
  }

  try {
    const connection = getConnection();

    const walletBalance = await connection.getBalance(wallet);

    if (
      process.env.NODE_ENV === 'production' &&
      walletBalance / LAMPORTS_PER_SOL < tokenFee
    ) {
      return res
        .status(HTTP_FORBIDDEN)
        .json({ error: 'Insufficient balance!' });
    }

    const swapForgeAuthority = Keypair.fromSecretKey(bs58.decode(privateKey));

    // Create payment instruction
    const transferFeesInstruction = SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: swapForgeAuthority.publicKey,
      lamports: LAMPORTS_PER_SOL * tokenFee,
    });

    /* Start Transfer fee from Wallet to Swap Forge Wallet */
    const transactions = new Transaction().add(transferFeesInstruction);

    const { blockhash } = await connection.getLatestBlockhash();

    transactions.recentBlockhash = blockhash;
    transactions.feePayer = wallet;

    const serializedTransaction = transactions.serialize({
      requireAllSignatures: true,
      verifySignatures: false,
    });

    return res.status(HTTP_SUCCESS).json({
      serializedTransaction,
    });
  } catch (error) {
    console.log('error', error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create payment' });
  }
}
