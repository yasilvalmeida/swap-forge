import { PublicKey } from "@solana/web3.js";

export const TOKEN_NAME_MAX_CHARS = 30;
export const TOKEN_SYMBOL_MAX_CHARS = 10;
export const MAX_LOGO_SIZE = 5 * 1024;
export const MAX_LOGO_WIDTH = 500;
export const MAX_LOGO_HEIGHT = 500;
export const CREATE_TOKEN_FEE = 0.1;
export const MAX_TAGS = 6;
export const MAX_TIMEOUT_TOKEN_MINT = 2000;
export const RAYDIUM_LIQUIDITY_URL = 'https://raydium.io/liquidity-pools/';
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);