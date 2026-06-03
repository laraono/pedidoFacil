import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { strongPasswordSchema } from '../../utils/passwordSchema';

export const registerCompleteSchema = z.object({
  nome_usuario: safeString(2, 100),
  email: z.email('E-mail inválido').trim().toLowerCase(),
  cpf: safeString(11, 14).optional().nullable(),
  senha: strongPasswordSchema,
  establishment: z.object({
    name: safeString(2, 100),
    cnpj: safeString(14, 18),
  }),
  roles: z.array(
    z.object({
      label: z.string().min(1),
      permissions: z.array(z.string()),
    })
  ).optional().default([]),
  hasTotem: z.boolean().optional().default(false),
  planId: z.number().int().positive(),
  payment: z.object({
    cardToken: z.string().min(1),
    payerEmail: z.email(),
  }),
});

export type RegisterCompleteDTO = z.infer<typeof registerCompleteSchema>;
