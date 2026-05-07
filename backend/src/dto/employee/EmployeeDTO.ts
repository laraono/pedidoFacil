import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const createEmployeeSchema = z.object({
  body: z.object({
    name: safeString(2, 100),
    email: z.email("E-mail inválido").trim().toLowerCase(), 
    cpf: safeString(11, 14).optional().nullable(),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    roleId: z.number().int().positive()
  }).strict()
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    email: z.email("E-mail inválido").trim().toLowerCase().optional(), 
    cpf: safeString(11, 14).optional().nullable(),
    password: z.string().min(6).optional(),
    roleId: z.number().int().positive().optional()
  }).strict()
});

export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>['body'];
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>['body'];