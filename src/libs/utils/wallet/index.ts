import {
  WalletCreatedLiquidityListResponseDto,
  WalletCreatedSwapListResponseDto,
  WalletCreatedTokenListResponseDto,
  WalletDto,
  WalletGetResponseDto
} from '@/libs/models/wallet';
import axios from 'axios';
import { ObjectId } from 'mongodb';

export const updateWalletToken = async (
  walletAddress: string,
  tokenPublicKey: string,
  referralCode?: string
) => {
  try {
    await axios.post('/api/wallet/token/update', {
      walletAddress,
      tokenPublicKey,
      referralCode,
    });
  } catch (error) {
    console.log('error-wallet-token-update', error);
  }
};

export const updateWalletLiquidity = async (
  walletAddress: string,
  liquidityKey: string
) => {
  try {
    await axios.post('/api/wallet/liquidity/update', {
      walletAddress,
      liquidityKey,
    });
  } catch (error) {
    console.log('error-wallet-liquidity-update', error);
  }
};

export const updateWalletSwap = async (
  walletAddress: string,
  swapKey: string
) => {
  try {
    await axios.post('/api/wallet/swap/update', {
      walletAddress,
      swapKey,
    });
  } catch (error) {
    console.log('error-wallet-swap-update', error);
  }
};

export const getWallet = async (walletAddress: string) => {
  try {
    const getWalletResponse = await axios.get<WalletGetResponseDto>(
      `/api/wallet/get`,
      {
        params: {
          walletAddress,
        },
      }
    );
    const { wallet } = getWalletResponse.data;
    return wallet;
  } catch (error) {
    console.log('error-wallet-get', error);
  }
};

export const listWallet = async () => {
  try {
    const listWalletResponse = await axios.get('/api/wallet/list');
    return listWalletResponse.data as WalletDto[];
  } catch (error) {
    console.log('error-wallet-list', error);
  }
};

export const getSumOfReferrals = async (walletAddress: string) => {
  try {
    const getSumOfReferralsResponse = await axios.get(
      `/api/wallet/referral/get`,
      {
        params: {
          walletAddress,
        },
      }
    );
    const { sumOfReferrals } = getSumOfReferralsResponse.data;
    if (sumOfReferrals >= 25) return 0.5;
    if (sumOfReferrals >= 10) return 0.2;
    if (sumOfReferrals >= 3) return 0.1;
    return 0;
  } catch (error) {
    console.log('error-get-sum-of-referrals', error);
  }
};

export const getCreatedTokenList = async (walletId: ObjectId) => {
  try {
    const createdTokenListResponse =
      await axios.get<WalletCreatedTokenListResponseDto>(
        `/api/wallet/token/list`,
        {
          params: {
            walletId,
          },
        }
      );

    const { createdTokenList } = createdTokenListResponse.data;
    return createdTokenList;
  } catch (error) {
    console.log('error-get-wallet-token-list', error);
  }
};

export const getCreatedLiquidityList = async (walletId: ObjectId) => {
  try {
    const createdLiquidityListResponse =
      await axios.get<WalletCreatedLiquidityListResponseDto>(
        `/api/wallet/liquidity/list`,
        {
          params: {
            walletId,
          },
        }
      );

    const { createdLiquidityList } = createdLiquidityListResponse.data;
    return createdLiquidityList;
  } catch (error) {
    console.log('error-get-wallet-liquidity-list', error);
  }
};

export const getCreatedSwapList = async (walletId: ObjectId) => {
  try {
    const createdSwapListResponse =
      await axios.get<WalletCreatedSwapListResponseDto>(
        `/api/wallet/swap/list`,
        {
          params: {
            walletId,
          },
        }
      );

    const { createdSwapList } = createdSwapListResponse.data;
    return createdSwapList;
  } catch (error) {
    console.log('error-get-wallet-swap-list', error);
  }
};