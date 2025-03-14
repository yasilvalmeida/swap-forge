import { NextApiRequest, NextApiResponse } from 'next';
import { database } from '@/lib/mongodb';
import { StatDto, StatsListResponseDto } from '@/lib/models/stats';
import { ErrorResponseDto } from '@/lib/models';
import { HTTP_INTERNAL_SERVER_ERROR } from '@/lib/constants/http';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsListResponseDto | ErrorResponseDto>
) {
  try {
    const wallets = await database
      .collection<StatDto>('stats')
      .find({})
      .toArray();
    return res.status(200).json({
      wallets
    });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: 'Fail list wallet collection' });
  }
}
