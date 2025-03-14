import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/mongodb';
import {
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_SUCCESS,
} from '@/lib/constants/http';
import { StatsUpdateRequestDto } from '@/lib/models/stats';
import { ErrorResponseDto, SuccessResponseDto } from '@/lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponseDto | ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress }: StatsUpdateRequestDto = req.body;

  if (!walletAddress) {
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ error: 'Wallet address is required' });
  }

  try {
    await database
      .collection('stats')
      .updateOne(
        { walletAddress },
        { $inc: { tokensCreated: 1 } },
        { upsert: true }
      );

    return res
      .status(HTTP_SUCCESS)
      .json({ message: 'Update stats successful' });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal server error' });
  }
}
