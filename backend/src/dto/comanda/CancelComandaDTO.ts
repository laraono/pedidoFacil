import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { User } from '../../database/entity/User';
import { ComandaStatus } from '../../enum';

export const cancelComandaSchema = z.object({
  body: z.object({
    comandaId: z.number().int().positive(),
    userId: z.number().int().positive(),
    reason: safeString(3, 255)
  }).strict()
});

export type CancelComandaDTO = z.infer<typeof cancelComandaSchema>['body'];

export type CancelComandaParams = {
    user: User,
    reason: string,
    status: ComandaStatus.CANCELADA
}