import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const registerSchema = z.object({
  body: z.object({
    nome_estabelecimento: safeString(2, 100).optional().nullable(),
    cnpj: safeString(14, 18).optional().nullable(),
    nome_usuario: safeString(2, 100),
    email: z.email("E-mail inválido").trim().toLowerCase(),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    
    cargos: z.array(
      z.object({
        nome: safeString(2, 50),
        permissoes: z.array(z.string())
      }).strict()
    ).optional()
  }).strict()
});

export type RegisterDTO = z.infer<typeof registerSchema>['body'];
export type CargoDTO = NonNullable<z.infer<typeof registerSchema>['body']['cargos']>[number];