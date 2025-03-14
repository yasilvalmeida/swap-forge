export type AddSupplierRequestDto = {
  tokenSupply: number;
  revokeMint: boolean;
  revokeFreeze: boolean;
  immutable: boolean;
  swapForgePublicKey: string;
  walletPublicKey: string;
  mintPublicKey: string;
};

export type AddSupplierResponseDto = {
  message: string;
};
