import { z } from 'zod';
import { OrderStatus, ServiceType } from '../../enum';
import { safeString } from '../../utils/safeZod'; 

const orderStatusValues = Object.values(OrderStatus) as [string, ...string[]];
const serviceTypeValues = Object.values(ServiceType) as [string, ...string[]];

export const createOrderSchema = z.object({
  params: z.object({
    comandaId: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.enum(orderStatusValues),
    serviceType: z.enum(serviceTypeValues),
    tripPrice: z.coerce.number().positive().optional(),
    
    itens: z.array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        productVariationId: z.coerce.number().int().positive().optional(),
        observation: safeString(0, 255).optional().nullable()
      }).strict()
    )
  }).strict() 
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    comandaId: z.coerce.number().int().positive(),
    orderId: z.coerce.number().int().positive()
  }),
  body: z.object({
    status: z.enum(orderStatusValues)
  }).strict()
});