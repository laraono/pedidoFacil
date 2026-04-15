import { z } from 'zod';
import { safeString } from '../../utils/safeZod'; 
import { ProductStatus } from '../../enum';

const productStatusValues = Object.values(ProductStatus) as [string, ...string[]];

export const createProductSchema = z.object({
  body: z.object({
    product: z.object({
      name: safeString(2, 100),
      description: safeString(0, 500).optional().nullable(),
      isAvailable: z.boolean(),
      categoryId: z.number().int().positive(),
      basePrice: z.coerce.number().nonnegative(),
      status: z.enum(productStatusValues)
    }).strict(),
    
    productVariations: z.array(
      z.object({
        name: safeString(1, 100),
        addPrice: z.coerce.number().nonnegative(),
        status: z.enum(productStatusValues)
      }).strict()
    ).optional()
  }).strict()
});

export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];

export type CreateProductVariationDTO = NonNullable<z.infer<typeof createProductSchema>['body']['productVariations']>[number];