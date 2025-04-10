type CreatorDto = {
  name: string;
  site: string;
};

export type MetadataDto = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  tags?: string[];
  createdOn: string;
  creator?: CreatorDto;
  website?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  facebook?: string;
  instragram?: string;
};

export type StoreTokenMetadaRequestDto = {
  tokenName: string;
  tokenSymbol: string;
  tokenLogo: string;
  tokenDescription: string;
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
};

export type StoreTokenMetadaResponseDto = {
  uri: string;
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
