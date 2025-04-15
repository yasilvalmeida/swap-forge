import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/libs/mongodb';
import {
  LIQUIDITY_COLLECTION,
  LiquidityDto,
  WalletCreatedLiquidityListResponseDto,
} from '@/libs/models/wallet';
import { ErrorResponseDto } from '@/libs/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/libs/constants/http';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WalletCreatedLiquidityListResponseDto | ErrorResponseDto>
) {
  try {
    if (req.method !== 'GET') {
      return res
        .status(HTTP_METHOD_NOT_ALLOWED)
        .json({ error: 'Method not allowed' });
    }

    const walletId = req.query.walletId as string;
    console.log('walletId', walletId)

    const createdLiquidityList = await database
      .collection<LiquidityDto>(LIQUIDITY_COLLECTION)
      .find({
        walletId: new ObjectId(walletId),
      })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(HTTP_SUCCESS).json({
      createdLiquidityList,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Fail get created liquidity list collection' });
  }
}
