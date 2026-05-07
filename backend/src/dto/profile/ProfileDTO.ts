import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: safeString(2, 100).optional(),
    email: z.email("E-mail inválido").trim().toLowerCase().optional(), 
    cpf: safeString(11, 14).optional().nullable(),
    phone: safeString(10, 15).optional().nullable(),
    address: safeString(5, 255).optional().nullable(),
    city: safeString(2, 100).optional().nullable(),
    state: safeString(2, 2).optional().nullable(),
    zip: safeString(8, 10).optional().nullable(),
  }).strict()
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "A senha atual é obrigatória"),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres")
  }).strict()
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>['body'];
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>['body'];