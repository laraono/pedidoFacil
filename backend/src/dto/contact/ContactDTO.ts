import { z } from 'zod';
import { safeString } from '../../utils/safeZod';

export const contactSchema = z.object({
  body: z.object({
    nome: safeString(2, 100),
    email: z.email('Formato de e-mail inválido.').trim().toLowerCase(),
    mensagem: safeString(10, 1000)
  }).strict()
});

export type ContactDTO = z.infer<typeof contactSchema>['body'];