import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DimensionDto } from '../models';
import dotenv from 'dotenv';

dotenv.config();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (number: string) => {
  const [integer, decimal] = number.split('.');
  if (!decimal) {
    const numericValue = integer.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  } else {
    const decimalFormatted = decimal.substring(0, 2);
    const numericValue = integer.replace(/\D/g, '');
    return `${numericValue.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ' '
    )}.${decimalFormatted}`;
  }
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

export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text);
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};
