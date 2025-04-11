import {
  MAX_LOGO_HEIGHT,
  MAX_LOGO_WIDTH,
} from '@/libs/constants/token/index';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ResizeImageRequestDto,
  ResizeImageResponseDto,
} from '@/libs/models/token';
import { ErrorResponseDto } from '@/libs/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
} from '@/libs/constants/http';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResizeImageResponseDto | ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ error: 'Method not allowed' });
  }

  try {
    const { tokenLogoBase64 }: ResizeImageRequestDto = req.body;
    const clearBase64 = tokenLogoBase64.split(';base64,').pop();

    if (clearBase64) {
      const buffer = Buffer.from(clearBase64, 'base64');
      const resizedImage = await sharp(buffer)
        .resize(MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT, {
          fit: 'cover',
        })
        .toBuffer();

      const base64Image = resizedImage.toString('base64');
      const resizedTokenLogoBase64 = `data:image/png;base64,${base64Image}`;

      res.status(200).json({ resizedTokenLogoBase64 });
    }
  } catch (error) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: JSON.stringify(error) });
  }
}
