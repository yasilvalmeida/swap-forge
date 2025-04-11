import { MAX_LOGO_SIZE } from "@/libs/constants/token";
import { ResizeImageResponseDto } from "@/libs/models/token";
import axios from "axios";

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const convertAndResize = async (file?: File): Promise<string> => {
  if (!file) {
    throw new Error('Token logo is required');
  } else if (file.size / 1024 / 1024 > MAX_LOGO_SIZE) {
    throw new Error(`Size must be less than ${MAX_LOGO_SIZE}MB`);
  } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Only JPEG and PNG images are allowed');
  } else {
    const tokenLogoBase64 = await convertFileToBase64(file);
    const resizeImageResponse = await axios.post<ResizeImageResponseDto>(
      '/api/token/image/resize',
      {
        tokenLogoBase64,
      }
    );
    const { resizedTokenLogoBase64 } = resizeImageResponse.data;
    return resizedTokenLogoBase64;
  }
}
