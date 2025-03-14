import { NextApiRequest, NextApiResponse } from 'next';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import {
  CreateTokenRequestDto,
  CreateTokenResponseDto,
  MetadataDto,
} from '@/lib/model/token/create';
import { ErrorResponseDto } from '@/lib/model';
import {
  HTTP_FORBIDDEN,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { getConnection } from '@/lib/utils/token';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateTokenResponseDto | ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ error: 'Method not allowed' });
  }

  const formData: CreateTokenRequestDto = req.body;

  const {
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenSupply,
    tokenLogo,
    tokenDescription,
    tags,
    customCreatorInfo,
    creatorName,
    creatorWebsite,
    createSocial,
    socialWebsite,
    socialTwitter,
    socialTelegram,
    socialDiscord,
    socialInstagram,
    socialFacebook,
    tokenFee,
    swapForgePublicKey,
    walletPublicKey,
    mintPublicKey,
  } = formData;

  const swapForge = new PublicKey(swapForgePublicKey);
  const wallet = new PublicKey(walletPublicKey);
  const mint = new PublicKey(mintPublicKey);

  if (!walletPublicKey) {
    return res.status(HTTP_NOT_FOUND).json({ error: 'Wallet not connected' });
  }
  try {
    const connection = getConnection();
    console.log(' Authority Address: ', swapForge.toBase58());
    const swapForgeBalance = await connection.getBalance(swapForge);
    console.log(
      ` Authority balance: ${swapForgeBalance / LAMPORTS_PER_SOL} SOL`
    );

    console.log(' Wallet Address: ', wallet.toBase58());

    const walletBalance = await connection.getBalance(wallet);
    console.log(` Wallet balance: ${walletBalance / LAMPORTS_PER_SOL} SOL`);

    console.log(' Mint Address: ', mint.toBase58());

    if (walletBalance / LAMPORTS_PER_SOL < tokenFee) {
      return res
        .status(HTTP_FORBIDDEN)
        .json({ error: 'Insufficient balance!' });
    }

    const transferFeesInstruction = SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: swapForge,
      lamports: LAMPORTS_PER_SOL * tokenFee,
    });

    const totalSuppliers = tokenSupply * LAMPORTS_PER_SOL;
    console.log('totalSuppliers', totalSuppliers);

    // Store and retrieve uri of image
    const imageUrl = tokenLogo;

    const metadata: MetadataDto = {
      name: tokenName,
      symbol: tokenSymbol,
      description: tokenDescription,
      image: imageUrl,
      tags,
    };
    if (tags?.length > 0) {
      metadata['tags'] = tags;
    }
    if (customCreatorInfo) {
      metadata['creator'] = { name: creatorName, site: creatorWebsite };
    }
    if (createSocial) {
      metadata['website'] = socialWebsite;
      metadata['twitter'] = socialTwitter;
      metadata['telegram'] = socialTelegram;
      metadata['discord'] = socialDiscord;
      metadata['facebook'] = socialFacebook;
      metadata['instragram'] = socialInstagram;
    }
    // Store json file and retrieve uri of metadata
    console.log('metadata', metadata.name);

    const tokenMetadata: TokenMetadata = {
      updateAuthority: undefined,
      mint: mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: 'metadataUri',
      additionalMetadata: [],
    };

    const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
    const metadataLen = pack(tokenMetadata).length;
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataExtension + metadataLen
    );

    // Instruction to invoke System Program to create new account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: swapForge,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint,
        swapForge,
        mint,
        TOKEN_2022_PROGRAM_ID
      );

    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      updateAuthority: swapForge,
      mint,
      mintAuthority: swapForge,
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      uri: tokenMetadata.uri,
    });

    // Instruction to initialize Mint Account data
    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      tokenDecimals,
      swapForge,
      swapForge,
      TOKEN_2022_PROGRAM_ID
    );

    /* Start Transfer fee from Wallet to Swap Forge Wallet */
    const transactions = new Transaction().add(
      transferFeesInstruction,
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction
    );

    const { blockhash } = await connection.getLatestBlockhash();

    transactions.recentBlockhash = blockhash;
    transactions.feePayer = swapForge;

    const serializedTransaction = transactions.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return res.status(HTTP_SUCCESS).json({
      serializedTransaction,
    });
  } catch (error) {
    console.log('error', error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create token' });
  }
}
