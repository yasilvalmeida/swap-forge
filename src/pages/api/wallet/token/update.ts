import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/libs/mongodb';
import {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/libs/constants/http';
import {
  WALLET_COLLECTION,
  TOKEN_COLLECTION,
  WalletDto,
  WalletTokenRequestDto,
  TokenAccountDto,
} from '@/libs/models/wallet';
import { ErrorResponseDto, SuccessResponseDto } from '@/libs/models';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponseDto | ErrorResponseDto>
) {
  try {
    if (req.method !== 'POST') {
      return res
        .status(HTTP_METHOD_NOT_ALLOWED)
        .json({ error: 'Method not allowed' });
    }

    const { walletAddress, tokenPublicKey, referralCode }: WalletTokenRequestDto =
      req.body;

    if (!walletAddress) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Wallet address is required' });
    }

    const referralWallet = await database
      .collection<WalletDto>(WALLET_COLLECTION)
      .findOne({
        referralCode,
      });
    let wallet = await database
      .collection<WalletDto>(WALLET_COLLECTION)
      .findOne({
        walletAddress,
      });

    if (!wallet) {
      const referralCode = uuidv4();
      await database.collection<WalletDto>(WALLET_COLLECTION).updateOne(
        { walletAddress },
        {
          $set: {
            walletAddress,
            referralCode,
            referralBy: referralWallet?.publicAddress,
          },
        },
        { upsert: true }
      );

      wallet = await database.collection<WalletDto>(WALLET_COLLECTION).findOne({
        walletAddress,
      });
    } 

    if (wallet) {
      await database.collection<TokenAccountDto>(TOKEN_COLLECTION).insertOne({
        walletId: wallet?._id,
        walletAddress,
        tokenPublicKey,
        createdAt: new Date(),
      });
    }

    return res
      .status(HTTP_SUCCESS)
      .json({ message: 'Update wallet token successful' });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
}
