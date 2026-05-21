import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const createCategorySchema = z.object({
  body: z.object({
    name: safeString(2, 50),
    
    establishment: z.preprocess((val) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    }, z.object({ id: z.coerce.number().int().positive() }).optional())
  }) 
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>['body'];

export type CreateCategory = CreateCategoryDTO
export type CreateCategoryParams = CreateCategoryDTO