import { z } from 'zod';
import { safeString } from '../../utils/safeZod';
import { User } from "../../database/entity/User";
import { OrderStatus } from "../../enum";

const cancelOrderBaseSchema = z.object({
  body: z.object({
    comandaId: z.coerce.number().int().positive(),
    userId: z.number().int().positive().optional(), 
    establishmentId: z.number().int().positive().optional(), 
    cancellationDescription: safeString(0, 255).optional().nullable()
  }).strict()
});

export const cancelOrderSchema = z.preprocess((reqObj: any) => {
  if (reqObj?.params?.comandaId) {
    reqObj.body = {
      ...reqObj?.body,
      comandaId: reqObj.params.comandaId
    };
  }
  return reqObj;
}, cancelOrderBaseSchema);

export type CancelOrderDTO = z.infer<typeof cancelOrderBaseSchema>['body'];

export type CancelOrder = {
    comandaId: number;
    userId: number;
    establishmentId: number;
    cancellationDescription?: string;
};

export type CancelOrderParams = {
    user: User;
    cancellationDescription?: string;
    status: OrderStatus.CANCELADO;
};