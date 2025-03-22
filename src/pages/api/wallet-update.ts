import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/mongodb';
import {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import {
  WALLET_COLLECTION,
  WalletDto,
  WalletRequestDto,
} from '@/lib/models/wallet';
import { ErrorResponseDto, SuccessResponseDto } from '@/lib/models';
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

    const { walletAddress, referralCode }: WalletRequestDto = req.body;

    if (!walletAddress) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: 'Wallet address is required' });
    }

    const [referralWallet, wallet] = await Promise.all([
      database.collection<WalletDto>(WALLET_COLLECTION).findOne({
        referralCode,
      }),
      database.collection<WalletDto>(WALLET_COLLECTION).findOne({
        walletAddress,
      }),
    ]);

    if (!wallet) {
      const referralCode = uuidv4();
      await database.collection<WalletRequestDto>(WALLET_COLLECTION).updateOne(
        { walletAddress },
        {
          $set: {
            walletAddress,
            referralCode,
            referralBy: referralWallet?.publicAddress,
          },
          $inc: { tokensCreated: 1 },
        },
        { upsert: true }
      );
    } else {
      await database.collection<WalletRequestDto>(WALLET_COLLECTION).updateOne(
        { walletAddress },
        {
          $inc: { tokensCreated: 1 },
        },
        { upsert: true }
      );
    }

    return res
      .status(HTTP_SUCCESS)
      .json({ message: 'Update wallet successful' });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
}
