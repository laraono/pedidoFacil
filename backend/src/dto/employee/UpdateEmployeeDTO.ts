import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const updateEmployeeSchema = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    email: z.email("E-mail inválido").trim().toLowerCase().optional(), 
    cpf: safeString(11, 14).optional().nullable(),
    password: z.string().min(8).optional(),
    roleId: z.number().int().positive().optional()
  }).strict()
});

export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>['body'];