import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email("E-mail inválido").trim().toLowerCase(),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
  }).strict()
});

export type LoginDTO = z.infer<typeof loginSchema>['body'];