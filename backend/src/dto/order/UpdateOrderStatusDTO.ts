import { z } from 'zod';
import { OrderStatus } from '../../enum';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(orderStatusValues)
  }).strict()
});

export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>['body'];