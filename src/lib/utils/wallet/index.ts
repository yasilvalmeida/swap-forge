import { WalletDto } from '@/lib/models/wallet';
import axios from 'axios';

export const updateWallet = async (
  walletAddress: string,
  tokenPublicKey: string,
  referralCode?: string
) => {
  try {
    await axios.post('/api/wallet-update', {
      walletAddress,
      tokenPublicKey,
      referralCode,
    });
  } catch (error) {
    console.log('error-wallet-update', error);
  }
};

export const getWallet = async (walletAddress: string) => {
  try {
    const getWalletResponse = await axios.get(`/api/wallet-get`, {
      params: {
        walletAddress,
      },
    });
    const { wallet } = getWalletResponse.data;
    return wallet;
  } catch (error) {
    console.log('error-wallet-get', error);
  }
};

export const listWallet = async () => {
  try {
    const listWalletResponse = await axios.get('/api/wallet-list');
    return listWalletResponse.data as WalletDto[];
  } catch (error) {
    console.log('error-wallet-list', error);
  }
};

export const getSumOfReferrals = async (walletAddress: string) => {
  try {
    const getSumOfReferralsResponse = await axios.get(
      `/api/wallet-referrals-get`,
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
