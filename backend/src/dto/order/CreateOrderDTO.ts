import { z } from 'zod';
import { OrderStatus } from '../../enum';
import { safeString } from '../../utils/safeZod';

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];

export const createOrderSchema = z.object({
  body: z.object({
    status: z.enum(orderStatusValues),
    serviceType: z.string().optional(),
    establishmentId: z.number().int().positive().optional(), 
    comandaId: z.number().int().positive(),
    itens: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        productVariationId: z.number().int().positive().optional().nullable(),
        observation: safeString(0, 255).optional().nullable()
      }).strict()
    ).min(1, "O pedido deve ter pelo menos um item")
  }).strict()
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(orderStatusValues)
  }).strict()
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>['body'];