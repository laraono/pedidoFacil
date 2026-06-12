import { z } from 'zod';

const restoreSubscriptionBaseSchema = z.object({
  params: z.object({
    subscriptionId: z.coerce.number().int().positive(),
    establishmentId: z.coerce.number().int().positive()
  }),
  body: z.object({
    cardToken: z.string().min(1),
  })
});

export const restoreSubscriptionSchema = z.preprocess((reqObj: any) => {
  if (reqObj) {
    const subscriptionId = reqObj.params?.subscriptionId;
    const establishmentId = reqObj.usuario?.estabelecimento;

    reqObj.params = { ...reqObj.params, subscriptionId, establishmentId };
  }
  return reqObj;
}, restoreSubscriptionBaseSchema);

export type RestoreSubscriptionDTO = z.infer<typeof restoreSubscriptionBaseSchema>['body'];