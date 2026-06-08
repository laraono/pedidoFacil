import { z } from 'zod';
import { safeString } from '../../utils/safeZod'; 
import { Category } from "../../database";
import { ProductParams } from "./CreateProductDTO";

export const updateProductSchema = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    description: safeString(0, 500).optional().nullable(),
    price: z.coerce.number().nonnegative().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    
    available: z.preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }, z.boolean().optional()),
    
    sizes: z.preprocess((val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return val;
    }, z.array(
      z.object({
        name: safeString(1, 100),
        price: z.coerce.number().nonnegative()
      })
    ).optional())
  })
});

export type UpdateProductDTO = z.infer<typeof updateProductSchema>['body'];

export type EditProductParams = {
    name: string;
    description?: string; 
    category: Category;
    basePrice: number;
    image?: string;
};

export type EditProductVariation = {
    id?: number;
    name: string;
    addPrice: number;
};

export type EditProduct = {
    product: ProductParams;
    productVariations: Array<EditProductVariation>;
};