import { v4 as uuidv4 } from 'uuid';
import { PinataSDK } from 'pinata';
import dotenv from 'dotenv';

dotenv.config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: 'coffee-defensive-hare-118.mypinata.cloud',
});

export const uploadFileToPinata = async (
  base64: string,
  type: 'image/png' | 'application/json'
) => {
  try {
    const result = await pinata.upload.public.base64(base64, {
      metadata: {
        name: uuidv4(),
        keyvalues: {
          type,
          uploadedBy: 'SwapForge'
        }
      },
    });
    return result.id;
  } catch (error) {
    console.log('Error uploading file to Pinata:', error);
    throw error;
  }
};
