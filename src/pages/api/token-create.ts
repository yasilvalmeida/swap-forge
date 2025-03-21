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
  createInitializeInstruction,
  createUpdateAuthorityInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata';
import {
  AuthorityType,
  createAccount,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import {
  CreateTokenRequestDto,
  CreateTokenResponseDto,
  MetadataDto,
} from '@/lib/models/token';
import { ErrorResponseDto } from '@/lib/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_NOT_FOUND,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { getConnection } from '@/lib/utils/token';
import {
  uploadMediaToCloudinary,
  uploadRawToCloudinary,
} from '@/lib/utils/cloudinary';
import dotenv from 'dotenv';
import bs58 from 'bs58';
import { sleep } from '@raydium-io/raydium-sdk-v2';
import { MAX_TIMEOUT_TOKEN_MINT } from '@/lib/constants/create-token';

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
    tokenLogo,
    tokenDescription,
    tokenSupply,
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
    revokeMint,
    revokeFreeze,
    immutable,
    walletPublicKey,
  } = formData;

  const mint = Keypair.generate();

  if (!walletPublicKey) {
    return res.status(HTTP_NOT_FOUND).json({ error: 'Wallet not connected' });
  }

  const privateKey = process.env.SWAPFORGE_WALLET_SECRET;
  if (!privateKey) {
    return res.status(HTTP_NOT_FOUND).json({ error: 'Missing private key' });
  }
  try {
    const connection = getConnection();

    const wallet = new PublicKey(walletPublicKey);

    const swapForgeAuthority = Keypair.fromSecretKey(bs58.decode(privateKey));

    // Store and retrieve uri of image
    const imageUrl = await uploadMediaToCloudinary(tokenLogo);

    const metadata: MetadataDto = {
      name: tokenName,
      symbol: tokenSymbol,
      description: tokenDescription,
      image: imageUrl,
      tags,
      creator: { name: creatorName, site: creatorWebsite },
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
    const metadataJsonString = JSON.stringify(metadata); // Convert object to JSON string
    const matedataBase64 = Buffer.from(metadataJsonString).toString('base64');
    const metadataUrl = await uploadRawToCloudinary(matedataBase64);

    const tokenMetadata: TokenMetadata = {
      updateAuthority: undefined,
      mint: mint.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUrl,
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
      fromPubkey: swapForgeAuthority.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    // Instruction to initialize the MetadataPointer Extension
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mint.publicKey,
        swapForgeAuthority.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      );

    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint.publicKey,
      updateAuthority: swapForgeAuthority.publicKey,
      mint: mint.publicKey,
      mintAuthority: swapForgeAuthority.publicKey,
      name: tokenMetadata.name,
      symbol: tokenMetadata.symbol,
      uri: tokenMetadata.uri,
    });

    // Instruction to initialize Mint Account data
    const initializeMintInstruction = createInitializeMintInstruction(
      mint.publicKey,
      tokenDecimals,
      swapForgeAuthority.publicKey,
      swapForgeAuthority.publicKey,
      TOKEN_2022_PROGRAM_ID
    );

    /* Start Transfer fee from Wallet to Swap Forge Wallet */
    const transactions = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction
    );

    let blockhash = (await connection.getLatestBlockhash()).blockhash;

    transactions.recentBlockhash = blockhash;
    transactions.feePayer = swapForgeAuthority.publicKey;

    let signature = await sendAndConfirmTransaction(connection, transactions, [
      swapForgeAuthority,
      mint,
    ]);

    await sleep(1000);

    const tokenAccount = await createAccount(
      connection,
      swapForgeAuthority,
      mint.publicKey,
      wallet,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );

    let amount = 0;

    if (Number(tokenDecimals) === 6) {
      amount = (tokenSupply * LAMPORTS_PER_SOL) / 1000;
    } else {
      amount = tokenSupply * LAMPORTS_PER_SOL;
    }

    await sleep(MAX_TIMEOUT_TOKEN_MINT);

    await mintTo(
      connection,
      swapForgeAuthority,
      mint.publicKey,
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
          metadata: mint.publicKey,
          oldAuthority: swapForgeAuthority.publicKey,
          newAuthority: null,
        }
      );

      transaction.add(revokeUpdateAuthorityInstruction);
    }

    if (revokeFreeze) {
      const revokeFreezeAuthorityInstruction = createSetAuthorityInstruction(
        mint.publicKey,
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
        mint.publicKey,
        swapForgeAuthority.publicKey,
        AuthorityType.MintTokens,
        null,
        [],
        TOKEN_2022_PROGRAM_ID
      );

      transaction.add(revokeMintAuthorityInstruction);
    }

    blockhash = (await connection.getLatestBlockhash()).blockhash;

    transaction.recentBlockhash = blockhash;

    signature = await sendAndConfirmTransaction(connection, transaction, [
      swapForgeAuthority,
    ]);

    return res.status(HTTP_SUCCESS).json({
      signature,
      mintPublicKey: mint.publicKey.toBase58(),
    });
  } catch (error) {
    console.log('error', error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Failed to create token' });
  }
}
