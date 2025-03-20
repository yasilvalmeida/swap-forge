import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/mongodb';
import {
  WALLET_COLLECTION,
  WalletDto,
  WalletGetResponseDto,
} from '@/lib/models/wallet';
import { ErrorResponseDto } from '@/lib/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/lib/constants/http';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WalletGetResponseDto | ErrorResponseDto>
) {
  try {
    if (req.method !== 'GET') {
      return res
        .status(HTTP_METHOD_NOT_ALLOWED)
        .json({ error: 'Method not allowed' });
    }

    const walletAddress = req.query.walletAddress;

    const wallet = await database
      .collection<WalletDto>(WALLET_COLLECTION)
      .findOne({
        walletAddress,
      });
    if (wallet?._id) {
      return res.status(HTTP_SUCCESS).json({
        wallet,
      });
    } else {
      return res.status(HTTP_SUCCESS).json({
        error: `Wallet ${walletAddress} not found!`,
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Fail get wallet collection' });
  }
}
