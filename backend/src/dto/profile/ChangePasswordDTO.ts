import { z } from 'zod';

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "A senha atual é obrigatória"),
    newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres")
  }).strict()
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>['body'];