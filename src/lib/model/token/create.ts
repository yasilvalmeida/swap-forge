type CreatorDto = {
  name: string;
  site: string;
};

export type MetadataDto = {
  name: string;
  symbol: string;
  description: string;
  image: string; // URL or file path to the token image
  tags?: string[];
  creator?: CreatorDto;
  website?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  facebook?: string;
  instragram?: string;
};

export type CreateTokenRequestDto = {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenSupply: number;
  tokenLogo: string;
  tokenDescription: string;
  tags: string[];
  revokeMint: boolean;
  revokeFreeze: boolean;
  immutable: boolean;
  customCreatorInfo: boolean;
  creatorName: string;
  creatorWebsite: string;
  createSocial: boolean;
  socialWebsite: string;
  socialTwitter: string;
  socialTelegram: string;
  socialDiscord: string;
  socialInstagram: string;
  socialFacebook: string;
  tokenFee: number;
  swapForgePublicKey: string;
  walletPublicKey: string;
  mintPublicKey: string;
};

export type CreateTokenResponseDto = {
  serializedTransaction: Buffer<ArrayBufferLike>;
};