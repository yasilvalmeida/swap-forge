import { NextApiRequest, NextApiResponse } from 'next';
import { StatsUpdateResponseDto } from '@/lib/model/stats/update';
import { ErrorResponseDto } from '@/lib/model';
import clientPromise from '@/lib/mongodb';
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR, HTTP_SUCCESS } from '@/lib/constants/http';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(HTTP_BAD_REQUEST).json({ error: 'Wallet address is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('my-database');

    // Find the wallet or create it if it doesn't exist
    const result = await db.collection('wallets').updateOne(
      { walletAddress },
      { $inc: { tokensCreated: 1 } }, // Increment tokensCreated by 1
      { upsert: true } // Create the document if it doesn't exist
    );

    return res.status(HTTP_SUCCESS);
  } catch (error) {
    console.error(error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
}
