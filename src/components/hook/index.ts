import { LiquidityDto, SwapDto, TokenAccountDto } from '@/libs/models/wallet';
import { getCreatedLiquidityList, getCreatedSwapList, getCreatedTokenList, getWallet } from '@/libs/utils/wallet';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const useLocalStorage = (keyName: string, defaultValue: object) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const value: string | null = window.localStorage.getItem(keyName);

      if (value) {
        return JSON.parse(value);
      } else {
        window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (err: unknown) {
      console.log(err);
      return defaultValue;
    }
  });

  const setValue = (newValue: object) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err: unknown) {
      console.log(err);
    }
    setStoredValue(newValue);
  };

  return [storedValue, setValue];
};

export const useWalletInfo = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  
  const [referralCode, setReferralCode] = useState<string>();
  const [createdTokens, setCreatedTokens] = useState<TokenAccountDto[]>([]);
  const [createdLiquidityPools, setCreatedLiquidityPools] = useState<LiquidityDto[]>([]);
  const [createdSwaps, setCreatedSwaps] = useState<SwapDto[]>([]);
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    getBalance();
    getWalletInfo();
    return () => {};

    async function getBalance() {
      if (publicKey && connected) {
        try {
          const balance = await connection.getBalance(publicKey);
          const balanceInSol = balance / LAMPORTS_PER_SOL;
          const formattedBalance = balanceInSol < 1 ? balanceInSol.toFixed(6) : (balanceInSol).toFixed(2);
          setBalance(formattedBalance);
        } catch (error) {
          console.log('error', error);
          toast.error((error as Error).message);
        }
      } else {
        setBalance('0');
      }
    }
    async function getWalletInfo() {
      if (publicKey) {
        const wallet = await getWallet(publicKey.toBase58());
        if (wallet?._id) {
          setReferralCode(wallet?.referralCode);
          const createdTokenList = await getCreatedTokenList(wallet?._id);
          const createdLiquidityList = await getCreatedLiquidityList(wallet?._id);
          const createdSwapList = await getCreatedSwapList(wallet?._id);
          setCreatedTokens(createdTokenList || []);
          setCreatedLiquidityPools(createdLiquidityList || [])
          setCreatedSwaps(createdSwapList || [])
        }
      }
    }
  }, [connected, connection, publicKey]);

  return { referralCode, createdTokens, createdLiquidityPools, createdSwaps, balance };
};