import { NextApiRequest, NextApiResponse } from 'next';
import {
  MetadataDto,
  StoreTokenMetadaRequestDto,
  StoreTokenMetadaResponseDto,
} from '@/libs/models/token';
import { ErrorResponseDto } from '@/libs/models';
import {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_SUCCESS,
} from '@/libs/constants/http';
import { uploadFileToPinata } from '@/libs/utils/pinata';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoreTokenMetadaResponseDto | ErrorResponseDto>
) {
  if (req.method !== 'POST') {
    return res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ error: 'Method not allowed' });
  }

  const formData: StoreTokenMetadaRequestDto = req.body;
  
  const {
    tokenName,
    tokenSymbol,
    tokenLogo,
    tokenDescription,
    tags,
    customCreatorInfo,
    creatorName,
    creatorWebsite,
    createSocial,
    socialWebsite,
    socialTwitter,
    socialTelegram,
    socialDiscord,
    socialInstagram,
    socialFacebook,
  } = formData;

  try {
    const imageUrl = await uploadFileToPinata(tokenLogo, 'image/png');

    const metadata: MetadataDto = {
      name: tokenName,
      symbol: tokenSymbol,
      description: tokenDescription,
      image: imageUrl,
      createdOn: creatorWebsite,
      tags,
      creator: { name: creatorName, site: creatorWebsite },
    };
    if (tags?.length > 0) {
      metadata['tags'] = tags;
    }
    if (customCreatorInfo) {
      metadata['creator'] = { name: creatorName, site: creatorWebsite };
    }
    if (createSocial) {
      metadata['website'] = socialWebsite;
      metadata['twitter'] = socialTwitter;
      metadata['telegram'] = socialTelegram;
      metadata['discord'] = socialDiscord;
      metadata['facebook'] = socialFacebook;
      metadata['instragram'] = socialInstagram;
    }
    const metadataJsonString = JSON.stringify(metadata);
    const matedataBase64 = Buffer.from(metadataJsonString).toString('base64');
    const uri = await uploadFileToPinata(
      matedataBase64,
      'application/json'
    );

    return res.status(HTTP_SUCCESS).json({
      uri,
    });
  } catch (error) {
    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: (error as Error).message });
  }
}
