import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DimensionDto } from '../models';
import dotenv from 'dotenv';

dotenv.config();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (number: string) => {
  // Remove all non-numeric characters
  const numericValue = number.replace(/\D/g, '');

  // Add commas every 3 digits
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const removeFormatting = (number: string) => {
  return Number(number.replace(/\s+/g, ''));
};

export const getImageDimensions = (file: File) => {
  return new Promise<DimensionDto>((resolve, reject) => {
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (error) => {
        reject(error);
      };
    } else {
    }
  });
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text);
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
