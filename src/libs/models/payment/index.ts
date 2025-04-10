export type PaymentRequestDto = {
  tokenFee: number;
  walletPublicKey: string;
};

export type PaymentResponseDto = {
  serializedTransaction: Buffer<ArrayBufferLike>;
};
