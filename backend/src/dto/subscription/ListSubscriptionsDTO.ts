import { z } from 'zod';

const listSubscriptionsBaseSchema = z.object({
  body: z.object({
    establishmentId: z.coerce.number().int().positive()
  })
});

export const listSubscriptionsSchema = z.preprocess((reqObj: any) => {
  if (reqObj) {
    reqObj.body = {
      establishmentId: reqObj.usuario?.estabelecimento
    };
  }
  return reqObj;
}, listSubscriptionsBaseSchema);

export type ListSubscriptionsDTO = z.infer<typeof listSubscriptionsBaseSchema>['body'];