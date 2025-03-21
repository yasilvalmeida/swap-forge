import { z } from 'zod';

export const swapTokenFormSchema = z.object({
  inputMint: z.string(),
  outputMint: z.string(),
  inputAmount: z.string().min(1, 'Amount is required'),
});

export type SwapTokenFormData = z.infer<typeof swapTokenFormSchema>;
