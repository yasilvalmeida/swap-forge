import { ObjectId } from 'mongodb';

export const WALLET_COLLECTION = 'wallet';

export type WalletDto = {
  _id: ObjectId;
  publicAddress: string;
  tokensCreated: number;
  referralCode: string;
  referralBy: string;
};

export type WalletRequestDto = {
  walletAddress: string;
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
