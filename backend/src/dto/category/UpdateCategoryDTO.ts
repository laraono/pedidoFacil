import { z } from 'zod';
import { safeString } from '../../utils/safeZod'; 

export const updateCategorySchema = z.object({
  body: z.object({
    id: z.coerce.number().positive().optional(),
    
    name: safeString(2, 50).optional(),
    
  }) 
});