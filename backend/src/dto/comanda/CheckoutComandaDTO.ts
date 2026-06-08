import { z } from 'zod';

export const checkoutComandaSchema = z.object({
  body: z.object({
    payment: z.object({
      type: z.string(),
      amount: z.number().nonnegative(),
      terminal: z.string().optional().nullable()
    }),
    
    isLastPayment: z.boolean().optional(),
    selectedOrderIds: z.array(z.number().int().positive()),
    
    totalValue: z.number().nonnegative().optional(),
    change: z.number().nonnegative().optional(),
    discountType: z.string().optional().nullable(),
    discountValue: z.number().nonnegative().optional().nullable(),
    paymentMode: z.string().optional(),
    cpfcnpj: z.string().optional().nullable(),
    couponId: z.number().int().positive().optional().nullable() 
  }).strict()
});

export type CheckoutComandaDTO = z.infer<typeof checkoutComandaSchema>['body'];
export type CheckoutComanda = CheckoutComandaDTO;