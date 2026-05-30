import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email("E-mail inválido").trim().toLowerCase(),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

export type LoginDTO = z.infer<typeof loginSchema>;
