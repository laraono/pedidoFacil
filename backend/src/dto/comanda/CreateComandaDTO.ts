import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { ComandaStatus } from '../../enum';

const comandaStatusValues = Object.values(ComandaStatus) as [string, ...string[]];

export const createComandaSchema = z.object({
  body: z.object({
    description: safeString(1, 50),
    status: z.enum(comandaStatusValues),
    total: z.coerce.number().nonnegative()
  }).strict()
});

export type CreateComandaDTO = z.infer<typeof createComandaSchema>['body'];

export type CreateComanda = CreateComandaDTO
export type CreateComandaParams = CreateComandaDTO