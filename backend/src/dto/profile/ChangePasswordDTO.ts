import { z } from 'zod';

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "A senha atual é obrigatória"),
    newPassword: z.string().min(8, "A nova senha deve ter no mínimo 8 caracteres")
  }).strict()
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>['body'];