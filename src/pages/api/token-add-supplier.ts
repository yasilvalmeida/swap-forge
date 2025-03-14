import { NextApiRequest, NextApiResponse } from 'next';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js';
import {
  AuthorityType,
  createAccount,
  createSetAuthorityInstruction,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
/* import { createSignerFromKeypair, publicKey } from '@metaplex-foundation/umi'; */
import { ErrorResponseDto, SuccessResponseDto } from '@/lib/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { AddSupplierRequestDto } from '@/lib/models/token';
import { getConnection, /* getUmi */ } from '@/lib/utils/token';
import dotenv from 'dotenv';
import bs58 from 'bs58';

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
    /* const umi = getUmi(); */

    const swapForgeAuthority = Keypair.fromSecretKey(
      bs58.decode(process.env.NEXT_PUBLIC_SWAPFORGE_WALLET_SECRET || '')
    );

    /* const swapForgeSigner = createSignerFromKeypair(umi, {
      publicKey: publicKey(swapForgeAuthority.publicKey.toBase58()),
      secretKey: swapForgeAuthority.secretKey,
    }); */

    const tokenAccount = await createAccount(
      connection,
      swapForgeAuthority,
      mint,
      wallet,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    const amount = tokenSupply * LAMPORTS_PER_SOL;
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

    if (immutable) {
      /* await updateMetadataAccountV2(umi, {
        metadata: publicKey(mint),
        updateAuthority: swapForgeSigner,
        isMutable: false,
      }).sendAndConfirm(umi); */
    }

    const { blockhash } = await connection.getLatestBlockhash();

    transaction.recentBlockhash = blockhash;

    await sendAndConfirmTransaction(connection, transaction, [
      swapForgeAuthority,
    ]);

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
