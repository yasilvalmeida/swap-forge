import { ObjectId } from 'mongodb';

export type StatDto = {
  _id: ObjectId;
  walletAddress: string;
  tokensCreated: number;
};

export type StatsUpdateRequestDto = {
  walletAddress: string;
};

export type StatsListResponseDto = {
  wallets: StatDto[];
};
