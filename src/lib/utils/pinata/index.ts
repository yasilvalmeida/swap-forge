import { v4 as uuidv4 } from 'uuid';
import { PinataSDK } from 'pinata';
import dotenv from 'dotenv';

dotenv.config();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: 'coffee-defensive-hare-118.mypinata.cloud',
});

export const uploadFileToPinata = async (
  imageOrJsonBase64: string,
  type: 'image/png' | 'application/json'
) => {
  try {
    let base64 = '';
    if (imageOrJsonBase64.includes('data:image/png;base64,')) {
      base64 = imageOrJsonBase64.split(',')[1];
    } else {
      base64 = imageOrJsonBase64;
    }
    const result = await pinata.upload.public
      .base64(base64)
      .name(`${uuidv4()}.${type === 'image/png' ? 'png' : 'json'}`)
      .keyvalues({
        uploadedBy: 'SwapForge',
      });
    return `https://coffee-defensive-hare-118.mypinata.cloud/ipfs/${result.cid}`;
  } catch (error) {
    console.log('Error uploading file to Pinata:', error);
    throw error;
  }
};
