import { z } from 'zod';
import { safeString } from '../../utils/safeZod'; 
import { ProductStatus } from '../../enum';

const productStatusValues = Object.values(ProductStatus) as [string, ...string[]];

export const createProductSchema = z.object({
  body: z.preprocess((val: any) => {
    if (val && !val.product && val.name) {
      let parsedSizes = [];
      if (typeof val.sizes === 'string') {
        try { parsedSizes = JSON.parse(val.sizes); } catch {}
      } else if (Array.isArray(val.sizes)) {
        parsedSizes = val.sizes;
      }

      const isAvailable = val.available === 'true' || val.available === true;

      return {
        product: {
          name: val.name,
          description: val.description || null,
          isAvailable: isAvailable,
          categoryId: Number(val.categoryId),
          basePrice: Number(val.price),
          status: isAvailable ? 'Ativo' : 'Inativo'
        },
        productVariations: parsedSizes.map((s: any) => ({
          name: s.name,
          addPrice: Number(s.price),
          status: 'Ativo'
        }))
      };
    }
    return val;
  }, 
  z.object({
    product: z.object({
      name: safeString(2, 100),
      description: safeString(0, 500).optional().nullable(),
      isAvailable: z.boolean(),
      categoryId: z.number().int().positive(),
      basePrice: z.coerce.number().nonnegative(),
      status: z.enum(productStatusValues)
    }),
    
    productVariations: z.array(
      z.object({
        name: safeString(1, 100),
        addPrice: z.coerce.number().nonnegative(),
        status: z.enum(productStatusValues)
      })
    ).optional()
  }))
});

export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];

export type CreateProductVariationDTO = NonNullable<z.infer<typeof createProductSchema>['body']['productVariations']>[number];