import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/mongodb';
import {
  TOKEN_COLLECTION,
  TokenAccountDto,
  WalletCreatedTokenListResponseDto,
} from '@/lib/models/wallet';
import { ErrorResponseDto } from '@/lib/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WalletCreatedTokenListResponseDto | ErrorResponseDto>
) {
  try {
    if (req.method !== 'GET') {
      return res
        .status(HTTP_METHOD_NOT_ALLOWED)
        .json({ error: 'Method not allowed' });
    }

    const walletId = req.query.walletId as string;

    const createdTokenList = await database
      .collection<TokenAccountDto>(TOKEN_COLLECTION)
      .find({
        walletId: new ObjectId(walletId),
      })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(HTTP_SUCCESS).json({
      createdTokenList,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Fail get created token list collection' });
  }
}
