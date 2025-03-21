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
  tokenLogo: string;
  tokenDescription: string;
  tokenSupply: number;
  tags: string[];
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
  revokeMint: boolean;
  revokeFreeze: boolean;
  immutable: boolean;
  walletPublicKey: string;
};

export type CreateTokenResponseDto = {
  signature: string;
  mintPublicKey: string;
};

export type AddSupplierRequestDto = {
  tokenSupply: number;
  tokenFee: number;
  revokeMint: boolean;
  revokeFreeze: boolean;
  immutable: boolean;
  walletPublicKey: string;
  mintPublicKey: string;
};

export type AddSupplierResponseDto = {
  message: string;
};

export type ResizeImageRequestDto = {
  tokenLogoBase64: string;
};

export type ResizeImageResponseDto = {
  resizedTokenLogoBase64: string;
};
