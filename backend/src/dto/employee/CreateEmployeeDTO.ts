import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { strongPasswordSchema } from '../../utils/passwordSchema';

export const createEmployeeSchema = z.object({
  body: z.object({
    name: safeString(2, 100),
    email: z.email("E-mail inválido").trim().toLowerCase(), 
    cpf: safeString(11, 14).optional().nullable(),
    password: strongPasswordSchema,
    roleId: z.number().int().positive()
  }).strict()
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    email: z.email("E-mail inválido").trim().toLowerCase().optional(), 
    cpf: safeString(11, 14).optional().nullable(),
    password: strongPasswordSchema.optional(),
    roleId: z.number().int().positive().optional()
  }).strict()
});

export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>['body'];
