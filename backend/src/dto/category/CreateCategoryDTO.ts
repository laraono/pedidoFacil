import { z } from 'zod';
import { safeString, safeBase64Image } from '../../utils/safeZod';

export const createCategorySchema = z.object({
  body: z.object({
    name: safeString(2, 50),
    image: safeBase64Image(2).optional().nullable(),
    establishment: z.object({ id: z.number().int().positive() }).optional()
  }).strict()
});

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>['body'];