import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { User } from '../../database/entity/User';
import { ComandaStatus } from '../../enum';

const cancelComandaBaseSchema = z.object({
  body: z.object({
    comandaId: z.coerce.number().int().positive(), 
    userId: z.number().int().positive(),
    reason: safeString(3, 255)
  }).strict()
});

export const cancelComandaSchema = z.preprocess((reqObj: any) => {
  if (reqObj?.params?.comandaId) {
    reqObj.body = {
      ...reqObj?.body,
      comandaId: reqObj.params.comandaId
    };
  }
  return reqObj;
}, cancelComandaBaseSchema);

export type CancelComandaDTO = z.infer<typeof cancelComandaBaseSchema>['body'];
export type CancelComanda = CancelComandaDTO;
export type CancelComandaParams = {
    user: User;
    reason: string;
    status: ComandaStatus.CANCELADA;
};