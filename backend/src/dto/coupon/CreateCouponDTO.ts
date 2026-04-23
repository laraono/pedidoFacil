import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { DiscountType } from '../../enum';

const discountTypeValues = Object.values(DiscountType) as [string, ...string[]];

export const createCouponSchema = z.object({
  body: z
    .object({
      establishmentId: z.number().int().positive().optional(),
      code: safeString(3, 20).transform((val) => val.toUpperCase()),
      type: z.enum(discountTypeValues),
      value: z.coerce
        .number()
        .positive('O valor do desconto deve ser maior que zero'),
      quantity: z.number().int().nonnegative().optional().nullable(),

      expirationDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Data de expiração inválida')
        .optional()
        .nullable(),
    })
    .strict(),
});

export type CreateCouponDTO = z.infer<typeof createCouponSchema>['body'];
