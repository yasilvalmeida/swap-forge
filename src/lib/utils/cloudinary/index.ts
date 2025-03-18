import { v4 as uuidv4 } from 'uuid';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadMediaToCloudinary = async (base64: string) => {
  try {
    const result = await cloudinary.v2.uploader.upload(base64, {
      public_id: uuidv4(),
    });
    return result.secure_url;
  } catch (error) {
    console.log('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export const uploadRawToCloudinary = async (base64: string) => {
  try {
    const result = await cloudinary.v2.uploader.upload(
      `data:application/json;base64,${base64}`,
      {
        resource_type: 'raw',
        public_id: `${uuidv4()}.json`,
        type: 'upload',
      }
    );
    return result.secure_url;
  } catch (error) {
    console.log('Error uploading image to Cloudinary:', error);
    throw error;
  }
};
