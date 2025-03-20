import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/mongodb';
import {
  WALLET_COLLECTION,
  WalletDto,
  WalletListResponseDto,
} from '@/lib/models/wallet';
import { ErrorResponseDto } from '@/lib/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/lib/constants/http';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WalletListResponseDto | ErrorResponseDto>
) {
  try {
    if (req.method !== 'GET') {
      return res
        .status(HTTP_METHOD_NOT_ALLOWED)
        .json({ error: 'Method not allowed' });
    }

    const wallets = await database
      .collection<WalletDto>(WALLET_COLLECTION)
      .find()
      .toArray();
    return res.status(HTTP_SUCCESS).json({
      wallets,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Fail list wallet collection' });
  }
}
