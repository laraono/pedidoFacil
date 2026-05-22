import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const createRoleSchema = z.object({
  body: z.object({
    name: safeString(2, 50),
    permissions: z.array(z.string())
  }).strict()
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: safeString(2, 50).optional(),
    permissions: z.array(z.string()).optional()
  }).strict()
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>['body'];
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>['body'];