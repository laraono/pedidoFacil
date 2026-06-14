import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email("E-mail inválido").trim().toLowerCase(),
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres")
  }).strict()
});

export type LoginDTO = z.infer<typeof loginSchema>['body'];