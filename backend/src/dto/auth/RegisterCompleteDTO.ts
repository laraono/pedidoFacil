import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const registerCompleteSchema = z.object({
  nome_usuario: safeString(2, 100),
  email: z.email('E-mail inválido').trim().toLowerCase(),
  cpf: safeString(11, 14).optional().nullable(),
  senha: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .refine(val => /[A-Z]/.test(val), 'A senha deve conter pelo menos uma letra maiúscula.')
    .refine(val => /[0-9]/.test(val), 'A senha deve conter pelo menos um número.')
    .refine(val => /[^A-Za-z0-9]/.test(val), 'A senha deve conter pelo menos um caractere especial.'),
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
    type: z.literal('online'),
    external_reference: z.string(),
    processing_mode: z.literal('automatic'),
    transactions: z.object({
      payments: z.array(
        z.object({
          payment_method: z.object({
            id: z.string(),
            type: z.string(),
            token: z.string(),
            installments: z.number(),
          }),
        })
      ).min(1),
    }),
    payer: z.object({
      email: z.email(),
      identification: z.any(),
    }),
  }),
});

export type RegisterCompleteDTO = z.infer<typeof registerCompleteSchema>;
