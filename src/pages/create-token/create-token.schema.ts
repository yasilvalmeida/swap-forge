import {
  TOKEN_NAME_MAX_CHARS,
  TOKEN_SYMBOL_MAX_CHARS,
} from '@/lib/constants/token';
import { z } from 'zod';

export const tokenFormSchema = z.object({
  tokenName: z
    .string()
    .min(1, 'Token name is required')
    .max(
      TOKEN_NAME_MAX_CHARS,
      `Token name must be at most ${TOKEN_NAME_MAX_CHARS} characters`
    ),
  tokenSymbol: z
    .string()
    .min(1, 'Token symbol is required')
    .max(
      TOKEN_SYMBOL_MAX_CHARS,
      `Token symbol must be at most ${TOKEN_SYMBOL_MAX_CHARS} characters`
    ),
  tokenDecimals: z.string().min(1, 'Token decimals is required'),
  tokenSupply: z.string().min(1, 'Token supply is required'),
  tokenLogo: z.string().min(1, 'Token logo is required'),
  tokenDescription: z.string().min(1, 'Token description is required'),
  tags: z.array(z.string().optional()),
  revokeMint: z.boolean(),
  revokeFreeze: z.boolean(),
  immutable: z.boolean(),
  customCreatorInfo: z.boolean(),
  creatorName: z.string().min(1, 'Token creator name is required'),
  creatorWebsite: z.string().min(1, 'Token creator website is required'),
  createSocial: z.boolean(),
  socialWebsite: z.string(),
  socialTwitter: z.string(),
  socialTelegram: z.string(),
  socialDiscord: z.string(),
  socialInstagram: z.string(),
  socialFacebook: z.string(),
  voucher: z.boolean(),
  tokenVoucher: z.string(),
  tokenFee: z.number(),
});

export type TokenFormData = z.infer<typeof tokenFormSchema>;
