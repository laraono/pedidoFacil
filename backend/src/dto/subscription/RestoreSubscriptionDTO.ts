import { z } from 'zod';

export const restoreSubscriptionSchema = z.object({
  params: z.object({
    subscriptionId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    cardToken: z.string().min(1),
    payerEmail: z.email(),
  })
});

export type RestoreSubscriptionDTO = z.infer<typeof restoreSubscriptionSchema>['body'];