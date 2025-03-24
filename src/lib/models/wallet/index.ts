import { ObjectId } from 'mongodb';

export const WALLET_COLLECTION = 'wallet';
export const TOKEN_COLLECTION = 'token';

export type WalletDto = {
  _id: ObjectId;
  publicAddress: string;
  tokensCreated: number;
  referralCode: string;
  referralBy: string;
};

export type TokenAccountDto = {
  _id?: ObjectId;
  walletId: ObjectId;
  walletAddress: string;
  tokenPublicKey: string;
  createdAt: Date;
};

export type WalletRequestDto = {
  walletAddress: string;
  tokenPublicKey: string;
  referralCode?: string;
};

export type WalletGetResponseDto = {
  wallet: WalletDto;
};

export type WalletListResponseDto = {
  wallets: WalletDto[];
};

export type WalletGetReferralsResponseDto = {
  sumOfReferrals: number;
};
