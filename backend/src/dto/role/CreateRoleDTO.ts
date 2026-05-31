import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const createRoleSchema = z.object({
  body: z.object({
    name: safeString(2, 50),
    permissions: z.array(z.string())
  }).strict()
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>['body'];