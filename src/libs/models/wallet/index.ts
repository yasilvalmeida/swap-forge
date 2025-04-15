import { ObjectId } from 'mongodb';

export const WALLET_COLLECTION = 'wallet';
export const TOKEN_COLLECTION = 'token';
export const LIQUIDITY_COLLECTION = 'liquidity';
export const SWAP_COLLECTION = 'swap';

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

export type LiquidityDto = {
  _id?: ObjectId;
  walletId: ObjectId;
  walletAddress: string;
  liquidityKey: string;
  createdAt: Date;
};

export type SwapDto = {
  _id?: ObjectId;
  walletId: ObjectId;
  walletAddress: string;
  swapKey: string;
  createdAt: Date;
};

export type WalletTokenRequestDto = {
  walletAddress: string;
  tokenPublicKey: string;
  referralCode?: string;
};

export type WalletLiquidityRequestDto = {
  walletAddress: string;
  liquidityKey: string;
};

export type WalletSwapRequestDto = {
  walletAddress: string;
  swapKey: string;
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

export type WalletCreatedTokenListResponseDto = {
  createdTokenList: TokenAccountDto[];
};

export type WalletCreatedLiquidityListResponseDto = {
  createdLiquidityList: LiquidityDto[];
};

export type WalletCreatedSwapListResponseDto = {
  createdSwapList: SwapDto[];
};