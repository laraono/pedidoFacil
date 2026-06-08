import { z } from 'zod';

const restoreSubscriptionBaseSchema = z.object({
  params: z.object({
    subscriptionId: z.coerce.number().int().positive(),
    establishmentId: z.coerce.number().int().positive()
  }),
  body: z.array(
    z.object({
      amount: z.coerce.number().positive(),
      payment_method: z.object({
        id: z.string().min(1),
        type: z.string().min(1),
        installments: z.coerce.number().int().positive(),
        token: z.string().min(1)
          })
        })
      )
});

export const restoreSubscriptionSchema = z.preprocess((reqObj: any) => {
  if (reqObj) {
    const subscriptionId = reqObj.params?.subscriptionId;
    const establishmentId = reqObj.usuario?.estabelecimento;
    const data = reqObj.body?.data?.transaction?.payments;

    reqObj.params = { ...reqObj.params, subscriptionId, establishmentId };
    reqObj.body = data;
  }
  return reqObj;
}, restoreSubscriptionBaseSchema);

export type RestoreSubscriptionDTO = z.infer<typeof restoreSubscriptionBaseSchema>['body'];