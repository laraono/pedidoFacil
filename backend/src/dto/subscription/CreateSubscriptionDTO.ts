import { z } from 'zod';
import { Establishment, Plan } from "../../database";

const createSubscriptionBaseSchema = z.object({
  params: z.object({
    planId: z.coerce.number().int().positive(),
    establishmentId: z.coerce.number().int().positive()
  }),
  body: z.object({
    type: z.string().min(1),
    total_amount: z.coerce.number().positive(),
    external_reference: z.string().min(1),
    processing_mode: z.string().min(1),
    transactions: z.object({
      payments: z.array(
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
    }),
    payer: z.object({
      email: z.string().email("E-mail inválido"),
      identification: z.object({
        type: z.string().min(1),
        number: z.string().min(8)
      })
    })
  })
});

export const createSubscriptionSchema = z.preprocess((reqObj: any) => {
  if (reqObj) {
    const planId = reqObj.body?.planId;
    const establishmentId = reqObj.usuario?.estabelecimento;
    const data = reqObj.body?.data;

    reqObj.params = { ...reqObj.params, planId, establishmentId };
    reqObj.body = data;
  }
  return reqObj;
}, createSubscriptionBaseSchema);

export type CreateSubscriptionDTO = z.infer<typeof createSubscriptionBaseSchema>['body'];

export type CreateSubscription = {
    initialDate: Date;
    establishment: Establishment;
    expirationDate: Date;
    plan: Plan;
};

export type CreateSubscriptionParams = {
    email: string;
    planId: number;
    establishmentId: number;
};