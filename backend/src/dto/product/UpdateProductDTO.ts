import { z } from 'zod';
import { safeString } from '../../utils/safeZod'; // Ajuste o caminho se necessário

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